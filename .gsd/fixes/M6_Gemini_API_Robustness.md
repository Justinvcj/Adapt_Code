# M6: Gemini AI Polling & API Security

## Objective
Mitigate frontend memory leaks and secure the Google Gemini API integration.

## Context & Architectural Flaw
- **Memory Leak:** If the Gemini API background task fails silently or stalls, the frontend polls `/api/explanation/{id}` infinitely every 2 seconds.
- **Key Exposure:** `gemini.py` injects the API key directly into the query string, exposing it to proxy logs and history.

## Code-Level Execution Blueprint
1. **Target:** `backend/app/services/gemini.py`
   - Remove `?key=` from URL. 
   - Inject via `headers = {"x-goog-api-key": settings.GEMINI_API_KEY, "Content-Type": "application/json"}`.
2. **Target:** `frontend/src/app/(app)/problem/[id]/page.tsx`
   - Introduce a `pollCount` variable in the `useEffect` interval.
   - `if (pollCount > 30) { clearInterval(interval); setExplanationStatus('failed'); }`.

## Verification Protocol
1. Force the Gemini service to hang or fail in the backend.
2. Monitor frontend network tab; verify polling ceases exactly after 60 seconds (30 attempts).
3. Check backend access logs; verify API key is absent from the URL string.
