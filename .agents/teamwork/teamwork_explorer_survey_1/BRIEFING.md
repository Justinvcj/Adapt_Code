# BRIEFING — 2026-11-08T05:52:30Z

## Mission
Comprehensive technical and non-technical analysis of AdaptCode (Requirement R1) covering product purpose, architecture, stack, structure, data models, workflows, and developer onboarding.

## 🔒 My Identity
- Archetype: explorer
- Roles: codebase-architecture-explorer, technical-writer
- Working directory: c:\Users\Justin\The Global Projects Folder\Adapt_Code\.agents\teamwork\teamwork_explorer_survey_1
- Original parent: 03c7139e-8671-4704-8cf9-a7247efd28d4
- Milestone: Survey Phase (Requirement R1)

## 🔒 Key Constraints
- Read-only investigation — do NOT modify or delete codebase files
- Write ONLY to working directory: .agents\teamwork\teamwork_explorer_survey_1\
- Zero assumptions or hallucinations; every claim must have concrete evidence in code/config
- Periodic progress.md updates with "Last visited: [timestamp]"

## Current Parent
- Conversation ID: 03c7139e-8671-4704-8cf9-a7247efd28d4
- Updated: 2026-11-08T05:52:30Z

## Investigation State
- **Explored paths**:
  - Root: README.md, ARCHITECTURE.md, CLAUDE.md, TESTING_AND_CONTRIBUTING.md, production_schema.sql, docker-compose*.yml
  - Backend: backend/app/main.py, core/* (config, database, dependencies, executor, logging, rate_limit), models/schemas.py, routers/* (admin, auth, checkout, history, leaderboard, mastery, potd, problems, session, stats), services/* (audit, bkt, gemini, linucb, piston, prerequisites), Dockerfile, entrypoint.sh, cloudbuild.yaml, schema.sql, clean_schema.sql, migrations/*, scripts/seed_problems_from_db.py, simulator.py, pretrain.py, tests/*
  - Frontend: package.json, next.config.mjs, tsconfig.json, jest.config.ts, src/app/*, src/components/adapt/*, src/data/*, src/lib/*
  - Docs & Security: docs/DEPLOY.md, docs/HINT_SYSTEM.md, docs/UI_UX_SPECIFICATION.md, docs/UX_AUDIT.md, security/SECURITY_ISSUES.md, security/SECURITY_FIXES.md
- **Key findings**:
  - Full hybrid architecture: Next.js 14 (Vercel) + FastAPI (GCP Cloud Run) + Tailscale Mesh VPN + Piston (AWS EC2) + Supabase (PostgreSQL + Auth) + Google Gemini 2.5 Flash.
  - Multi-tiered adaptive learning engine combining BKT (with behavioral penalties) and LinUCB contextual bandits (16-dim context, 5 pedagogical actions).
  - Concrete discrepancies and debts identified across database schemas, API response contracts, router undefined variables, and broken test imports.
- **Unexplored areas**: None remaining for Requirement R1.

## Key Decisions Made
- Structure handoff.md strictly following the 5-component protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method) with deep, exhaustive technical sections.

## Artifact Index
- DISPATCH.md — incoming instructions log
- progress.md — liveness heartbeat
- BRIEFING.md — situational awareness
- handoff.md — final deliverable report
