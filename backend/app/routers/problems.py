from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import httpx
import json
import numpy as np

from app.core.config import settings
from app.core.database import get_supabase_admin, get_supabase_user
from app.core.dependencies import get_current_user, CurrentUser
from app.services.bkt import compute_effective_weight, update_mastery, get_bkt_params
from app.services.linucb import LinUCBAgent, get_unlocked_concepts, get_weakest_unlocked, PREREQUISITE_GRAPH, MASTERY_THRESHOLD
from app.services.gemini import generate_explanation
from app.services.piston import run_test_cases
from app.core.rate_limit import limiter

router = APIRouter(prefix="/api", tags=["core"])

from pydantic import BaseModel, Field

# Request Models

from pydantic import BaseModel

class StartRequest(BaseModel):
    problem_id: str

@router.post("/start")
async def start_problem(req: StartRequest, user: CurrentUser = Depends(get_current_user)):
    user_id = user.user_id
    import time
    supabase = get_supabase_user(user.jwt)
    supabase.table("active_problem_state").upsert({
        "student_id": user_id,
        "problem_id": _resolve_problem_id(req.problem_id),
        "start_time": time.time(),
        "hint_used": False
    }).execute()
    return {"status": "success"}

class SubmitRequest(BaseModel):
    problem_id: str
    code: str = Field(..., max_length=50000)
    language: str = "python"
    compile_error_count: int = 0
    time_on_task_seconds: float = 0
    hint_used: bool = False
    hint_used_at_attempt: Optional[int] = None
    attempt_count: int = 1

class SubmitResponse(BaseModel):
    verdict: str
    test_cases_passed: int
    test_cases_total: int
    mastery: dict
    next_problem: dict
    effective_weight: float
    explanation_status: str
    event_id: Optional[str] = None

class AbandonRequest(BaseModel):
    problem_id: str
    compile_error_count: int = 0
    time_on_task_seconds: float = 0
    attempt_count: int = 0
    hint_used: bool = False

import uuid as _uuid

def _resolve_problem_id(problem_id_or_slug: str) -> str:
    """Problems are stored by UUID. The frontend references them by slug
    (e.g. 'two-sum'). Treat anything that's not a valid UUID as a slug and
    derive the deterministic uuid5 the seeder used."""
    try:
        _uuid.UUID(problem_id_or_slug)
        return problem_id_or_slug
    except Exception:
        return str(_uuid.uuid5(_uuid.NAMESPACE_DNS, f"adaptcode.problem.{problem_id_or_slug}"))


async def get_problem(jwt: str, problem_id: str):
    pid = _resolve_problem_id(problem_id)
    supabase = get_supabase_user(jwt)
    res = supabase.table("problems").select("*").eq("problem_id", pid).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Problem not found")
    return res.data[0]

async def get_mastery_vector(jwt: str, user_id: str):
    supabase = get_supabase_user(jwt)
    res = supabase.table("mastery_scores").select("concept_tag, mastery_probability").eq("student_id", user_id).execute()
    return {row["concept_tag"]: float(row["mastery_probability"]) for row in res.data} if res.data else {}

async def get_recent_events(jwt: str, user_id: str, limit: int = 5):
    supabase = get_supabase_user(jwt)
    res = supabase.table("session_events").select("*").eq("student_id", user_id).order("timestamp", desc=True).limit(limit).execute()
    return res.data or []

async def save_mastery(jwt: str, user_id: str, concept: str, mastery: float):
    supabase = get_supabase_user(jwt)
    supabase.table("mastery_scores").upsert({
        "student_id": user_id,
        "concept_tag": concept,
        "mastery_probability": mastery
    }, on_conflict="student_id,concept_tag").execute()

async def get_unsolved_problem(jwt: str, user_id: str, concept: str, difficulty: str):
    supabase = get_supabase_user(jwt)
    # Find all problems matching concept and difficulty
    prob_res = supabase.table("problems").select("*").eq("concept_tag", concept).eq("difficulty_level", difficulty).execute()
    problems = prob_res.data or []
    
    if not problems:
        # Fallback to any difficulty for this concept
        prob_res = supabase.table("problems").select("*").eq("concept_tag", concept).execute()
        problems = prob_res.data or []
        if not problems:
            # Absolute fallback
            prob_res = supabase.table("problems").select("*").limit(1).execute()
            problems = prob_res.data or []
            if not problems:
                return {}
    
    # Try to find one not solved by user
    solved_res = supabase.table("session_events").select("problem_id").eq("student_id", user_id).eq("final_verdict", "Accepted").execute()
    solved_ids = {row["problem_id"] for row in (solved_res.data or [])}
    
    unsolved = [p for p in problems if str(p["problem_id"]) not in solved_ids]
    selected = unsolved[0] if unsolved else problems[0]
    
    return {
        "id": selected["problem_id"],
        "title": selected["title"],
        "concept": selected["concept_tag"],
        "difficulty": selected["difficulty_level"]
    }

