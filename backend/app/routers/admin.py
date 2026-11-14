from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.core.database import get_supabase_admin, get_supabase_user, new_supabase_admin
from app.core.dependencies import get_current_user, CurrentUser, require_admin
from app.services.audit import log_event as audit_log

router = APIRouter(prefix="/api/admin", tags=["admin"])


class TestCase(BaseModel):
    input: str = ""
    expected_output: str = ""


class ProblemCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    concept_tag: str = Field(min_length=1, max_length=50)
    difficulty_level: str = Field(pattern="^(easy|medium|hard)$")
    test_cases: List[TestCase] = Field(default_factory=list)
    hint_text: Optional[str] = None
    solution_code: Optional[str] = None
    solution_explanation: Optional[str] = None
    starter_code: Optional[Dict[str, str]] = None


class ProblemUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    concept_tag: Optional[str] = Field(default=None, min_length=1, max_length=50)
    difficulty_level: Optional[str] = Field(default=None, pattern="^(easy|medium|hard)$")
    test_cases: Optional[List[TestCase]] = None
    hint_text: Optional[str] = None
    solution_code: Optional[str] = None
    solution_explanation: Optional[str] = None
    starter_code: Optional[Dict[str, str]] = None


@router.get("/users")
async def get_all_users(user: CurrentUser = Depends(require_admin)) -> Dict[str, Any]:
    user_id = user.user_id

    try:
        # new_supabase_admin() avoids the shared-singleton RLS-drift bug — the
        # cached admin client gets re-signed to the last login's identity, so a
        # subsequent service_role query silently returns only that user's rows.
        supabase = new_supabase_admin()
        users = supabase.table("users").select("user_id, email, display_name, created_at, role").execute()
        return {"status": "success", "data": users.data or []}
    except Exception as e:
        from app.core.logging import logger
        logger.error("operation failed", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred.")

@router.get("/problems")
async def admin_list_problems(user: CurrentUser = Depends(require_admin)) -> Dict[str, Any]:
    """Admin listing: every problem with its full payload (vs the public catalog
    which omits hidden test cases and solution content)."""
    try:
        supabase = new_supabase_admin()
        res = supabase.table("problems").select("*").order("created_at", desc=True).execute()
        return {"status": "success", "data": res.data or []}
    except Exception:
        from app.core.logging import logger
        logger.error("operation failed", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred.")


@router.post("/problems", status_code=201)
async def admin_create_problem(req: ProblemCreate, user: CurrentUser = Depends(require_admin)) -> Dict[str, Any]:
    try:
        supabase = new_supabase_admin()
        payload = req.model_dump()
        payload["test_cases"] = [tc.model_dump() if hasattr(tc, "model_dump") else tc for tc in req.test_cases]
        res = supabase.table("problems").insert(payload).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Insert returned no row.")
        row = res.data[0]
        audit_log("admin_problem_create", actor=user.user_id, target=row.get("problem_id"),
                   metadata={"title": row.get("title"), "concept_tag": row.get("concept_tag")})
        return {"status": "success", "data": row}
    except HTTPException:
        raise
    except Exception:
        from app.core.logging import logger
        logger.error("operation failed", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred.")


@router.patch("/problems/{problem_id}")
async def admin_update_problem(problem_id: str, req: ProblemUpdate, user: CurrentUser = Depends(require_admin)) -> Dict[str, Any]:
    try:
        supabase = new_supabase_admin()
        payload = {k: v for k, v in req.model_dump(exclude_none=True).items()}
        if "test_cases" in payload and req.test_cases is not None:
            payload["test_cases"] = [tc.model_dump() if hasattr(tc, "model_dump") else tc for tc in req.test_cases]
        if not payload:
            raise HTTPException(status_code=400, detail="No fields to update.")
        res = supabase.table("problems").update(payload).eq("problem_id", problem_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Problem not found.")
        audit_log("admin_problem_update", actor=user.user_id, target=problem_id,
                   metadata={"fields_changed": sorted(payload.keys())})
        return {"status": "success", "data": res.data[0]}
    except HTTPException:
        raise
    except Exception:
        from app.core.logging import logger
        logger.error("operation failed", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred.")


@router.delete("/problems/{problem_id}")
async def admin_delete_problem(problem_id: str, user: CurrentUser = Depends(require_admin)) -> Dict[str, Any]:
    try:
        supabase = new_supabase_admin()
        res = supabase.table("problems").delete().eq("problem_id", problem_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Problem not found.")
        audit_log("admin_problem_delete", actor=user.user_id, target=problem_id,
                   metadata={"title": res.data[0].get("title")})
        return {"status": "success", "deleted_id": problem_id}
    except HTTPException:
        raise
    except Exception:
        from app.core.logging import logger
        logger.error("operation failed", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred.")


@router.get("/stats")
async def get_platform_stats(user: CurrentUser = Depends(require_admin)) -> Dict[str, Any]:
    user_id = user.user_id

    try:
        supabase = new_supabase_admin()
        users = supabase.table("users").select("user_id", count="exact").execute()
        sessions = supabase.table("sessions").select("session_id", count="exact").execute()
        events = supabase.table("session_events").select("event_id", count="exact").execute()
        
        return {
            "status": "success", 
            "data": {
                "total_users": users.count if hasattr(users, "count") else len(users.data or []),
                "total_sessions": sessions.count if hasattr(sessions, "count") else len(sessions.data or []),
                "total_submissions": events.count if hasattr(events, "count") else len(events.data or [])
            }
        }
    except Exception as e:
        from app.core.logging import logger
        logger.error("operation failed", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred.")
