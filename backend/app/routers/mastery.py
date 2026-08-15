from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase
from app.core.dependencies import get_current_user, bkt_doctor
from app.services.prerequisites import can_access_concept, PREREQUISITE_GRAPH

router = APIRouter(prefix="/api", tags=["mastery"])
supabase = get_supabase()

@router.get("/mastery")
async def get_mastery(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        mastery_res = supabase.table("mastery_scores").select("*").eq("student_id", user_id).execute()
        mastery_dict = {row['concept_tag']: float(row['mastery_probability']) for row in mastery_res.data}
        
        events_res = supabase.table("session_events").select("concept_tag, final_verdict").eq("student_id", user_id).execute()
        events = events_res.data
        
        concepts = ['basic_syntax', 'loops', 'arrays', 'strings', 'hashing', 'two_pointers', 
                    'sliding_window', 'recursion', 'backtracking', 'binary_search', 'trees', 'dynamic_programming']
        
        result = []
        for c in concepts:
            c_events = [e for e in events if e['concept_tag'] == c]
            attempted = len(c_events)
            solved = len([e for e in c_events if e['final_verdict'] == 'Accepted'])
            
            prereqs = PREREQUISITE_GRAPH.get(c, [])
            
            result.append({
                "concept_tag": c,
                "mastery_probability": mastery_dict.get(c, bkt_doctor.p_prior),
                "is_unlocked": can_access_concept(c, mastery_dict),
                "prerequisites": prereqs,
                "problems_attempted": attempted,
                "problems_solved": solved
            })
            
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