async def select_next_problem(jwt: str, action: str, current_concept: str, current_difficulty: str, mastery_vector: dict, user_id: str):
    difficulty_order = ["easy", "medium", "hard"]
    try:
        current_idx = difficulty_order.index(current_difficulty)
    except ValueError:
        current_idx = 0
        
    target_difficulty = current_difficulty
    target_concept = current_concept
    
    if action == "easier_problem":
        target_difficulty = difficulty_order[max(0, current_idx - 1)]
    elif action == "harder_problem":
        target_difficulty = difficulty_order[min(2, current_idx + 1)]
    elif action == "redirect_prerequisite":
        prereqs = PREREQUISITE_GRAPH.get(current_concept, [])
        unmastered_prereqs = [p for p in prereqs if mastery_vector.get(p, 0) < MASTERY_THRESHOLD]
        if unmastered_prereqs:
            target_concept = min(unmastered_prereqs, key=lambda p: mastery_vector.get(p, 0))
        else:
            target_concept = get_weakest_unlocked(mastery_vector)
        target_difficulty = "medium"
    elif action == "hint_augmented":
        pass
    
    unlocked = get_unlocked_concepts(mastery_vector)
    if target_concept not in unlocked:
        target_concept = get_weakest_unlocked(mastery_vector)
        
    selected = await get_unsolved_problem(jwt, user_id, target_concept, target_difficulty)
    if action == "hint_augmented" and selected:
        selected["hint_pre_expanded"] = True
    return selected

