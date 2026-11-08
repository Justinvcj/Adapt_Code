# Project: AdaptCode Master Analysis & Audit

## Architecture
- Root Workspace: `c:\Users\Justin\The Global Projects Folder\Adapt_Code`
- Frontend: Next.js 14 App Router, Monaco Editor, Tailwind CSS, SVG DAG visualizer
- Backend: FastAPI (Python 3.11), Uvicorn, SlowAPI, Extended BKT, 16-D LinUCB, Google Gemini 2.5 Flash
- Execution Sandbox: Piston API on AWS EC2 (`100.114.155.33:2000`)
- Networking: Tailscale userspace sidecar in Cloud Run container (`backend/entrypoint.sh`)
- Database: Supabase PostgreSQL (hosted on AWS `ap-southeast-1` pooler)
- Cloud Deployments: Google Cloud Run (`asia-southeast1`) via Cloud Build; Vercel for frontend (`https://adaptcode.vercel.app`)

## Feature Inventory
| # | Feature / Area | Description | Assigned Milestone | Source |
|---|----------------|-------------|--------------------|--------|
| 1 | Non-Technical Overview | Product purpose (ZPD cognitive tutor, 12 DSA concepts), target user personas, 3-tier graduated hint system | M1 | Survey 1 (Verified) |
| 2 | Technical Architecture & Directory Map | Top-level map, module responsibilities, tech stack table, data models & DB schemas, API endpoints table | M1 | Survey 1 (Verified) |
| 3 | Data Flows & Workflows | 6-Phase adaptive submission loop, BKT update, LinUCB next problem, async Gemini explanation, auth flows | M1 | Survey 1 (Verified) |
| 4 | Onboarding & Developer Guide | Setup guide for another AI: prerequisites, toolchains, .env variables, step-by-step startup, Docker Piston, seeders, test suites | M1 | Survey 1 (Verified) |
| 5 | Local vs GitHub Comparison | Remote URL, tracking branch, HEAD commit, 0 ahead/0 behind, 1 modified file, 4 untracked paths, ignored files | M1 | Survey 2 (Verified) |
| 6 | Cloud Backend Deployments (AWS & GCP) | GCP Cloud Run, Artifact Registry, Secret Manager, Gemini API; AWS EC2 Piston at 100.114.155.33:2000, Tailscale mesh tunnel, Supabase on AWS; Explicit Unknowns | M1 | Survey 2 (Verified) |
| 7 | Problem & Defect Audit Catalog | Catalog of 25 discrete issues across Build/Config, Runtime, Security, Dependencies, Architecture with code evidence, impact, remediation | M1 | Survey 3 (Verified) |
| 8 | Master Deliverable Authoring | Comprehensive, unified ADAPTCODE_ANALYSIS.md at repository root strictly fulfilling R1–R5 without modifying pre-existing code | M1 | Worker M1 (Done) |
| 9 | Quality & Integrity Verification | 2 Reviewers, 2 Challengers, and 1 Forensic Auditor gate check verifying accuracy, completeness, and non-destructive constraint | M2 | Gate PASS |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|--------------|--------|
| M1 | Master Analysis Synthesis & Delivery | Author `ADAPTCODE_ANALYSIS.md` in repository root integrating all R1-R5 findings from Survey Explorers 1, 2, 3 | Survey (Done) | DONE |
| M2 | Independent Verification Gate | Multi-agent gate (2 Reviewers, 2 Challengers, 1 Auditor) verifying all acceptance criteria and integrity | M1 | DONE |

## Code Layout & File Boundaries
- Master Deliverable: `c:\Users\Justin\The Global Projects Folder\Adapt_Code\ADAPTCODE_ANALYSIS.md` (Delivered)
- Pre-existing codebase files: STRICT READ-ONLY (No modifications or deletions made)
- Agent coordination metadata: `c:\Users\Justin\The Global Projects Folder\Adapt_Code\.agents\teamwork\`
