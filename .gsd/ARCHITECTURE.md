# AdaptCode — Verified Architectural Blueprint

## High-Level Topology
```
           [ Client Browser ]
                   │
                   ▼ HTTPS (Vercel)
         [ Next.js 14 Frontend ]
                   │
                   │ HTTPS + adaptcode_session (httpOnly cookie)
                   ▼
       [ FastAPI Backend (Cloud Run) ]
       [ + Tailscale Userspace Proxy ]
       ├── JWKS / REST / RLS ──► [ Supabase (PostgreSQL 15 + Auth) ]
       ├── REST (public) ──────► [ Google Gemini Flash API (alias: gemini-flash-latest) ]
       └── SOCKS5 (Tailnet) ───► [ Piston Sandbox on AWS EC2 (100.114.155.33:2000) ]
```

## System Component Responsibilities
1. **Frontend (`frontend/src/app`)**: Single-page interactive practice interface built with Next.js 14. Integrates Monaco Editor for Python/Java/JS/C++, SVG interactive concept graphs, graduated hint UI, and client-side fallback simulation modes.
2. **Backend API (`backend/app`)**: Stateless ASGI service handling authentication tokens, code grading, knowledge state calculation, curriculum optimization, and error diagnosis.
3. **Piston Sandbox (`backend/app/services/piston.py`)**: Remote execution environment running isolated runtimes with strict time limits (3000ms run, 10000ms compile).
4. **Pedagogical Engine (`backend/app/services/bkt.py` & `linucb.py`)**:
   - Bayesian Knowledge Tracing (BKT) with graded behavioral penalties ($\rho$) for hints, attempts, compile errors, and time-on-task.
   - Contextual Multi-Armed Bandit (LinUCB) evaluating a 16-dimensional feature vector to pick optimal pedagogical actions (`easier_problem`, `same_difficulty`, `harder_problem`, `redirect_prerequisite`, `hint_augmented`).
5. **AI Diagnostic Engine (`backend/app/services/gemini.py`)**: Asynchronous background worker generating targeted 3-part pedagogical failure explanations using `gemini-flash-latest` (overridable via `GEMINI_MODEL` env).