@router.post("/submit", response_model=SubmitResponse)
@limiter.limit("20/minute")
async def submit_code(request: Request, req: SubmitRequest, background_tasks: BackgroundTasks, user: CurrentUser = Depends(get_current_user)):
    user_id = user.user_id
    # Frontend may send a slug ("two-sum"); every downstream column is uuid-typed,
    # so normalize once at the top and reuse everywhere.
    problem_uuid = _resolve_problem_id(req.problem_id)
    req.problem_id = problem_uuid
    supabase = get_supabase_user(user.jwt)
    problem = await get_problem(user.jwt, problem_uuid)
    user_mastery = await get_mastery_vector(user.jwt, user_id)
    recent_events = await get_recent_events(user.jwt, user_id, limit=5)
    
    # 1. Execute via Piston (harness wraps function-style code for function-based problems)
    test_cases = problem.get("test_cases", [])
    starter = problem.get("starter_code") or {}
    function_meta = starter.get("_meta") if isinstance(starter, dict) else None
    execution = await run_test_cases(req.code, req.language, test_cases, function_meta=function_meta)
    
    # 2. Compute effective correctness
    result_binary = 1 if execution["verdict"] == "accepted" else 0

    import time
    res = supabase.table("active_problem_state").select("start_time").eq("student_id", user_id).eq("problem_id", req.problem_id).execute()
    server_time = int(req.time_on_task_seconds)
    if res.data:
        server_time = int(time.time() - float(res.data[0]["start_time"]))
        # clamp
        if server_time < 0: server_time = 1
        if server_time > 3600: server_time = 3600

    w = compute_effective_weight(
        result=result_binary,
        hint_used=req.hint_used,
        attempt_count=req.attempt_count,
        compile_errors=req.compile_error_count,
        time_seconds=server_time
    )
    
    # 3. Update BKT mastery
    concept = problem["concept_tag"]
    bkt_params = get_bkt_params(concept)
    concept_L0 = bkt_params[0] if isinstance(bkt_params, tuple) else bkt_params.get("L0", 0.3)
    old_mastery = user_mastery.get(concept, concept_L0)
    new_mastery = update_mastery(old_mastery, w, concept)
    user_mastery[concept] = new_mastery
    await save_mastery(user.jwt, user_id, concept, new_mastery)
    
    # 4. Save Session Event
    VERDICT_MAP = {
        "accepted": "Accepted",
        "wrong_answer": "Wrong Answer",
        "compile_error": "Compilation Error",
        "runtime_error": "Runtime Error",
        "time_limit_exceeded": "Time Limit Exceeded",
        "abandoned": "Abandoned"
    }
    mapped_verdict = VERDICT_MAP.get(execution["verdict"], "Abandoned")

    sessions_res = supabase.table("sessions").select("session_id").eq("student_id", user_id).order("started_at", desc=True).limit(1).execute()
    session_id = sessions_res.data[0]["session_id"] if sessions_res.data else None
    if not session_id:
        count_res = supabase.table("sessions").select("session_number").eq("student_id", user_id).order("session_number", desc=True).limit(1).execute()
        next_num = (count_res.data[0]["session_number"] + 1) if count_res.data else 1
        new_session = supabase.table("sessions").insert({"student_id": user_id, "session_number": next_num}).execute()
        if new_session.data:
            session_id = new_session.data[0]["session_id"]

    event_res = supabase.table("session_events").insert({
        "session_id": session_id,
        "student_id": user_id,
        "problem_id": req.problem_id,
        "concept_tag": concept,
        "difficulty_level": problem.get("difficulty_level", "medium"),
        "compile_errors": req.compile_error_count,
        "time_on_task_seconds": server_time,
        "hint_used": req.hint_used,
        "attempt_count": req.attempt_count,
        "abandoned": False,
        "final_verdict": mapped_verdict,
        "reward_signal": w
    }).execute()
    event_id = event_res.data[0]["event_id"] if event_res.data else None
    
    # 5. LinUCB
    agent = LinUCBAgent(d=16, alpha=1.0)
    
    # Load the student's a_matrix / b_vector from DB
    res = supabase.table("agent_state").select("*").eq("student_id", "00000000-0000-0000-0000-000000000000").execute()
    db_row = res.data[0] if res.data else {}
    agent.load_state(db_row)

    x = agent.build_context(user_mastery, recent_events)
    allowed = agent.get_allowed_actions(user_mastery, concept)
    

    action_idx = agent.select_action(x, allowed)
    
    # FR-5: Diagnostic Escalation Thresholds
    if req.attempt_count >= 3 or req.compile_error_count >= 5 or server_time > 1200:
        if 3 in allowed:
            action_idx = 3

    
    consecutive_same_diff = 0
    curr_diff = problem.get("difficulty_level", "medium")
    for event in recent_events:
        if event.get("difficulty_level") == curr_diff:
            consecutive_same_diff += 1
        else:
            break
            
    reward = agent.compute_reward(
        verdict=execution["verdict"],
        hint_used=req.hint_used,
        w=w,
        prev_difficulty=recent_events[0].get("difficulty_level", "medium") if recent_events else "medium",
        curr_difficulty=curr_diff,
        consecutive_same_diff=consecutive_same_diff
    )
    agent.update(action_idx, x, reward)
    
    # Save back to DB
    a_matrices_json = {str(k): v.tolist() for k, v in agent.A.items()}
    b_vectors_json = {str(k): v.tolist() for k, v in agent.b.items()}
    supabase.table("agent_state").upsert({
        "student_id": "00000000-0000-0000-0000-000000000000",
        "a_matrices": a_matrices_json,
        "b_vectors": b_vectors_json
    }).execute()
    
    next_prob = await select_next_problem(
        jwt=user.jwt,
        action=agent.ACTIONS[action_idx],
        current_concept=concept,
        current_difficulty=problem.get("difficulty_level", "medium"),
        mastery_vector=user_mastery,
        user_id=user_id,
    )
    
    # 6. Explanation
    explanation_status = "not_needed"
    if execution["verdict"] != "accepted" and event_id:
        explanation_status = "pending"
        background_tasks.add_task(
            generate_explanation,
            session_event_id=event_id,
            user_id=user_id,
            code=req.code,
            error_output=execution.get("error_output", ""),
            concept=concept,
            verdict=execution["verdict"]
        )
        
    return SubmitResponse(
        verdict=execution["verdict"],
        test_cases_passed=execution["passed"],
        test_cases_total=execution["total"],
        mastery=user_mastery,
        next_problem=next_prob,
        effective_weight=w,
        explanation_status=explanation_status,
        event_id=event_id
    )

