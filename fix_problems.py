import re

with open('backend/app/routers/problems.py', 'r') as f:
    content = f.read()

# N3: AbandonRequest hint_used
content = content.replace(
    "class AbandonRequest(BaseModel):\n    problem_id: str\n    compile_error_count: int = 0\n    time_on_task_seconds: float = 0\n    attempt_count: int = 0",
    "class AbandonRequest(BaseModel):\n    problem_id: str\n    compile_error_count: int = 0\n    time_on_task_seconds: float = 0\n    attempt_count: int = 0\n    hint_used: bool = False"
)

# N1: get_problem
content = content.replace(
    'res = supabase.table("problems").select("*").eq("id", problem_id).execute()',
    'res = supabase.table("problems").select("*").eq("problem_id", problem_id).execute()'
)

# N1: get_mastery_vector
content = content.replace(
    'res = supabase.table("mastery_scores").select("concept, mastery_probability").eq("user_id", user_id).execute()',
    'res = supabase.table("mastery_scores").select("concept_tag, mastery_probability").eq("student_id", user_id).execute()'
)
content = content.replace(
    'return {row["concept"]: float(row["mastery_probability"]) for row in res.data} if res.data else {}',
    'return {row["concept_tag"]: float(row["mastery_probability"]) for row in res.data} if res.data else {}'
)

# N1: get_unsolved_problem
content = content.replace(
    'prob_res = supabase.table("problems").select("*").eq("concept", concept).eq("difficulty", difficulty).execute()',
    'prob_res = supabase.table("problems").select("*").eq("concept_tag", concept).eq("difficulty_level", difficulty).execute()'
)
content = content.replace(
    'prob_res = supabase.table("problems").select("*").eq("concept", concept).execute()',
    'prob_res = supabase.table("problems").select("*").eq("concept_tag", concept).execute()'
)
content = content.replace(
    'unsolved = [p for p in problems if str(p["id"]) not in solved_ids]',
    'unsolved = [p for p in problems if str(p["problem_id"]) not in solved_ids]'
)
content = content.replace(
    '"id": selected["id"],\n        "title": selected["title"],\n        "concept": selected["concept"],\n        "difficulty": selected["difficulty"]',
    '"id": selected["problem_id"],\n        "title": selected["title"],\n        "concept": selected["concept_tag"],\n        "difficulty": selected["difficulty_level"]'
)

# N5: select_next_problem
content = content.replace(
    'target_difficulty = "medium"\n    \n    unlocked = get_unlocked_concepts(mastery_vector)',
    'target_difficulty = "medium"\n    elif action == "hint_augmented":\n        pass\n    \n    unlocked = get_unlocked_concepts(mastery_vector)'
)
content = content.replace(
    'return await get_unsolved_problem(user_id, target_concept, target_difficulty)',
    'selected = await get_unsolved_problem(user_id, target_concept, target_difficulty)\n    if action == "hint_augmented" and selected:\n        selected["hint_pre_expanded"] = True\n    return selected'
)

# N1: submit_code concept
content = content.replace(
    'concept = problem["concept"]',
    'concept = problem["concept_tag"]'
)


# N4: Session auto-increment in submit_code
old_session_logic = """sessions_res = supabase.table("sessions").select("session_id").eq("student_id", user_id).order("started_at", desc=True).limit(1).execute()
    session_id = sessions_res.data[0]["session_id"] if sessions_res.data else None
    if not session_id:
        new_session = supabase.table("sessions").insert({"student_id": user_id, "session_number": 1}).execute()
        if new_session.data:
            session_id = new_session.data[0]["session_id"]"""

new_session_logic = """sessions_res = supabase.table("sessions").select("session_id").eq("student_id", user_id).order("started_at", desc=True).limit(1).execute()
    session_id = sessions_res.data[0]["session_id"] if sessions_res.data else None
    if not session_id:
        count_res = supabase.table("sessions").select("session_number").eq("student_id", user_id).order("session_number", desc=True).limit(1).execute()
        next_num = (count_res.data[0]["session_number"] + 1) if count_res.data else 1
        new_session = supabase.table("sessions").insert({"student_id": user_id, "session_number": next_num}).execute()
        if new_session.data:
            session_id = new_session.data[0]["session_id"]"""

content = content.replace(old_session_logic, new_session_logic)


# N2: Serialize dict instead of list
content = content.replace(
    'a_matrices_json = [a.tolist() for a in agent.A[user_id]]',
    'a_matrices_json = {str(k): v.tolist() for k, v in agent.A[user_id].items()}'
)
content = content.replace(
    'b_vectors_json = [b.tolist() for b in agent.b[user_id]]',
    'b_vectors_json = {str(k): v.tolist() for k, v in agent.b[user_id].items()}'
)

# abandon_problem hint_used mapping
content = content.replace(
    '"hint_used": False,',
    '"hint_used": req.hint_used,'
)

# N9: diagnostic and get_all_problems and get_single_problem fixes
# diagnostic:
content = content.replace(
    'res = supabase.table("problems").select("*").eq("concept", concept).eq("difficulty", "easy").limit(2).execute()',
    'res = supabase.table("problems").select("*").eq("concept_tag", concept).eq("difficulty_level", "easy").limit(2).execute()'
)
# get_all_problems
old_get_all = """@router.get("/problems")
async def get_all_problems():
    supabase = get_supabase()
    res = supabase.table("problems").select("id, title, difficulty_level, concept_tag").execute()
    return {"status": "success", "data": res.data}"""

new_get_all = """@router.get("/problems")
async def get_all_problems():
    supabase = get_supabase()
    res = supabase.table("problems").select("problem_id, title, difficulty_level, concept_tag").execute()
    data = [{"id": p["problem_id"], "title": p["title"], "difficulty_level": p["difficulty_level"], "concept_tag": p["concept_tag"]} for p in (res.data or [])]
    return {"status": "success", "data": data}"""
content = content.replace(old_get_all, new_get_all)

# get_single_problem
old_single = """@router.get("/problems/{problem_id}")
async def get_single_problem(problem_id: str):
    supabase = get_supabase()
    res = supabase.table("problems").select("*").eq("id", problem_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"status": "success", "problem": res.data[0]}"""
new_single = """@router.get("/problems/{problem_id}")
async def get_single_problem(problem_id: str):
    supabase = get_supabase()
    res = supabase.table("problems").select("*").eq("problem_id", problem_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Problem not found")
    p = res.data[0]
    p["id"] = p["problem_id"]
    return {"status": "success", "problem": p}"""
content = content.replace(old_single, new_single)


with open('backend/app/routers/problems.py', 'w') as f:
    f.write(content)
print("Done fixing problems.py")
