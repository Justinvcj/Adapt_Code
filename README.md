<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Judge0-E44D26?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

# AdaptCode

**An AI-powered adaptive programming practice platform that personalizes problem selection using Bayesian Knowledge Tracing (BKT), LinUCB contextual bandits, and LLM-driven tutoring.**

AdaptCode continuously models each student's mastery across a prerequisite-linked graph of 12 algorithmic concepts, selects problems at the optimal difficulty boundary (Zone of Proximal Development), and generates targeted explanations for failed submissions — creating a closed-loop intelligent tutoring system for algorithmic problem-solving.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Core Components](#core-components)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Adaptive Learning Pipeline](#adaptive-learning-pipeline)
- [Running Tests](#running-tests)
- [Pretraining the Agent](#pretraining-the-agent)
- [Roadmap](#roadmap)
- [Research Context](#research-context)
- [License](#license)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                     │
│  Landing Page ─── Login/Register ─── Practice ─── Dashboard     │
│                                        │             │           │
│                        Monaco Editor   │    Knowledge Map        │
│                        AI Tutor Panel  │    Stats & Streaks      │
└──────────────────────────────┬─────────┴─────────────────────────┘
                               │ REST API
┌──────────────────────────────┴──────────────────────────────────┐
│                        Backend (FastAPI)                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │   Observer    │  │   Doctor     │  │       Coach           │  │
│  │ (5 signals)   │  │   (BKT)     │  │    (LinUCB Bandit)    │  │
│  │              │  │              │  │                       │  │
│  │ • Correctness│  │ • P(mastery) │  │ • Context: 16-dim     │  │
│  │ • Compile    │  │ • P(learn)   │  │ • Actions: difficulty │  │
│  │   errors     │  │ • P(guess)   │  │ • UCB exploration     │  │
│  │ • Time on    │  │ • P(slip)    │  │                       │  │
│  │   task       │  │              │  │                       │  │
│  │ • Hint usage │  │ Effective    │  │ Reward signal from    │  │
│  │ • Attempt    │  │ correctness  │  │ Observer + Doctor     │  │
│  │   count      │  │ → mastery    │  │ → weight update       │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                       │              │
│         └─────────────────┼───────────────────────┘              │
│                           │                                      │
│  ┌────────────────────────┴──────────────────────────────────┐  │
│  │              Concept Prerequisite Graph                     │  │
│  │                                                            │  │
│  │  basic_syntax → loops → arrays → strings                   │  │
│  │                    │       ├──→ hashing                     │  │
│  │                    │       ├──→ two_pointers → sliding_win  │  │
│  │                    │       └──→ binary_search               │  │
│  │                    └──→ recursion → backtracking            │  │
│  │                              ├──→ trees                     │  │
│  │                              └──→ dynamic_programming       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐  │
│  │   AI Tutor      │  │           Judge0 (CE)                │  │
│  │  (Zhipu GLM-4)  │  │   Sandboxed code execution           │  │
│  │                 │  │   Python, JS, C++, Java               │  │
│  │  3-part error   │  │                                      │  │
│  │  explanation    │  │   Docker Compose stack                │  │
│  └─────────────────┘  └──────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   Supabase (PgSQL)   │
                    │                      │
                    │  users               │
                    │  problems            │
                    │  sessions            │
                    │  session_events      │
                    │  mastery_scores      │
                    │  agent_state         │
                    └─────────────────────┘
```

---

## Core Components

| # | Component | Role | Implementation |
|---|-----------|------|----------------|
| 1 | **Concept Graph** | Hard constraints on concept accessibility via prerequisites | `prerequisites.py` — DAG of 12 concepts with mastery threshold gating (≥0.85) |
| 2 | **Observer** | Collects 5 execution signals per submission | Embedded in `/api/execute` — correctness, compile errors, time-on-task, hint usage, attempt count |
| 3 | **Doctor (BKT)** | Maintains per-student, per-concept mastery probability | `bkt.py` — Modified BKT with continuous effective correctness interpolation |
| 4 | **Coach (LinUCB)** | Selects optimal difficulty level for next problem | `linucb.py` — Contextual bandit with 16-dim context, 5 arms, UCB exploration |
| 5 | **AI Tutor** | Generates structured error explanations on failed submissions | `ai_tutor.py` — Zhipu GLM-4-Flash with 3-part prompt (what/why/review) |
| 6 | **Judge0** | Sandboxed multi-language code execution and test case evaluation | Docker Compose stack — supports Python 3, JavaScript, C++, Java |

---

## Tech Stack

**Backend:** Python 3.11+, FastAPI, Pydantic, NumPy, Supabase Python SDK, httpx, Zhipu AI SDK

**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Monaco Editor, Framer Motion, React Markdown, react-hot-toast, Lucide Icons

**Infrastructure:** Supabase (PostgreSQL + Auth), Judge0 CE (Docker Compose), Redis (Judge0 queue)

---

## Project Structure

```
Adapt_Code/
├── backend/
│   ├── main.py                 # FastAPI application (auth, sessions, execute, mastery)
│   ├── bkt.py                  # Bayesian Knowledge Tracing engine
│   ├── linucb.py               # LinUCB contextual bandit agent
│   ├── prerequisites.py        # Concept prerequisite graph and access control
│   ├── ai_tutor.py             # Zhipu AI explanation generator
│   ├── seed_db.py              # Database seeder (20 problems across 12 concepts)
│   ├── simulator.py            # Synthetic student simulator for agent pretraining
│   ├── schema.sql              # PostgreSQL schema for Supabase
│   ├── docker-compose.yml      # Judge0 CE stack (server, workers, postgres, redis)
│   ├── judge0.conf             # Judge0 configuration
│   ├── requirements.txt        # Python dependencies
│   ├── tests/                  # Unit tests (BKT, LinUCB, prerequisites, API)
│   │   ├── conftest.py
│   │   ├── test_bkt.py
│   │   ├── test_linucb.py
│   │   ├── test_prerequisites.py
│   │   └── test_api.py
│   ├── test_e2e.py             # End-to-end flow test
│   ├── test_execution.py       # Judge0 integration test
│   └── e2e-smoke-test.py       # Smoke test script
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Landing page
│   │   │   ├── login/page.tsx              # Login
│   │   │   ├── register/page.tsx           # Registration
│   │   │   ├── layout.tsx                  # Root layout (AuthProvider, Toaster)
│   │   │   └── (app)/
│   │   │       ├── layout.tsx              # App shell (sidebar, nav, streak)
│   │   │       ├── practice/page.tsx       # Core practice interface
│   │   │       ├── dashboard/page.tsx      # Mastery dashboard & knowledge map
│   │   │       └── history/page.tsx        # Submission history table
│   │   ├── components/
│   │   │   ├── CodeEditor.tsx              # Monaco editor wrapper
│   │   │   ├── ProblemPanel.tsx            # Problem display component
│   │   │   └── ErrorBoundary.tsx           # React error boundary
│   │   └── lib/
│   │       ├── api.ts                      # API client with auth interceptor
│   │       └── auth-context.tsx            # Auth state management (Context API)
│   ├── __tests__/                          # Jest + React Testing Library
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- A [Supabase](https://supabase.com) project
- A [Zhipu AI](https://open.bigmodel.cn/) API key

### 1. Clone the Repository

```bash
git clone https://github.com/Justinvcj/Adapt_Code.git
cd Adapt_Code
```

### 2. Set Up the Database

Run the contents of `backend/schema.sql` in your Supabase SQL Editor to create all required tables.

### 3. Start Judge0 (Code Execution Engine)

```bash
cd backend
docker-compose up -d
```

Verify Judge0 is running:

```bash
curl http://localhost:2358/about
```

### 4. Configure the Backend

```bash
cd backend
cp .env.example .env
```

Fill in your `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key
ZHIPU_API_KEY=your-zhipu-api-key
JUDGE0_URL=http://localhost:2358
FRONTEND_URL=http://localhost:3000
```

### 5. Install & Run the Backend

```bash
pip install -r requirements.txt
python seed_db.py          # Seed the 20 problems
uvicorn main:app --reload  # Starts on :8000
```

### 6. Install & Run the Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev  # Starts on :3000
```

### 7. Open the App

Navigate to [http://localhost:3000](http://localhost:3000), register an account, and start practicing.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase anon key or service role key |
| `ZHIPU_API_KEY` | Yes | Zhipu AI API key for GLM-4-Flash |
| `JUDGE0_URL` | Yes | Judge0 API endpoint (default: `http://localhost:2358`) |
| `FRONTEND_URL` | No | CORS origin for frontend (default: `http://localhost:3000`) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (default: `http://localhost:8000`) |

---

## Database Schema

Six tables in Supabase (PostgreSQL):

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Student accounts | `user_id` (UUID PK), `email`, `display_name`, `role` |
| `problems` | Problem bank | `problem_id` (UUID PK), `title`, `description`, `concept_tag`, `difficulty_level`, `test_cases` (JSONB) |
| `sessions` | Practice sessions | `session_id` (UUID PK), `student_id` (FK), `session_number`, `started_at`, `ended_at` |
| `session_events` | Individual submission records | `event_id` (UUID PK), `session_id` (FK), `problem_id` (FK), all 5 observer signals, `final_verdict`, `reward_signal` |
| `mastery_scores` | Per-student per-concept mastery | `student_id` + `concept_tag` (unique), `mastery_probability` (0.000–1.000) |
| `agent_state` | Serialized LinUCB parameters | `student_id` (PK), `a_matrices` (JSONB), `b_vectors` (JSONB) |

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new student account |
| `POST` | `/api/auth/login` | Login and receive JWT access token |
| `POST` | `/api/auth/logout` | Invalidate session |
| `GET`  | `/api/auth/me` | Get current user profile |

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/session/start` | Start a new practice session |
| `POST` | `/api/session/end` | End the current session |

### Core Adaptive Loop

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/problem/next` | Get next problem (selected by LinUCB + prerequisite constraints) |
| `POST` | `/api/hint/{problem_id}` | Request a hint (tracked as mastery penalty signal) |
| `POST` | `/api/execute` | Submit code → Judge0 evaluation → BKT update → LinUCB update → AI explanation |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/mastery` | Per-concept mastery scores, unlock status, and progress |
| `GET`  | `/api/stats` | Aggregate stats (solved count, streak, strongest/weakest concept) |
| `GET`  | `/api/history` | Paginated submission history |

All protected endpoints require `Authorization: Bearer <token>` header.

---

## Adaptive Learning Pipeline

The core loop that fires on every code submission (`POST /api/execute`):

```
Student submits code
        │
        ▼
┌─ Judge0 evaluates against test cases ─┐
│  Returns: verdict, compile output,     │
│  execution time, memory usage          │
└───────────────┬───────────────────────┘
                │
                ▼
┌─ Observer collects 5 signals ─────────┐
│  1. is_correct (bool)                  │
│  2. compile_errors (int)               │
│  3. time_on_task_seconds (int)         │
│  4. hint_used (bool)                   │
│  5. attempt_count (int)                │
└───────────────┬───────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
┌─ BKT Doctor ─┐  ┌─ LinUCB Coach ──────────────┐
│ Computes      │  │ Constructs 16-dim context    │
│ effective     │  │ from mastery vector +         │
│ correctness   │  │ session features              │
│ (continuous   │  │                               │
│  0.0 – 1.0)  │  │ Computes reward from          │
│               │  │ observer signals              │
│ Updates P(L)  │  │                               │
│ per concept   │  │ Updates A matrices and        │
│ in Supabase   │  │ b vectors for chosen arm      │
└───────────────┘  └───────────────────────────────┘
                │
                ▼
┌─ If incorrect: AI Tutor ──────────────┐
│  Sends code + problem + error to       │
│  Zhipu GLM-4-Flash                     │
│  Returns 3-part explanation:           │
│  1. What went wrong                    │
│  2. Why it fails                       │
│  3. What to review                     │
└────────────────────────────────────────┘
```

---

## Running Tests

### Backend

```bash
cd backend
pytest tests/ -v
```

### Frontend

```bash
cd frontend
npm test
```

### E2E Smoke Test

```bash
cd backend
python e2e-smoke-test.py
```

---

## Pretraining the Agent

The LinUCB agent can be bootstrapped with synthetic student data before real users interact with the platform:

```bash
cd backend
python simulator.py
```

This simulates 100 synthetic students across 20 sessions each, training the bandit to associate mastery levels with appropriate difficulty selections based on Vygotsky's Zone of Proximal Development.

---

## Roadmap

- [ ] Per-student LinUCB agents (currently global)
- [ ] Expand problem bank (currently 20 problems across 12 concepts)
- [ ] Migrate in-memory state (timers, hints) to Redis
- [ ] Add Dockerfile for backend
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Mobile-responsive practice interface
- [ ] Admin panel for problem management
- [ ] EM-fitted BKT parameters per concept
- [ ] Rate limiting and input validation hardening
- [ ] Real-time collaborative features
- [ ] Multi-language AI tutor (currently English only)

---

## Research Context

AdaptCode was developed as part of an IEEE conference paper submission investigating the application of contextual bandits and Bayesian knowledge tracing in intelligent tutoring systems for programming education. The system implements a closed-loop adaptive learning architecture where:

- **Bayesian Knowledge Tracing** maintains probabilistic mastery estimates that are updated with continuous (not binary) evidence signals
- **LinUCB Contextual Bandits** balance exploration and exploitation in difficulty selection using Upper Confidence Bound strategies
- **Prerequisite Graph Constraints** enforce pedagogically sound concept ordering as hard routing constraints on the bandit's action space

---

## License

This project is currently unlicensed. All rights reserved.

---

<p align="center">
  Built by <a href="https://github.com/Justinvcj">Justin V C J</a>
</p>