@router.post("/abandon")
async def abandon_problem(req: AbandonRequest, user: CurrentUser = Depends(get_current_user)):
    user_id = user.user_id
    req.problem_id = _resolve_problem_id(req.problem_id)
    supabase = get_supabase_user(user.jwt)
    problem = await get_problem(user.jwt, req.problem_id)
    concept = problem["concept_tag"]
    user_mastery = await get_mastery_vector(user.jwt, user_id)

    bkt_params = get_bkt_params(concept)
    concept_L0 = bkt_params[0] if isinstance(bkt_params, tuple) else bkt_params.get("L0", 0.3)
    old_mastery = user_mastery.get(concept, concept_L0)
    new_mastery = update_mastery(old_mastery, 0.0, concept)
    await save_mastery(user.jwt, user_id, concept, new_mastery)
    server_time = int(req.time_on_task_seconds)
    
    sessions_res = supabase.table("sessions").select("session_id").eq("student_id", user_id).order("started_at", desc=True).limit(1).execute()
    session_id = sessions_res.data[0]["session_id"] if sessions_res.data else None
    if not session_id:
        count_res = supabase.table("sessions").select("session_number").eq("student_id", user_id).order("session_number", desc=True).limit(1).execute()
        next_num = (count_res.data[0]["session_number"] + 1) if count_res.data else 1
        new_session = supabase.table("sessions").insert({"student_id": user_id, "session_number": next_num}).execute()
        if new_session.data:
            session_id = new_session.data[0]["session_id"]

    supabase.table("session_events").insert({
        "session_id": session_id,
        "student_id": user_id,
        "problem_id": req.problem_id,
        "concept_tag": concept,
        "difficulty_level": problem.get("difficulty_level", "medium"),
        "compile_errors": req.compile_error_count,
        "time_on_task_seconds": server_time,
        "hint_used": req.hint_used,
        "attempt_count": req.attempt_count,
        "abandoned": True,
        "final_verdict": "Abandoned",
        "reward_signal": 0.0
    }).execute()
    
    return {"status": "recorded"}

@router.get("/explanation/{event_id}")
async def get_explanation_status(event_id: str, user: CurrentUser = Depends(get_current_user)):
    user_id = user.user_id
    supabase = get_supabase_user(user.jwt)
    res = supabase.table("explanations").select("*").eq("session_event_id", event_id).execute()
    if not res.data:
        return {"status": "pending"}
    
    explanation = res.data[0]
    return {
        "status": explanation["status"],
        "what_went_wrong": explanation.get("what_went_wrong"),
        "why_approach_fails": explanation.get("why_approach_fails"),
        "concept_to_review": explanation.get("concept_to_review"),
    }



@router.get("/next-problem")
async def get_next_problem_endpoint(user: CurrentUser = Depends(get_current_user)):
    user_id = user.user_id
    mastery = await get_mastery_vector(user.jwt, user_id)
    recent_events = await get_recent_events(user.jwt, user_id, limit=5)
    weakest = get_weakest_unlocked(mastery)
    
    agent = LinUCBAgent(d=16, alpha=1.0)
    supabase = get_supabase_user(user.jwt)
    res = supabase.table("agent_state").select("*").eq("student_id", "00000000-0000-0000-0000-000000000000").execute()
    db_row = res.data[0] if res.data else {}
    agent.load_state(db_row)

    x = agent.build_context(mastery, recent_events)
    allowed = agent.get_allowed_actions(mastery, weakest)
    
    action = agent.select_action(x, allowed)
    
    next_problem = await select_next_problem(
        jwt=user.jwt,
        action=agent.ACTIONS[action],
        current_concept=weakest,
        current_difficulty="medium",
        mastery_vector=mastery,
        user_id=user_id,
    )
    return next_problem

@router.get("/diagnostic")
async def run_diagnostic(user: CurrentUser = Depends(get_current_user)):
    user_id = user.user_id
    diagnostic_concepts = ["basic_syntax", "loops", "arrays", "strings", "hashing"]
    problems = []
    supabase = get_supabase_user(user.jwt)
    
    for concept in diagnostic_concepts:
        res = supabase.table("problems").select("*").eq("concept_tag", concept).eq("difficulty_level", "easy").limit(2).execute()
        if res.data:
            problems.extend(res.data)
            
    return {"diagnostic_problems": problems, "total": len(problems)}
@router.get("/problems")
async def get_all_problems():
    # Problems are public catalogue data — admin client, no per-user JWT needed.
    supabase = get_supabase_admin()
    res = supabase.table("problems").select("problem_id, title, difficulty_level, concept_tag").execute()
    data = [{"id": p["problem_id"], "title": p["title"], "difficulty_level": p["difficulty_level"], "concept_tag": p["concept_tag"]} for p in (res.data or [])]
    return {"status": "success", "data": data}

@router.get("/problems/{problem_id}")
async def get_single_problem(problem_id: str, user: CurrentUser = Depends(get_current_user)):
    """Return a problem for the signed-in student.

    Hidden test cases are stripped before the response leaves the server — a
    student with the hidden inputs/outputs could trivially hard-code a
    stdin→stdout lookup and bypass the grader. Only visible example cases
    (used to describe the problem) are returned.
    """
    pid = _resolve_problem_id(problem_id)
    supabase = get_supabase_admin()
    res = supabase.table("problems").select("*").eq("problem_id", pid).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Problem not found")
    problem = dict(res.data[0])
    tcs = problem.get("test_cases") or []
    if isinstance(tcs, list):
        problem["test_cases"] = [tc for tc in tcs if not (isinstance(tc, dict) and tc.get("is_hidden"))]
    return {"status": "success", "problem": problem}
