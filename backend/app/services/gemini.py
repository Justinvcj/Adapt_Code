import httpx
import asyncio
from typing import Optional
from app.core.config import settings
from app.core.database import get_supabase

# Free tier: 15 RPM, 1,500 RPD, 1,000,000 TPM — no credit card needed
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# 12 concept-specific prompt templates
CONCEPT_PROMPTS = {
    "basic_syntax": "Focus on variable declarations, data types, operators, and control flow basics.",
    "loops": "Focus on loop invariants, termination conditions, off-by-one errors, and iteration patterns.",
    "arrays": "Focus on indexing, bounds checking, in-place vs copy operations, and common array traversal patterns.",
    "strings": "Focus on string immutability, character-level operations, substring methods, and encoding.",
    "hashing": "Focus on hash map usage for O(1) lookup, choosing the right key, and collision handling.",
    "two_pointers": "Focus on pointer initialization, movement conditions, and when two-pointer technique applies vs brute force.",
    "sliding_window": "Focus on window boundaries, expansion/contraction conditions, and what state to track inside the window.",
    "recursion": "Focus on base case identification, recursive case reduction, and the call stack.",
    "backtracking": "Focus on choice-constraint-goal structure, pruning conditions, and state restoration after backtrack.",
    "binary_search": "Focus on search space definition, midpoint calculation, and how the condition eliminates half the space.",
    "trees": "Focus on traversal order (pre/in/post), recursive structure, and edge cases (null nodes, single child).",
    "dynamic_programming": "Focus on overlapping subproblems, optimal substructure, state definition, and transition relation.",
}

async def generate_explanation(
    session_event_id: str,
    user_id: str,
    code: str,
    error_output: str,
    concept: str,
    verdict: str
) -> Optional[dict]:
    """
    Generate a 3-part explanation via Gemini (async, non-blocking).
    Called as a background task — never blocks the submission response.
    
    Retries with exponential backoff on 429 (rate limit).
    Falls back to a generic explanation after 3 retries.
    """
    concept_focus = CONCEPT_PROMPTS.get(concept, "")
    
    prompt = f"""You are a programming tutor explaining why a student's code failed.

STUDENT'S CODE:
```
{code}
```

EXECUTION RESULT: {verdict}
ERROR/OUTPUT: {error_output}

CONCEPT BEING PRACTICED: {concept}
{concept_focus}

Respond with EXACTLY this JSON structure, nothing else:
{{
  "what_went_wrong": "One paragraph explaining the specific error in the student's code. Reference exact line numbers and variable names from their code.",
  "why_approach_fails": "One paragraph explaining why their overall approach doesn't work for this class of problem. Do NOT give the solution.",
  "concept_to_review": "One paragraph naming the specific concept they should review and ONE concrete exercise they can do to build that understanding."
}}

RULES:
- Do NOT give the correct solution or corrected code.
- Do NOT suggest library functions or APIs that don't exist in standard {concept}.
- Reference ONLY what you can see in the student's code and the error output.
- Keep each part to 2-3 sentences maximum.
- Respond with valid JSON only. No markdown, no backticks, no preamble."""

    url = f"{GEMINI_URL}?key={settings.GEMINI_API_KEY}"
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 500,
            "responseMimeType": "application/json"  # Forces JSON output
        }
    }
    
    headers = {"Content-Type": "application/json"}
    
    supabase_client = get_supabase()
    
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                
                if response.status_code == 429:
                    # Rate limited — wait and retry
                    wait = 2 ** attempt + 1
                    await asyncio.sleep(wait)
                    continue
                
                response.raise_for_status()
                data = response.json()
                content = data["candidates"][0]["content"]["parts"][0]["text"]
                
                # Parse JSON response
                import json
                explanation = json.loads(content.strip())
                
                # Validate structure
                required_keys = ["what_went_wrong", "why_approach_fails", "concept_to_review"]
                if not all(k in explanation for k in required_keys):
                    raise ValueError("Missing required keys")
                
                # Save to database
                supabase_client.table("explanations").upsert({
                    "session_event_id": session_event_id,
                    "user_id": user_id,
                    "what_went_wrong": explanation["what_went_wrong"],
                    "why_approach_fails": explanation["why_approach_fails"],
                    "concept_to_review": explanation["concept_to_review"],
                    "status": "completed"
                }).execute()
                
                return explanation
                
        except Exception as e:
            if attempt == 2:
                # Final fallback — save generic explanation
                supabase_client.table("explanations").upsert({
                    "session_event_id": session_event_id,
                    "user_id": user_id,
                    "what_went_wrong": f"Your code failed with: {verdict}. Review the error output carefully.",
                    "why_approach_fails": f"Review the {concept} concept and try a different approach.",
                    "concept_to_review": f"Focus on {concept}: {CONCEPT_PROMPTS.get(concept, '')}",
                    "status": "failed"
                }).execute()
    
    return None
