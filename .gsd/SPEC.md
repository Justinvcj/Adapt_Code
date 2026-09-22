# AdaptCode Specification

## Objective
Build a fully functional, AI-powered adaptive programming practice environment using Next.js (Frontend), FastAPI (Backend), Supabase (Database/Auth), and Piston (Code Execution). The platform serves tailored algorithm problems using Bayesian Knowledge Tracing (BKT) and Contextual Bandits.

## Status: FINALIZED

## Core Features
1. **Adaptive Engine (BKT & LinUCB)**: Dynamically tracks student mastery across concepts (loops, arrays, DP) and selects the next optimal problem.
2. **Code Execution (Piston)**: Secure, fast Python code execution via Dockerized Piston API.
3. **User Authentication**: Login/Register via Supabase Auth (including future OAuth/Google).
4. **Dashboard & Library**: 
   - **Dashboard**: High-level stats (Problems Solved, Streak, Sessions).
   - **Library**: Browse all problems, filter by difficulty/concept.
   - **History**: Review past submissions and verdicts (Accepted, Compile Error, etc.).
5. **Workspace Layout**: Interactive Monaco code editor, problem description, run/submit controls, and real-time feedback.

## Non-Goals (Stripped from UI Template)
- Contests, Discussion boards, "Explore" plans, and Public Leaderboards (removed to focus on the core adaptive loop).

## Architecture
- **Frontend**: Next.js 14 (App Router), TailwindCSS, TypeScript.
- **Backend**: FastAPI (Python), modular routers (/api/problems, /api/submit, /api/stats, etc.).
- **Database**: Supabase (PostgreSQL).
- **Execution**: Local Dockerized Piston (ghcr.io/engineer-man/piston).
