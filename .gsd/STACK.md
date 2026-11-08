# AdaptCode — Technology Stack & Inventory (Ground Truth)

## 1. Runtime & Language Environment
- **Backend Runtime:** Python 3.11 (`python:3.11-slim` in `backend/Dockerfile`)
- **Frontend Runtime:** Node.js 18+ (tested with 18 / 20)
- **Frontend Language:** TypeScript 5.x (`frontend/tsconfig.json`)
- **Backend Framework:** FastAPI 0.141.1 with Uvicorn 0.30.0 (`backend/requirements.txt`)

## 2. Production Services & Infrastructure
- **Frontend Hosting:** Vercel (Next.js 14.2.35 App Router)
- **Backend Hosting:** Google Cloud Run (`backend/cloudbuild.yaml`)
- **Container Networking:** Tailscale userspace-networking sidecar inside backend container (`backend/Dockerfile`, `backend/entrypoint.sh`)
- **Code Execution Sandbox:** Piston API (`ghcr.io/engineer-man/piston`), hosted on private AWS EC2 (`100.114.155.33:2000`) accessible via Tailscale tailnet
- **Database & Auth:** Supabase PostgreSQL 15+ & Supabase Auth (`backend/app/core/database.py`, `backend/app/core/dependencies.py`)
- **LLM Provider:** Google Gemini API (`gemini-2.5-flash` via direct HTTP in `backend/app/services/gemini.py`)

## 3. Core Libraries & Dependencies

### Backend (`backend/requirements.txt`)
| Category | Library | Version | Purpose |
|---|---|---|---|
| Web Framework | `fastapi` | 0.141.1 | REST API framework |
| Server | `uvicorn` | 0.30.0 | ASGI web server |
| Data Validation | `pydantic` | 2.13.5 | Request/response DTO schemas |
| Settings | `pydantic-settings` | 2.15.0 | Environment configuration |
| HTTP Client | `httpx` | 0.27.0 | Piston, JWKS, & Gemini HTTP requests |
| Math / ML | `numpy` | 2.5.2 | LinUCB matrix math & BKT computations |
| Database | `supabase` | 2.4.3 | PostgREST SDK client |
| Database Driver | `psycopg2-binary` | 2.9.12 | Direct Postgres driver for migrations and audit logging |
| Auth / JWT | `python-jose` | 3.5.0 | Supabase JWKS JWT validation |
| Rate Limiting | `slowapi` | 0.1.10 | In-memory token-bucket / fixed-window rate limiting |
| Testing | `pytest`, `pytest-asyncio` | 8.3.0 / 0.24.0 | Unit and route testing |

### Frontend (`frontend/package.json`)
| Category | Library | Version | Purpose |
|---|---|---|---|
| Core Framework | `next` | 14.2.35 | App Router web application |
| UI Library | `react`, `react-dom` | ^18.x | View layer |
| Code Editor | `@monaco-editor/react` | ^4.7.0 | In-browser code editing workspace |
| Styling | `tailwindcss` | ^3.4.1 | Utility-first CSS styling |
| Icons | `lucide-react` | ^1.27.0 | Application icons |
| Animation | `framer-motion`, `motion` | ^13.1.0, ^13.1.1 | Layout & element transitions |
| Animation | `gsap`, `@gsap/react` | ^3.15.0, ^2.1.2 | Advanced animation timelines |
| Graphics | `ogl` | ^1.0.11 | WebGL canvas visual effects |
| Data Visualization | `recharts` | ^3.10.1 | Analytics & progress charts |
| Notifications | `react-hot-toast` | ^2.6.0 | Toast alerts |
| Markdown | `react-markdown`, `rehype-sanitize` | ^10.1.0, ^6.0.0 | Problem description rendering |
| Testing | `jest`, `@testing-library/react` | ^30.4.2, ^16.3.2 | Component testing (unconfigured/unused) |
