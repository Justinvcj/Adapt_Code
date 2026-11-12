# AdaptCode — The Complete Story, From Scratch

**What this document is:** the single place where every decision, every pivot, every
algorithm, every formula, every technology choice, and every lesson from this
project lives — written so that someone with **zero prior context** (a future you,
an interviewer, an acquirer doing technical due diligence) can read it top to bottom
and come out able to explain the entire system from first principles. Not a
changelog, not an API reference (those are [`README.md`](../README.md),
[`docs/ARCHITECTURE.md`](ARCHITECTURE.md), [`docs/API.md`](API.md), and
[`SECURITY.md`](../SECURITY.md) — this document absorbs and explains them, it
doesn't replace them).

It is organized so you can use it two ways:
- **Read top to bottom once** to actually learn the project, in the order it was
  built.
- **Jump to [Part 7](#part-7--interview-ready-qa)** if you need to explain this
  project out loud right now (an interview, a pitch, a buyer's technical call) and
  want pre-built, accurate answers to the questions you'll actually get asked.

> Source of truth: `git log --reverse` on this repository (200+ commits,
> 2026-07-29 → present), every commit's full message body, the actual source code
> of every service file referenced below (file paths are given so you can verify
> everything yourself), and `SECURITY.md`.

---

## Table of contents

- [Part 0 — The elevator pitches](#part-0--the-elevator-pitches)
- [Part 1 — A plain-language glossary](#part-1--a-plain-language-glossary)
- [Part 2 — Every technology, and why it's here](#part-2--every-technology-and-why-its-here)
- [Part 3 — The timeline: every phase, in order, with the why](#part-3--the-timeline-every-phase-in-order-with-the-why)
- [Part 4 — The algorithms, down to the code](#part-4--the-algorithms-down-to-the-code)
- [Part 5 — The database, exactly as it is](#part-5--the-database-exactly-as-it-is)
- [Part 6 — Security: the full threat model](#part-6--security-the-full-threat-model)
- [Part 7 — Interview-ready Q&A](#part-7--interview-ready-qa)
- [Part 8 — Recurring lessons, across the whole timeline](#part-8--recurring-lessons-across-the-whole-timeline)
- [How this document stays alive](#how-this-document-stays-alive)

---

## Part 0 — The elevator pitches

**One sentence:** AdaptCode is a DS&A practice platform that models each student's
real knowledge with Bayesian statistics and picks their next problem with a
reinforcement-learning bandit, instead of giving everyone the same static list.

**30 seconds:** Most coding-practice sites (LeetCode-style) show every user the same
problem list in the same order. AdaptCode runs two models on every single
submission: Bayesian Knowledge Tracing estimates the probability a student *actually
knows* each of 12 DS&A concepts — correcting for lucky guesses and careless slips,
not just counting right/wrong — and a LinUCB contextual bandit uses that mastery
estimate plus recent behavior (streak, hint usage, time on task) to decide whether
the next problem should be easier, the same, harder, or a prerequisite the student
is actually missing. Code is executed for real, in an isolated sandbox reachable
only over a private network, and failed submissions get an LLM-generated explanation
of *why* the approach failed — never the answer.

**2 minutes (the technical walkthrough):** Add the system shape — Next.js frontend
on Vercel talking to a FastAPI backend on Google Cloud Run over an httpOnly session
cookie; the backend is the only thing that touches Supabase (Postgres + auth) and
the code sandbox; the sandbox (Piston) runs on a separate AWS EC2 box with no public
port at all, reachable only through a private Tailscale mesh network. Every
`/api/submit` call runs five phases in sequence: execute the code, update the BKT
mastery estimate, log telemetry, let LinUCB pick the next pedagogical action, and —
only if the submission failed — kick off a background call to Gemini for an
explanation, so the student sees their verdict instantly and the explanation arrives
a moment later without blocking anything. Then mention the journey: this was not the
first infrastructure choice (Render, a local Judge0 integration, even an Oracle Cloud
VM reached by a Cloudflare tunnel were all tried and abandoned before Cloud Run +
EC2 + Tailscale), and the math itself (BKT/LinUCB) went through a dedicated
correctness-audit pass months into the project, because "the code runs" and "the
math is right" turned out to be two different questions.

**If asked "why would anyone pay for this / why does this matter":** personalization
is the entire value proposition of a tutoring product — a static problem list is a
commodity, a model of *this specific student's* knowledge that adapts every
submission is defensible IP. The two algorithms are cheap to run (NumPy, in-process,
no GPU, no training job), which matters if you're trying to keep infrastructure
costs near zero while proving the idea.

---

## Part 1 — A plain-language glossary

You do not need a CS degree to read this. Here is every recurring term, explained
simply:

- **Frontend vs. backend.** The *frontend* is the code that runs in your browser and
  draws the screen (buttons, the code editor, the mastery bars). The *backend* is
  code that runs on a server somewhere else, which the frontend talks to over the
  network to get data or ask it to do something. AdaptCode's frontend is **Next.js**
  (a framework built on **React**); its backend is **FastAPI** (a Python web
  framework).
- **API / endpoint / route.** The backend exposes a list of "doors" the frontend can
  knock on, e.g. `POST /api/submit`. Each door is called an endpoint or a route.
- **Database.** Where data is permanently stored (users, problems, scores) so it
  survives after you close the browser or restart the server. AdaptCode uses
  **Supabase**, a hosted **Postgres** database plus a built-in login/auth system,
  bundled as one product.
- **Sandbox.** Running a stranger's arbitrary code (a student's submission) on your
  own server is dangerous — malicious code could do anything. A sandbox is an
  isolated, disposable environment where code runs with no access to the real
  system. AdaptCode uses an open-source tool called **Piston** for this.
- **VPN / private network / Tailscale.** A normal server is reachable by anyone on
  the internet who has its address. A private network makes a server reachable
  *only* by other machines that have explicitly joined that private network.
  **Tailscale** is the tool AdaptCode uses to put its code sandbox behind a private
  network, so nobody on the public internet can even find it, let alone attack it.
- **LLM (Large Language Model).** A model like Gemini or GPT that takes text in and
  produces text out. AdaptCode feeds it a student's failed code + the test case and
  asks it to explain, in structured JSON, what went wrong.
- **Bayesian Knowledge Tracing (BKT).** A technique from intelligent-tutoring-system
  research. It tracks "the probability this specific student actually *knows* this
  specific concept" as a number between 0 and 1, and updates that number every time
  they attempt a related problem — in a mathematically principled way that accounts
  for the fact a correct answer could be a lucky guess, and a wrong answer could be
  a careless slip. See [Part 4](#part-4--the-algorithms-down-to-the-code).
- **Contextual bandit / LinUCB.** A reinforcement-learning technique for "what's the
  best next action, given this specific situation," while continuing to explore and
  learn. AdaptCode uses it to pick *which kind* of problem to show next, personalized
  per student. See [Part 4](#part-4--the-algorithms-down-to-the-code).
- **Row-Level Security (RLS).** A Postgres/Supabase feature where the database
  itself — not just the backend code — enforces "user A can never read or write user
  B's rows." It's a second line of defense in case the backend code has a bug.
- **SECURITY DEFINER function.** A Postgres function that runs with the permissions
  of whoever *created* it, not whoever *calls* it — powerful, and dangerous if it
  trusts an untrusted input. AdaptCode found and fixed exactly this bug (Part 6).
- **CORS / CSP / cookies, `httpOnly`, `SameSite`.** Browser security mechanisms.
  Getting a frontend on one domain (Vercel) talking to a backend on another domain
  (Cloud Run) to work *and* stay secure is one of the fiddlier parts of modern web
  deployment, and this project hit real, production-breaking bugs here more than
  once (Part 3, Part 8).
- **CI (Continuous Integration).** Automated checks (tests, linting) that run every
  time code is pushed to GitHub, before anyone trusts it.
- **Rate limiting.** Capping how many requests a client can make in a time window,
  to stop abuse. AdaptCode layers this twice: per-IP (SlowAPI, every route) and
  per-account (a custom daily submit cap and failed-login lockout, Part 6).
- **CAPTCHA.** A challenge that's easy for a human and hard for a bot, used to stop
  automated account creation. AdaptCode uses **Cloudflare Turnstile**.
- **Deploy target.** Where the running code actually lives on the internet. This
  project tried **four** different ones for the backend/sandbox before settling (see
  Part 3): Render, a local machine + Judge0, an Oracle Cloud VM reached by a
  Cloudflare tunnel, and finally Google Cloud Run + an AWS EC2 box joined by
  Tailscale.

---

## Part 2 — Every technology, and why it's here

This section goes one level deeper than Part 1: for each piece of the stack, *what
it actually is*, *why this one and not an obvious alternative*, and *exactly how
it's used in this codebase*.

### Next.js 14 (App Router) — the frontend framework
**What it is:** a React framework that adds file-based routing, server-side
rendering, and "server components" (React components that run on the server and
send HTML, not JS, to the browser) on top of plain React.
**Why this and not plain React + a router, or Vite:** one codebase needed to serve
both a fast, SEO-reasonable marketing/landing page *and* a fully interactive
authenticated app (the editor, the graph). Next's App Router lets both live in the
same project with different rendering strategies per route, and it deploys to Vercel
with zero configuration.
**How it's used here:** `frontend/src/app/` — `(app)/` is the authenticated shell
(problem solving, Monaco editor), alongside `mastery/`, `graph/`, `login/`,
`onboarding/`, `profile/[user]/`, `settings/`. Client-side data fetching goes through
`frontend/src/lib/api.ts`, always with `credentials: 'include'` so the httpOnly
session cookie rides along (`CLAUDE.md` makes this a hard rule because forgetting it
silently breaks auth — the request looks fine, succeeds, but the backend sees no
cookie and treats you as anonymous).
**Offline-first by design:** if `NEXT_PUBLIC_API_URL` is unset, or any backend call
5xxs, the UI falls back to static mock data in `frontend/src/data/` instead of
crashing. This was a deliberate project rule from early on (`CLAUDE.md`) so frontend
work was never blocked waiting on backend availability — and it's the same
reason the "offline fallback" keeps appearing throughout Part 3: once this rule
existed, a lot of UI could be built and demoed before the backend wiring caught up.

### Vercel — frontend hosting
**What it is:** a hosting platform purpose-built for frontend frameworks (Next.js
especially — same parent company).
**Why this and not, say, Cloud Run for the frontend too:** free tier, zero-config
deploy on every push to `main`, and automatic unique preview URLs for every other
branch — which is why the backend's CORS config (Part 6) has to allow a *regex*, not
just one fixed origin, to let those preview URLs talk to the live backend.

### FastAPI — the backend framework
**What it is:** a Python web framework built on type hints and Pydantic models,
with automatic request validation and (in dev) interactive API docs.
**Why this and not Flask/Django, or Node/Express:** the adaptive-learning math (BKT,
LinUCB) is NumPy — plain Python. Writing the backend in Python too means the web
layer and the ML layer share one process, one deploy, one language, with no
cross-language RPC or serialization overhead. FastAPI specifically was picked over
Flask/Django for native `async def` support (needed for calling out to Piston and
Gemini without blocking the event loop) and Pydantic request/response validation for
free.
**How it's used here:** `backend/app/main.py` wires CORS, CSP-equivalent headers,
rate limiting, and startup; `backend/app/routers/` holds one file per resource
(`auth`, `problems`, `mastery`, `stats`, `history`, `admin`, `checkout`, `session`,
`leaderboard`, `potd`); `backend/app/services/` holds the actual logic (`bkt`,
`linucb`, `piston`, `gemini`, `prerequisites`, `login_lockout`, `submit_quota`,
`audit`, `starter_gen`); `backend/app/core/` holds `dependencies` (auth-guard
functions FastAPI injects per route), `security`, `config`.
**The dev-vs-prod docs decision:** FastAPI auto-generates `/docs` (Swagger UI) and
`/openapi.json` — extremely useful in development, and a free reconnaissance map of
every route/schema/auth-requirement for an attacker in production. AdaptCode
disables them whenever `ENV` is `production`/`staging` (commit `0de900c`) — dev keeps
them on, deployed environments always run with `ENV=production`, so they're never
live where anyone external could reach them.

### Google Cloud Run — backend hosting
**What it is:** a serverless container platform — you give it a Docker image, it
runs it, scales the number of instances up and down (including to zero) based on
traffic, and you pay per request/compute-second rather than for an always-on VM.
**Why this and not a plain VM, Render, or AWS Lambda:** Cloud Run was reached only
after two earlier choices failed in practice:
1. **Render** (used through most of August) kept hitting deploy friction — an
   invalid `uvicorn` startup flag broke a deploy (`8e87d8e`), and more fundamentally
   Render's container model didn't make it easy to run a second background process
   (the Tailscale daemon) alongside the FastAPI server.
2. **An Oracle Cloud free-tier VM**, reached over a **Cloudflare tunnel**, plus even
   a personal laptop at one point (`8523b42`, `7a12346`) — free, but fragile and
   manual: no autoscaling, no managed TLS, a tunnel that depended on a process
   staying alive on a machine the team didn't want to be the single point of
   failure.

   Cloud Run won because it: (a) **takes an arbitrary Dockerfile**, so the image can
   install and boot `tailscaled` as a second process before handing off to
   `uvicorn` — no separate sidecar container needed, because Cloud Run only runs one
   container per service (`2a0579c`); (b) scales to zero, so an idle backend costs
   nothing; (c) is one `gcloud builds submit` away from a new revision, with Secret
   Manager integration for runtime secrets.
**How it's used here:** `backend/Dockerfile` installs `tailscaled` from the official
Debian APT repo; `backend/entrypoint.sh` starts it in **userspace-networking mode**
(Cloud Run containers don't have the `/dev/net/tun` device a normal VPN client
needs — userspace mode avoids needing it), joins the tailnet using a `TS_AUTHKEY`
secret, exports `httpx`/requests proxy environment variables so outbound calls route
through the tailnet, then `exec`s `uvicorn` on Cloud Run's injected `$PORT`.
`backend/cloudbuild.yaml` is a three-step Cloud Build pipeline: build the image, push
to Artifact Registry, deploy to Cloud Run with env vars and `--set-secrets` bindings.

### AWS EC2 — host for the code sandbox
**What it is:** a plain virtual machine on Amazon's cloud.
**Why EC2 specifically, on a different cloud than the backend:** Piston (below)
needs privileged Docker (`--privileged`, `tmpfs /tmp:exec`) to run its own
sub-containers per language — a serverless platform like Cloud Run can't grant that.
A cheap, always-on EC2 instance can. There's no architectural reason it has to be a
*different* cloud provider than the backend (Google) — it reflects pragmatic
reasons (cost, familiarity, or an existing account) rather than a technical
requirement, and it's a clean illustration that Tailscale makes the two clouds talk
to each other as if they were on one LAN regardless of who owns the hardware.

### Tailscale — the private network between Cloud Run and EC2
**What it is:** a mesh VPN built on WireGuard that lets machines in different
networks (different clouds, home networks, anything) join one private virtual LAN
and address each other by a stable private IP, without manually configuring VPN
tunnels or opening firewall ports.
**Why this and not, say, a cloud VPC peering setup or just a firewall allowlist on
EC2's public IP:** cross-cloud VPC peering (GCP↔AWS) is real infrastructure work
with ongoing cost; a firewall allowlist on a public IP is still a public IP — one
misconfigured security-group rule away from exposure. Tailscale gives "this machine
simply does not have a public listener for this service" as the default, which is a
qualitatively stronger security property than "this port is allowlisted," at
effectively no cost for this traffic volume.
**How it's used here:** the EC2 box runs Piston bound to `100.114.155.33:2000` (a
Tailscale IP, not a public IP) with no public ingress rule for port 2000 at all. The
Cloud Run container joins the same tailnet at boot (see above) and reaches that
address directly. One recurring class of bug this introduced: **every outbound
HTTPS call from the backend container is forced through the Tailscale userspace
SOCKS5 proxy** so that the Piston call works — which meant Supabase, Gemini, *and
later Sentry* calls were all silently being routed through that proxy too, unless
explicitly excluded via `NO_PROXY`. Sentry's ingest hosts were missed when the
proxy was first set up and had to be added later (`8bef8ad`, Part 3) — a good example
of "the fix for one problem quietly creates a footgun for every *future* outbound
integration," worth remembering before adding the next one.

### Supabase — database and authentication
**What it is:** a hosted product that bundles Postgres, a REST API generated
automatically from your schema (PostgREST), file storage, and an authentication
system (email/password, OAuth providers, JWT issuing) — effectively "Firebase, but
it's real Postgres."
**Why this and not a hand-rolled Postgres + a hand-rolled auth system (e.g. Auth0 +
RDS):** one bill, one dashboard, and auth that's *just rows in the same database* —
the `users` table the backend already queries is the same table Supabase's auth
system manages, so there's no separate identity-provider integration to reconcile.
Email/password and Google OAuth both funnel into the same `users` row and the same
AdaptCode session cookie (Part 3, Phase C).
**How it's used here:** the backend holds the Postgres **service_role** key
(full access, bypasses Row-Level Security) and is the only thing that ever uses it;
the frontend only ever holds the **anon** key, which RLS policies constrain tightly
(Part 5, Part 6). All DB access from the backend goes through the official
`supabase-py` SDK, with a direct `psycopg2` connection used in a couple of specific
places (`login_lockout.py`, `audit.py`) where PostgREST's own role-handling got in
the way of what was needed (see Part 3, `beb0d01`).

### Piston — the code sandbox
**What it is:** an open-source code-execution engine (`ghcr.io/engineer-man/piston`)
— a single Docker container exposing a REST API (`POST /api/v2/execute`) that runs
submitted source code in an ephemeral, resource-capped environment and returns
stdout/stderr/exit code, supporting dozens of languages out of the box.
**Why this and not a hand-rolled sandbox, or a paid API (Judge0):** building a
secure code sandbox from scratch (seccomp, cgroups, filesystem isolation, per-run
timeouts) is a project in itself — Piston already solves it and is free to
self-host. The project *did* start on **Judge0** (a hosted/RapidAPI code-execution
service) in August, and dropped it the same month (`a61a7d0` — "bypass Judge0
entirely") because relying on a third-party API introduced rate limits and an
external dependency for the single most central feature of the product (grading
code). Self-hosting Piston removed both problems, at the cost of now being
responsible for the box it runs on (which is why it needs the EC2 + Tailscale
story above).
**How it's used here:** `backend/app/services/piston.py` — `execute_on_piston()`
posts `{language, version, files, stdin, run_timeout: 3000ms, compile_timeout:
10000ms}` to the Tailscale-only endpoint. Because Piston runs *raw files*, not
functions, and AdaptCode's problems are LeetCode-style (`def twoSum(self, nums,
target):`), a **harness** is generated per submission: `wrap_code()` wraps the
student's class/function in a small driver (`_python_harness` / `_javascript_harness`)
that reads JSON-encoded arguments from stdin, calls the student's function, and
prints the JSON result — so Piston's raw stdin/stdout model can still grade a
function-style submission. `run_test_cases()` then runs every hidden test case
through this harness, classifies failures into `compile_error` / `runtime_error` /
`wrong_answer`, and normalizes output via JSON round-tripping before comparing (so
`[0, 1]` and `[0,1]` compare equal). Java/C++ harnessing is explicitly **not**
implemented yet (the function wraps unchanged, so only Python and JavaScript get
true function-style grading today) — a known, intentional gap, not an oversight.
**The runtime-pinning gap:** every language in `LANGUAGE_MAP` requests
`"version": "*"` — "give me whatever Piston has installed." That's convenient (no
code change needed when Piston's host upgrades a runtime) but means a silent
runtime upgrade with a fresh CVE lands in production with zero visibility. A
feature-flagged pin (`PISTON_PINNED_VERSIONS`, commit `01bda25`) exists to close
this without forcing it on blindly — see Part 6.

### Google Gemini — the LLM tutor
**What it is:** Google's large language model family, called here via the plain
REST `generateContent` API (not a client SDK).
**Why Gemini and not the original choice:** the very first commit integrated
**Zhipu AI**; it was replaced by Gemini in the Aug 24 "Phase 4" commit (`b496550`).
Gemini's structured-output behavior (reliably returning exactly the JSON shape
asked for) made it a better fit for a feature that *must* produce `{what_went_wrong,
why_approach_fails, concept_to_review}` every time, not prose that has to be parsed
hopefully.
**Why `gemini-flash-lite-latest` specifically, not a bigger model:** per the comment
directly in `backend/app/services/gemini.py` — a diagnostic explanation is a short,
cheap task; the full Flash model was timing out at 45s under load, lite returns in
1-2s. The model name is read from an env var, not hardcoded, specifically so a
future version bump doesn't require a code change (and because `gemini-2.5-flash`
at one point started returning 404 for newly-created API keys — an external,
Google-side churn problem this project had no control over, worked around by aliasing).
**How it's used here:** one of 12 **concept-specific prompt templates**
(`CONCEPT_PROMPTS`) is selected based on the problem's tagged concept (e.g. for
`recursion`: "Focus on base case identification, recursive case reduction, and the
call stack") and folded into a prompt alongside the student's code, the verdict, and
the error output. The prompt explicitly instructs the model **never to give the
correct solution** — only to explain the failure and name a concept to review. This
call happens as a FastAPI **background task**, fired only when the verdict isn't
"accepted," with exponential-backoff retry on HTTP 429 and a generic fallback
explanation after 3 failed retries — so a Gemini outage degrades the experience
instead of breaking the submit flow.

### Monaco Editor — the code editor
**What it is:** the same text-editing engine that powers VS Code, available as a
standalone web component.
**Why this and not a simpler `<textarea>` or CodeMirror:** syntax highlighting,
bracket matching, and a familiar editing experience matter directly to the core
product (writing code), and Monaco is the most battle-tested option. Loaded via
dynamic import with its worker fetched from a CDN (`cdn.jsdelivr.net`) rather than
bundled, specifically to keep the app's own JS bundle small — and this CDN origin
had to be explicitly allow-listed in CSP, another instance of the "new external
domain → update CSP" pattern (Part 8).

### Sentry — error monitoring
**What it is:** an error-tracking and performance-monitoring service — the frontend
and backend both report unhandled exceptions, with stack traces, breadcrumbs, and
(optionally) session replay, to a central dashboard.
**Why it's here, and why late:** for most of this project's life, errors were only
visible by actually looking — console logs, manual testing, user reports. Sentry
(`29ee0e9`, Nov 10) adds automatic, structured visibility into what's actually
breaking in production, for both sides of the stack. It's deliberately a **safe
no-op without a DSN configured** — so it can never be the reason something breaks,
only a reason something gets noticed.
**The getting-it-actually-working saga is its own lesson** (Part 3, Part 8): wiring
an SDK and seeing it "initialize successfully" in a log line is not the same as
events actually arriving — three separate, unrelated things each silently blocked
delivery in this specific stack (a stale build cache not inlining the public DSN,
CSP blocking the browser's own POST to Sentry's ingest host, and the Tailscale proxy
silently swallowing the backend's outbound POST to the same host), and each had to
be found and fixed one at a time before the pipe was actually open end to end.

### Cloudflare Turnstile — CAPTCHA
**What it is:** a CAPTCHA alternative from Cloudflare that verifies "this is
probably a human" without the classic "click all the squares with a bus in them"
UX, and is free.
**Why this and not reCAPTCHA:** no re-arrange-the-traffic-lights friction, free,
privacy-respecting (Cloudflare's own framing), and simple to self-host as a widget
with no new npm dependency (`frontend/src/components/Turnstile.tsx` loads the
Cloudflare script directly). Shipped **feature-flagged** (commit `e5b026f`) — both
the frontend widget and the backend verification (`backend/app/services/
turnstile.py`) are no-ops until `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_
TURNSTILE_SITE_KEY` are actually set, so it can be merged and deployed inert, then
switched on later without another deploy.
**A deliberate security choice worth naming:** the verify helper **fails closed** on
a Cloudflare API error — if Cloudflare's verification endpoint is down, signups are
blocked rather than silently let through. That's a conscious trade of availability
for safety: an attacker can't use "make Cloudflare's API unreachable" as a way to
bypass bot protection.

### SlowAPI — rate limiting
**What it is:** a FastAPI-integrated rate-limiting library, limiting requests per
client IP within a time window.
**Why this and not a hand-rolled limiter, or pushing it to the edge immediately:**
it's a five-minute integration for "stop the obvious abuse" (20 requests/min per IP
globally, tighter on auth routes) without needing any new infrastructure. It is
explicitly **not** a complete answer — SlowAPI only sees IPs, so an attacker
rotating IPs can still credential-stuff one specific account, which is exactly why
the project later added a *second*, account-keyed layer on top (per-email login
lockout, per-user daily submit cap — Part 6) rather than relying on SlowAPI alone.

### Docker / Dockerfile — packaging
**Why:** both Piston and the FastAPI backend ship as container images — Piston
because that's how the upstream project distributes itself, and the backend because
Cloud Run requires a container, and because the Tailscale sidecar has to be baked
into the same image (no multi-container story on Cloud Run, see above).

### GitHub Actions + Dependabot — CI and dependency hygiene
**Why Actions:** runs the frontend Jest test suite (and lint) automatically on
every push. **Why the backend job is gated off** (`if: ${{ false }}` in
`.github/workflows/ci.yml`) — a deliberate, documented decision (`f06147d`, "skip
backend jobs until backend work resumes"), because the backend's pytest suite needs
live Supabase and Piston access, and nobody wanted an unattended CI runner touching
either without supervision. **Why Dependabot is useful but not blindly trusted
here:** it correctly flags outdated/vulnerable dependencies, but at least twice its
auto-bump PRs would have broken the build if merged as-is (a Next.js/Tailwind major
version jump in October that broke the Vercel build, and a backend Dependabot queue
in November that was based on branches 6+ weeks stale) — the fix each time was to
bump the *floor* version manually in `requirements.txt`/`package.json` rather than
merge the bot's PR wholesale.

### NumPy — the math substrate
**Why:** BKT and LinUCB are both small amounts of linear algebra (matrix inverse,
dot products) per request — NumPy is the standard, fast, dependency-light way to do
that in Python, with no need for a heavier ML framework (no gradient descent, no
GPU, nothing to train) because both algorithms update their state in closed form on
every observation.

---

## Part 3 — The timeline: every phase, in order, with the why

### Genesis — Jul 29: the initial commit

> `c21b477 — Initial commit: Platform foundation, BKT, LinUCB, Zhipu AI Integration`

The project started with all three pillars already sketched: a BKT mastery model, a
LinUCB bandit for problem selection, and an LLM integration — but the LLM was
**Zhipu AI**, not Gemini (swapped in Phase 4 below). The *adaptive-learning idea*
was the whole point from day one; everything after this is refining, fixing, and
re-platforming that idea, not changing what the product is.

### Aug 11 — Phase 4 (first naming scheme): stabilizing the prototype

> `fc34246 — Complete Phase 4: Final bug fixes, integration, error boundaries, and E2E smoke tests`

Phase numbers reset and get reused several times across this project's life (there's
a "Phase 4" in August *and* a different "Phase 4" later, and a "Phase 1–8" sequence
that starts over again in October). Read phase numbers as *local* to the nearest
`.gsd/` planning document or commit cluster, not as a single global counter.

### Aug 15 — the first full Phase 1–6 pass

A single day, six commits, each with a distinct concern:

1. **Phase 1 — backend refactoring and modularization** (`b6de4b4`)
2. **Phase 2 — ML agent architecture, state tracking, and execution correctness** (`07c1755`)
3. **Phase 3 — expand problem set to 60 conceptual DSA challenges** (`1efe2c5`)
4. **Phase 4 — frontend state management and UX polish** (`0b386f7`)
5. **Phase 5 — integration tests and infrastructure** (`140eaab`, `f757dfb`, `e892f5a`)
6. **Phase 6 — problem browsing and admin extensions** (`46eddf3`)

Followed same-day by `7da46b9 — Fix all remaining bugs B1-B12 and M1-M5` and
`327838e — Implement high security hardening across backend and frontend`. First
appearance of a recurring pattern: **a numbered bug list (B1, B2, … / M1, M2, …)
gets written down, then knocked out in one pass** — this project's de facto issue
tracker, living in commit messages instead of GitHub Issues.

### Aug 22–24 — docs cleanup, the Gemini migration, and a dependency-chaos week

- `cb5b184`, `4d8b5ca` — README and contributor-guideline cleanup.
- `b496550 — Phase 4: Refined AI Core, Gemini migration, Security, and CI setup` —
  **Zhipu AI replaced by Google Gemini**, still in use today.
- A dense run of same-day fixes on Aug 24: GSAP installed for animation, TS/ESLint
  errors relaxed to unblock a Vercel build, a Render deploy breaks over an invalid
  `uvicorn` flag, **Judge0** gets RapidAPI headers added to keep working — then,
  same day, `a61a7d0 — Implement local sandboxing for both Python and Java to bypass
  Judge0 entirely`. First sign the team decided a rate-limited external execution API
  wasn't a long-term fit. "Run code ourselves" becomes a recurring goal not finished
  until the Piston+Tailscale work in late September.
  - Immediately after: two Java/Debian install fixes (`ecc88ca`, `a978f02`), a
    `NameError` fix in a FastAPI dependency (`beb6643`), a CSP fix for Render API
    connections (`8147ed9`), and **three** separate Supabase/httpx dependency fights
    in a row (`1b1e5c4`, `6cd9381`, `c01e3e5`) before settling on supabase 2.4.3 +
    httpx 0.27.0. Then two version bumps (`2d66071` FastAPI, `a251e0d` NumPy) and an
    auth-error message improvement around Supabase email confirmation (`68bfd37`).
  - Closes with `fe064de — Phase 0: Safety Net — CI workflow and compose dedupe` and
    `59070ea — Phase 1: Correctness Fixes — execution bug, dropped hashed_password,
    guarded CORS`.

**Lesson visible here:** a huge fraction of early effort went into keeping the
*dependency graph* (Python packages, the hosting provider's quirks) working at all —
normal for a fast-moving small project, but it's why this window looks "noisy" even
though the product barely changed.

### Aug 26–27 — gamification, monetization, and the first big design overhaul

- `949d5d2` — fixes a specific execution/verdict-logging bug ("Bug 1").
- `fcdd21b — Phase 4 Gamification with Heatmap, POTD, Badges and Leaderboard` — the
  heatmap, Problem of the Day, badges, leaderboard all enter here (heatmap data
  stays synthetic until November — Phase F below).
- `f20dc88 — Phase 6 Paywall and Mock Upgrade` — a paywall concept with a *mock*
  upgrade flow, not connected to a real payment processor (stays mocked throughout).
- `59a53bb — Phase 7 Scalability, Telemetry, and CI/CD`.
- `e98f8f0 — complete frontend design overhaul using adaptcode.html`, then
  `8a8203d` and `a280982` integrate "React Bits" UI components — the **first** of at
  least three major visual redesigns this project goes through (fully replaced a
  month later, see Sep 30 below).
- `6314416`, `2981aa4` — a navbar bug fix and a local-dev auth bypass (mock user,
  skip the landing-page redirect) so the team could iterate on UI without fighting
  real auth every reload. Dev-only auth bypasses recur — always worth checking
  `ENV`/`TEST_MODE` handling stayed out of production (becomes an explicit,
  verified-closed security item in November — "C1" below).

### Sep 1–2 — the infrastructure detour: Oracle VM, a laptop, and a Cloudflare tunnel

> `8523b42 — chore: save oracle vm and laptop deployment state`
> `7a12346 — chore: setup next.js proxy to backend for local cloudflare tunnel`

Before Cloud Run + EC2 + Tailscale, the team tried an **Oracle Cloud free-tier VM**
and even a personal **laptop**, reached through a **Cloudflare tunnel**. Abandoned
within weeks — not mentioned again after September. Read this as: *before paying for
Cloud Run, the team tried to make deployment free, found it too fragile/manual to
rely on, and moved on.* Rest of the day: routine Dependabot bumps (slowapi, postcss,
email-validator, pydantic, next, eslint-config-next, tailwindcss) plus
`56c7166 — Connect UI template to backend, fix layout issues, clean up dummy pages`.

### Sep 22 — introducing "Get Shit Done" (GSD): a formal planning framework

> `1494708 — docs(gsd): initialize get shit done framework with project spec, roadmap, and state`

A structural turning point. `.gsd/` (`SPEC.md`, `ROADMAP.md`, `STATE.md`, `PLAN.md`,
`ARCHITECTURE.md`, `STACK.md`) is a lightweight project-management system living *in
the repo* — so a development session interrupted (a different AI context window, a
different day) can read `.gsd/STATE.md` and resume exactly where the last one left
off instead of re-deriving context. From here on: numbered **milestones (m1…m10)**,
then lettered **Phases (A, B, C…)** — the same bug-list pattern, formalized.

### Sep 22–23 — the m1–m10 milestone marathon

Database pipeline/schema alignment (m1); rebuilt LinUCB as a correctly-persisted
per-request agent matching the real `agent_state` table (m2); frontend state-key
mismatches fixed (m3); connection pooling tuned, dev auth bypass secured (m4);
submission pipeline verdict mapping and payload limits stabilized (m5); Gemini
integration secured, a frontend polling memory leak patched (m6); single source of
truth enforced for the prerequisite graph and mastery threshold (m7); a memory-heavy
in-process leaderboard computation replaced by a Postgres RPC aggregation for
performance (m8); post-solve modal and dynamic next-problem routing added (m9);
onboarding diagnostic flow and mastery-DAG visualization added (m10) — followed by
`15c2e2c — remediate N1-N10 critical architectural bugs` and
`82844dc — synchronize seed_db and frontend with DB schema`.

**Why this matters:** this is the point where the *adaptive loop* (BKT + LinUCB +
real telemetry) stopped being a sketch and became internally consistent — frontend
state, API payloads, DB schema, and the bandit's own state table finally agreed with
each other.

### Sep 25 — fixing the math itself, and committing to Piston + Tailscale for real

> `5a51bef — refactor(math): fix BKT and LinUCB mathematical logic and simulator`
> `8c10b01 — chore: commit forensic audit report and one-off math remediation scripts`

A dedicated pass specifically on whether the BKT/LinUCB *equations* were correct —
not just "does the code run," but "is the math right" — with a written forensic
audit. Same day: `cde733a` updates `schema.sql`/RLS for BKT matrices; `402d0a5`
fixes a dashboard crash from missing math parameters; `09f9eae` removes
module-level Supabase client instantiation (a classic Python gotcha — creating a
network client at *import time* instead of *request time* crashes the whole app if
the network isn't ready); `11d70a9` and `4cd2bf1` — **this is where Piston-over-
Tailscale, the architecture still in production today, is actually wired up**, after
Judge0 → local-sandboxing earlier in August; `2e8adfb` fixes the pytest suite's
imports and mocks.

### Sep 30 — the Next.js rebuild: second major frontend reset

> `2e7a297 — Rebuild AdaptCode UI in Next.js 14 with Tailwind, Lucide, Monaco`

After clearing out legacy scripts and mock HTML files, the frontend is rebuilt
again — this establishes the *current* stack (Next.js 14, Tailwind, Lucide icons,
Monaco), replacing the React-Bits-based UI from late August. `1be3270` fixes an icon
import break; `38a40a2` removes legacy pages, adds Languages/Skills to profile;
`5064dbd` merges PR #12 — one of only a couple of PR-based merges in this entire
history; almost everything else lands as a direct commit to `main`.
`8514ce9` finishes this stretch (new design system, test auth bypass, navbar).

### Oct 1–4 — the October design & feature phases (re-lettered "Phase 1" again)

- `787cc04 — apply comprehensive security patches based on SECURITY_FIXES.md`.
- `74f3443 — Phase 1 — learning-platform landing page`, polish same day (`213404e`, `346e5c5`).
- `a05ffc1 — Phase 2 — concept graph + mastery catalogue` — the prerequisite-graph
  visualization is introduced.
- `e1d5b79 — Phase 3 — hint system + CSP hydration fix`.
- `a9332af — Phase 4 — profile editing + learning preferences`.
- `7618f24 — Fix CI: UTF-8 requirements.txt + remove orphan frontend tests`.
- `703267c — UX audit — brutal pass across all screens`, acted on immediately:
  `3d52fc9 — Phase 5A — audit fixes: onboarding, explanation tab, teaching polish`.
- `d3c9712 — Phase 6 — three-theme system + concept list + workspace polish`, then
  `0f19674 — Phase 6B — audit cleanup`.
- `f06147d — ci: skip backend jobs until backend work resumes` — **origin of the
  backend-CI-gated-off rule in this repo's `CLAUDE.md` today.** Deliberate: the
  backend test suite needs live Supabase + Piston access and nobody wanted an
  unsupervised CI runner touching those.
- `a69560a — integrate glossy ribbon logo + animation`.
- `75b0f8d — Phase 7 — problem bank, concept-aware explanations, clean routing`.

### Oct 4–5 — Phase 8: wiring the frontend to the real backend (and a demo-mode detour)

> `1ce7370 — Phase 8 — backend wiring part 1 (auth + submit)`

The moment auth and the core submit loop stopped talking to mocks and started
talking to the real FastAPI backend. Followed by `ebf9bb7 — pin architecture summary
and session rules` (when `ARCHITECTURE.md` and the session-rules file were first
pinned) and `61b84cb` (an import fix).

A short-lived **demo mode** appears and disappears within ~24 hours:
`cf84301 — demo mode — TEST_MODE short-circuit on /api/submit` (fake a successful
submission without really executing code, for showing a working demo while real
execution was still being wired), then `7ace6e0`, then
`5f8224e — full real-mode loop — Piston+Tailscale, BKT, LinUCB, Supabase
persistence` makes the real loop work end-to-end, and `1da700e — remove demo mode —
real Piston + BKT + LinUCB loop verified end to end` deletes the shortcut once it
was no longer needed. **This matters**: a very similar impulse resurfaces as
leftover placeholder UI in November (`c251934`, below) and gets ripped out the same
way — the team keeps catching itself leaving fakes in and keeps removing them once
the real thing works.

Rest: `822bca0`/`08dc02f` wire the mastery grid and profile stats to real
`/api/mastery`/`/api/stats` (Phase 8B — the gap this repo's `CLAUDE.md` described as
open for weeks, finally closed in November's Phase B, below); `06da71d` seeds the
first 172 real LeetCode-derived problems with a Piston execution harness for
function-style submissions, with a fully-verified end-to-end trace written into the
commit message: "Two Sum submission → wrapped by harness → executed on EC2 Piston
over Tailscale → 8/8 test cases passed → BKT bumped arrays mastery to 0.70 → LinUCB
chose next problem"; `a0e4bd1` makes `/problems` and `/problem/[id]` read from that
real backend instead of the static `frontend/src/data/problems.ts` file.

### Oct 6 — the problem bank grows, Dependabot catches up, and Cloud Run arrives

- `a2ee90a — generate 518-problem adaptive curriculum with automated hidden test
  cases`, then `ff2f342 — expand problem bank to 473 LeetCode problems across 12
  concepts` (473 is what's actually seeded into Supabase and quoted in the README;
  518 is the underlying JSON corpus before seeding rules filter it down).
- A run of Dependabot merges (eslint-config-next, postcss, testing-library, next,
  tailwindcss, email-validator, fastapi, numpy, pydantic, slowapi), followed by
  `47f02af — downgrade next.js and tailwind to stable v14/v3 to fix Vercel deploy`
  and `785f94d` — the Dependabot bumps had quietly pushed Next.js/Tailwind to newer
  majors than the app was built for, breaking the build; fixed by deliberately
  pinning back down.
- `b62fbfa — protect hidden test cases on GET /api/problems/{id}` — a real
  vulnerability fix: the endpoint was returning the *hidden* test cases a student is
  graded against, letting anyone cheat by reading the network response.
- `f5e5782`, `7429728` — repo cleanup.
- `beb0d01 — launch blockers #3-#7` — cross-origin cookie flags fixed for the
  Vercel↔Cloud-Run split, a real CORS allowlist + regex for Vercel previews, RLS
  turned on for every per-user table, a role-escalation vulnerability closed with a
  trigger, and — **a plaintext database password that had leaked onto public GitHub
  was found and rotated**.
- `2a0579c — Cloud Run + Tailscale sidecar deploy scaffolding` — **makes Cloud Run +
  Tailscale the backend's permanent home**, closing the infrastructure story that
  started with Render and detoured through Judge0, local sandboxing, and the Oracle
  VM/Cloudflare tunnel.

### Nov 8 — the lettered Phase A–G sprint: closing every remaining gap

A single very dense day:

- **Phase A** (`f39352c`) — full audit vs. an external dossier, correcting wrong
  numbers in the README, writing `docs/API.md` as the authoritative route reference,
  plus `.gsd/PLAN.md` as a resumable 6-phase checklist.
- `ed65dec` — a second, more thorough pass scrubbing a leaked secret out of HEAD.
- **Phase B** (`43c4a1c`) — wires `/api/mastery`, `/api/stats`, `/api/next-problem`,
  `/api/start`, `/api/abandon`, and the explanation poller to the frontend — **this
  closes the "Phase 8B not yet wired" gap**.
- **Phase C** (`dcd4033`) — the Google OAuth bridge: frontend gets a Supabase
  session via Google, hands the access token to a new `/api/auth/supabase-callback`,
  which re-verifies it server-side and mints AdaptCode's own `httpOnly` session
  cookie — so Google-authenticated and password-authenticated users land on exactly
  the same session mechanism.
- **Phase D** (`b219a41`) — deploy checklist + `DEPLOY.md` OAuth additions.
- **Phase E** (`118632f`) — a Playwright E2E smoke-test suite (6 tests).
- **Phase F** (`cdb1116`) — the activity heatmap switches from synthetic
  pseudo-random data to real `/api/stats/heatmap`; `/terms` and `/privacy` added
  (required for Google OAuth app verification); a branded 404 page added.
- `a5fa074`, `166e950`, `6b8a503` — same-day production bugs: CSP was blocking every
  real backend call; the shared LinUCB `agent_state` row hit an RLS violation;
  Gemini's model alias/timeout needed adjusting.
- **Phase G.1–G.3** (`071720c`, `4862003`, `810ed69`) — an attempted "Linear/Vercel-
  tier" visual redesign plus an editorial copy pass — **reverted the same day**
  (`2644771`), explicitly at the project owner's request, to refocus on wiring real
  functionality instead of visuals. The most direct, recorded example of a human
  course-correcting the direction mid-stream.
- `c251934 — kill every "demo" placeholder — nothing fake left` — a large pass
  replacing every remaining fake button/stat/dropdown across login, navbar, sidebar,
  problems list, problem detail, and settings with real backend-backed behavior,
  including four new auth endpoints (`identities`, `unlink-identity`, `export`,
  `account` delete).
- Remaining fixes: `aad020c` (Cloud Build substitution default), `4d91f78`
  (NumPy/Python-3.11 build), `d416799` (cleaner pinned deps), `a465768`
  (comma-*and*-semicolon-delimited `TRUSTED_PROXY_CIDRS`), `5dd6228` (adding
  `socksio` so `httpx` could route through Tailscale's SOCKS5 proxy — without it
  installed, that networking silently didn't work for outbound calls), `8d4577e`
  (an import-path fix).

### Nov 9 — the morning-after bug fix marathon

A full day fixing real bugs discovered by actually using the freshly-wired app in
production:

- `f899d72` — stop silently falling back to mock problems on backend failure; show a
  real sign-in gate on 401 instead.
- `d937a82`, `d5d8145`, `fb4540d` — three rounds on **account deletion**: sessions for
  a deleted account weren't invalidated properly; the check needed the actual
  `public.users` row rather than the Supabase admin API; `supabase-py`'s delete call
  was silently *no-op'ing*, requiring a direct PostgREST `DELETE` instead.
- `272f37b` — TS build target bumped to ES2017, a `Set` spread replaced.
- `57f1dc8` — Cloud Run origin allowed in CSP *unconditionally*.
- `0bb31eb` — prerender break from `useSearchParams` without a `<Suspense>` boundary.
- `abeffc5` — stop showing a signed-in-looking UI for anonymous users.
- `faa4bb3` — resolve problem slugs by looking up titles in the database.
- `972ed66` — allow the Monaco CDN through CSP (had silently blocked the editor).

### Nov 10 — polish, branding, observability, and the Sentry saga

- `3afa4eb` — `/api/submit` returns `mastery_delta` for "+0.08 mastery" UI feedback.
- `1b20c12`, `6b6af06` — profile/settings rewritten against only real backend data.
- `030160c`, `44d71c9` — Supabase and Vercel MCP servers registered at the project
  level (so any AI coding assistant on this repo has direct, scoped access to
  inspect the live database and deployment).
- `f0bcedf` — language tabs with no starter code hidden instead of shown broken; a
  Python stdin starter scaffolded; error/loading states added.
- `b3c8a09` — CI fixed: Playwright's E2E suite was being picked up by Jest; Node
  bumped to 20.
- `0990bf2`, `a5c71e9` — README rewritten into the full product/architecture
  reference, logo added to the hero.
- `5777c76`, `dd24627` — a social preview card (OG/Twitter meta), using the real 3D
  logo not a placeholder.
- `29ee0e9 — wire Sentry on frontend + backend (safe no-op without DSN)` — error
  monitoring arrives.
- **The Sentry saga, three separate silent failures in a row:**
  `fbac905 — trigger Vercel rebuild to inline Sentry DSN` (a stale build cache meant
  `NEXT_PUBLIC_SENTRY_DSN` wasn't actually baked into the client bundle — the SDK
  "initialized" with nothing to send to); `3df25f1 — allow Sentry ingest + replay
  POSTs through connect-src` (CSP silently blocked the browser's own envelope POST
  to Sentry); `8bef8ad — bypass Tailscale proxy for Sentry ingest hosts` (the
  backend's outbound HTTPS, forced through the Tailscale SOCKS5 proxy for Piston's
  sake, was silently eating the backend's own Sentry POSTs too — `NO_PROXY` needed
  the ingest hosts added). Three independent layers (build, browser CSP, backend
  networking) each had to be individually diagnosed before error reporting actually
  worked end to end — a clean illustration of why "the SDK initialized" is not proof
  of "events are arriving."
- `6b64bd2 — force LF on shell scripts; restore entrypoint.sh` — Windows'
  `autocrlf` had rewritten `backend/entrypoint.sh` to CRLF line endings, which broke
  container boot (`/usr/bin/env` couldn't find `sh\r` in the shebang — the `\r` is
  invisible in most editors but fatal to a shebang line). Fixed with a
  `.gitattributes` pin (`*.sh`, `Dockerfile`, `entrypoint*` → LF, always), so this
  class of bug can't recur regardless of which OS someone commits from.
- `5695995`/`705c78b`, `bdae495`/`186b686` — a "starter code heuristics" service
  (with unit tests) and a database batch-update script with a dry-run diff report,
  for fixing starter-code templates at scale (these are the two commits that later
  grow into the full multi-language starter effort merged as PR #27, Nov 11 below —
  **note the hashes differ from an earlier narration of this same work**: this
  branch's history was rewritten/split at some point between the two narrations; see
  "the history rewrite" entry under Nov 11).

### Nov 11 — the security sprint and the multi-language starter-code PR

A second very dense day, split across two threads of work:

**Thread 1 — multi-language starter code (merged as PR #27, `159118e`):**
`backend/app/services/starter_gen.py` is a heuristic engine that generates runnable
Python/Java/C++/JavaScript starter code for every problem in the 473-problem bank,
using pure-stdlib heuristics — it infers the input type from `test_cases[0].input`,
infers the output type from `expected_output`, and emits a `solve()` signature plus a
stdin reader and output formatter, per language, per problem. `backend/scripts/
generate_starters.py` is the idempotent updater that actually writes these into dev
Supabase (supports `DRY_RUN`/`LIMIT`/`LANG` env vars and exponential backoff on
429/5xx), backed by 18 passing tests in `test_starter_gen.py`. Result: 959 rows
(473 unique problems × up to 4 languages) now carry real scaffolds in dev Supabase;
a second run of the script was confirmed to be a no-op (idempotency verified in
practice, not just claimed); prod Supabase was deliberately left untouched pending
review. Follow-ups same day: `0b310c8` (dynamic Java result typing for raw-string/
fallback inputs) and `b590ac9` (renaming `BATCH_SIZE`→`CHUNK_SIZE` for clarity —
the script processes problems in chunks via the Supabase REST API, it does not run
one SQL `UPDATE ... WHERE IN (...)` statement, and the old name implied the latter).

**Thread 2 — a dedicated security-hardening sprint:**
- `0de900c — hide /docs, /redoc, /openapi.json in production` (see Part 2's FastAPI
  entry) — bundled with reverting the now-unnecessary "hide language tabs" frontend
  workaround, since PR #27 means every problem now has real starters in all four
  languages.
- `3a14419 — bump python-jose + psycopg2-binary version floors` — `python-jose
  >=3.5.0` for JWT algorithm-confusion fixes, `psycopg2-binary >=2.9.13` for
  libpq buffer-handling fixes. Done by bumping the floor in-place rather than merging
  the existing Dependabot PRs, because those PRs were based on branches over six
  weeks stale and would have reverted most of the recent work if merged as-is.
- `a1fdf2e — add SECURITY.md with threat model and backlog runbooks` — consolidates
  a previously-informal security backlog into the repository itself, ranked by
  severity, each item with a concrete runbook (see Part 6 for the full content).
- `4fc1474 — add SECURITY DEFINER hardening migration` — Supabase's own advisor
  flagged `register_user` and `promote_user_to_admin` as `SECURITY DEFINER`
  functions reachable from `anon` via `/rest/v1/rpc/*`. `promote_user_to_admin`
  turned out to have its own `auth.uid()` check already (false alarm); `register_
  user` did not — it took `p_auth_uid` as a trusted argument and inserted into
  `public.users` without ever checking it against the caller's real `auth.uid()`,
  a genuine privilege-adjacent risk. Fix: revoke `EXECUTE` from `anon`/
  `authenticated` on both (they're only ever called server-side via
  `service_role`, so no legitimate anonymous caller exists) and pin `search_path`
  on all four `SECURITY DEFINER`/trigger functions (an unpinned `search_path` on a
  `SECURITY DEFINER` function is a classic Postgres privilege-escalation vector —
  a caller able to create objects in a schema earlier in the path can shadow a
  function the definer-privileged function calls).
- `6af63be — per-user failed-login lockout and daily submit cap (#28)` — the two
  items that `SECURITY.md` had listed as "in flight." See Part 6 for the exact
  mechanics (`login_lockout.py`, `submit_quota.py`).
- `158616c — close #4.1 #4.2 after PR #28 deploy; unblock CAPTCHA item` — verified
  directly against the production Cloud Run revision after deploy: 5 failed logins
  against a test account produced `failed_count=5`, `locked_until = first + 15m` in
  the actual database row. Verifying a security fix against the real deployed
  system, not just a local test, is the standard this project held itself to here.

### Nov 12 — CAPTCHA, RLS gaps, runtime pinning, frontend wiring, and a CORS root cause

- `e5b026f — add Cloudflare Turnstile CAPTCHA on signup (feature-flagged)` — see
  Part 2 and Part 6.
- `21ea150 — enable RLS on audit_log, system_failures, problems` — three tables in
  `public` had RLS **off**, meaning the anon key shipped to every browser could, in
  principle, read and write them directly via Supabase's auto-generated REST API
  (bypassing FastAPI entirely). For `audit_log`/`system_failures` that's a direct
  exfiltration/tamper path; for `problems` it would let anyone overwrite the
  question bank. All three are only ever accessed via FastAPI using the
  `service_role` key (which bypasses RLS anyway), so enabling RLS with **zero**
  policies locks `anon`/`authenticated` out entirely — exactly the intended effect,
  verified by grepping the whole frontend for any direct Supabase read of these
  tables (there were none) before flipping the switch.
- `01bda25 — Piston runtime pinning scaffold (feature-flagged)` — see Part 2 and
  Part 6.
- `526cdd0 — wire ConceptGraph and mastery/[concept] to live backend` — the concept
  graph's nodes and the concept-detail page now read real BKT mastery via
  `useLiveMastery` and real problems via `/api/problems` filtered by `concept_tag`,
  with the offline-mock fallback preserved per `CLAUDE.md`.
- `87aae62 — record CORS fix and the gcloud comma-separator gotcha` — the root
  cause of a bug that had been silently degrading the app since the Phase 6/7/8A/8B
  wiring went live: the Vercel alias is `adapt-code.vercel.app` (**with** a dash),
  not the no-dash form, and Cloud Run's `FRONTEND_URL` env var needed to list
  *both*. On top of that, `gcloud`'s `--update-env-vars` flag uses commas as its own
  list separator, so a value that itself needs to contain a comma (two allowed
  origins) has to be passed with a different prefix (`^@^`) to escape it — otherwise
  `gcloud` silently truncates the value at the first comma. The practical effect
  before this fix: **every** live-wired endpoint was being CORS-blocked in
  production, so the frontend was silently falling back to static mocks the entire
  time across Phases 6, 7, 8A, and 8B — a strong illustration of why "it fell back
  to mock data instead of crashing" (a deliberate resilience feature, see Part 2) can
  also quietly hide a real, serious bug for a long time if nobody is specifically
  checking whether the *live* data path is actually being exercised.

### A note on the git history itself: a rebase/split happened

At some point between two working sessions on this project, the branch holding the
starter-code and Sentry-saga work (`feat/multi-lang-starters`) was rewritten — a
`backup/pre-split-feat-multi-lang-starters` ref exists in this repository as the
pre-rewrite snapshot, and at least one commit (an earlier version of this very
document) that existed on the pre-rewrite branch did not survive onto the branch
that eventually got merged into `main`. The practical lesson: **a rewritten/rebased
branch can silently drop a commit that isn't part of the feature the rebase was
organized around**, and the only way to catch it is to specifically diff the
old and new tips (`git merge-base --is-ancestor <hash> <ref>`) rather than assume a
push succeeded just because the branch name looks the same. This document itself is
the recovered/rewritten casualty of exactly that event — which is also, usefully,
the best possible proof of why a document like this needs to exist outside of any
one branch's survival.

---

## Part 4 — The algorithms, down to the code

### Bayesian Knowledge Tracing (BKT) — `backend/app/services/bkt.py`

**The intuition, from zero.** You can't see inside a student's head — you only see
whether they got a problem right or wrong. BKT's job is to maintain one number,
`P(L)` ("probability of Learned"), per student per concept, and update it sensibly
after every observation. A single right/wrong answer is ambiguous: a correct answer
might mean they know it, or they might have *guessed* (probability `pG`); a wrong
answer might mean they don't know it, or they *slipped* — knew it, made a careless
mistake (probability `pS`). BKT uses Bayes' rule to work out, given the observation
and known guess/slip rates, what fraction of the time that observation implies real
knowledge — that's a rigorous answer to "how much should this one data point move my
belief," rather than a hand-tuned +1/-1.

**The four parameters, read per-concept from the `bkt_params` table** (with a
hardcoded fallback `(l0=0.30, pT=0.12, pG=0.20, pS=0.10)` if the row or the DB call
is missing — see `get_bkt_params()`, which also caches results in-process so this
isn't a DB round-trip on every submission):
- `l0` — prior probability of already knowing the concept before any practice.
- `pT` ("transition") — probability of moving from unknown → known *from the act of
  attempting* the problem, independent of whether they got it right.
- `pG` ("guess") — probability of answering correctly without knowing the concept.
- `pS` ("slip") — probability of answering incorrectly despite knowing the concept.

**Step 1 — the behavioral weight, `compute_effective_weight()`.** A raw
right/wrong signal is too coarse: a clean, fast, first-try solve should count as
stronger evidence of mastery than a submission that only passed after 3 hints and 6
failed compiles. AdaptCode computes a penalty `ρ` (rho) from four weighted,
individually-capped signals and applies it only when the result was correct
(`result == 0` short-circuits to a weight of exactly `0.0` — a failure is a failure,
no partial credit):

```
ρ = λ_H · [hint used]                                    λ_H = 0.15
  + λ_K · min(max(0, attempts − 1), K_MAX)                λ_K = 0.05, K_MAX = 5
  + λ_C · min(compile_errors, C_MAX)                      λ_C = 0.03, C_MAX = 10
  + λ_τ · [time_on_task > 1200s]                          λ_τ = 0.10

ρ = min(ρ, 1.0)
w = result × (1 − ρ)        # w ∈ [0, 1]; w = 1.0 only for a clean, first-try, fast, correct solve
```

Hint usage is weighted heaviest (0.15) because asking for help is the most direct
signal the student didn't independently know the answer; raw compile errors are
weighted lightest (0.03) because a typo says very little about conceptual
understanding. Every penalty term is **capped** (at 5 extra attempts, 10 compile
errors) specifically so one pathological submission (50 compile attempts) can't
zero out the mastery credit for an otherwise-correct solve — diminishing, not
unbounded, returns.

**Step 2 — the Bayesian posterior update, `update_mastery()`.** Rather than
treating the outcome as a hard 0/1, AdaptCode blends the "correct" and "incorrect"
likelihood functions using `w` as the mixing weight — so a partially-discounted
correct answer (say `w = 0.7`) is treated as 70% as strong a "correct" signal and
30% as strong an "incorrect" signal, simultaneously, rather than rounding to one or
the other:

```
P(obs | know)     = w·(1 − pS) + (1 − w)·pS
P(obs | don't-know) = w·pG     + (1 − w)·(1 − pG)

P(know | obs) = [ P(obs | know) · P(know) ] / [ P(obs | know)·P(know) + P(obs | don't-know)·(1 − P(know)) ]
```

That's exactly Bayes' rule: the denominator is "every way this exact (weighted)
observation could have happened," the numerator is "the one of those ways where
they actually knew it" — so the ratio is, by definition, the updated belief given
the evidence. (If the denominator is ever exactly zero — a degenerate edge case —
the code leaves the prior unchanged rather than dividing by zero.)

**Step 3 — the learning transition.** Even a student who *didn't* know the concept
before this attempt can learn something just from attempting it, so the posterior
gets one more nudge toward 1 by `pT`:

```
P(know)_new = P(know | obs) + (1 − P(know | obs)) · pT
```

The result is clipped to `[0, 1]` (floating-point safety) and that's the number
written back to `mastery_scores.mastery_probability` for this student/concept, and
the exact number LinUCB reads as part of its context vector.

### LinUCB contextual bandit — `backend/app/services/linucb.py`

**The intuition, from zero.** Once you have a mastery estimate per concept, you
still need to decide what to show next. This is a different kind of problem — not
"estimate a hidden quantity," but "choose an action, then learn from the outcome,
repeatedly, differently for each student." That's the classic **multi-armed
bandit**: imagine slot machines with unknown payout rates — you want to find and
keep pulling the best one, but you also have to spend some pulls *exploring* the
others, or you risk getting stuck on a mediocre arm just because it paid off early
by chance.

LinUCB adds two ideas on top of a plain bandit:
1. **Contextual** — the best action depends on *this specific student's* current
   situation (mastery per concept, recent streak, error rate, time on task), not a
   single global ranking. So instead of learning one number per action, LinUCB
   learns a linear function from a context vector `x` to an expected reward, per
   action.
2. **Upper Confidence Bound** — rather than always picking the action with the
   highest *estimated* reward (which can get stuck exploiting a lucky early guess),
   LinUCB adds a bonus for actions it's *less certain about*, and picks
   `estimate + uncertainty bonus`. This balances exploration against exploitation
   without a separate random-exploration step.

**The five actions** (`LinUCBAgent.ACTIONS`): `easier_problem`, `same_difficulty`,
`harder_problem`, `redirect_prerequisite`, `hint_augmented`.

**The context vector, `build_context()` — exactly 16 numbers (`d=16`):**
- indices `0..11` — this student's current BKT mastery for each of the 12 concepts
  (in `PREREQUISITE_GRAPH` order), defaulting to `0.30` (the BKT prior `l0`) if
  unmeasured.
- index `12` — the lowest mastery among this student's *unlocked-but-unmastered*
  concepts (i.e. "how weak is my weakest open weak spot"), or `1.0` if every
  unlocked concept is already mastered.
- index `13` — fraction of the last 5 submissions that used a hint.
- index `14` — average attempt count of the last 5 submissions, scaled by `/10`.
- index `15` — average time-on-task of the last 5 submissions, scaled by `/1200`
  (i.e. normalized against the same 20-minute threshold BKT's behavioral weight
  uses).

**Per-student, per-action state — `A` and `b`.** For each of the 5 actions, the
agent keeps a `16×16` matrix `A_a` (initialized to the identity matrix) and a
16-vector `b_a` (initialized to zero), persisted as JSON in the student's
`agent_state` row and reloaded via `load_state()` on every request (this is a
**per-request** agent instantiation, not a long-lived in-memory singleton — the
state lives entirely in Postgres, which is what makes the service horizontally
scalable across Cloud Run instances with zero shared memory).

**Picking an action, `select_action()`:**

```
θ_a   = A_a⁻¹ · b_a                         # the current best-fit linear weights for action a
score_a = θ_a · x + α · √(xᵀ · A_a⁻¹ · x)   # exploitation + exploration bonus, α = 1.0
pick    = argmax_a score_a   (restricted to the allowed actions, see below)
```

The first term is "what reward do I expect from this action in this context, given
everything I've learned so far." The second term is the UCB exploration bonus —
mathematically, the width of a confidence ellipsoid around `θ_a` in the direction of
`x`; it's *larger* when `A_a` is close to its initial identity matrix (i.e. this
action hasn't been tried much in similar contexts yet), which is exactly the
"explore what you're uncertain about" behavior.

**Action gating, `get_allowed_actions()` — a hard constraint layered on top of the
bandit, not learned:** `easier_problem`, `same_difficulty`, and `hint_augmented`
(indices 0, 1, 4) are always allowed. `harder_problem` (2) is only allowed if the
student's mastery of the *current* concept is already ≥ 0.6 — the bandit is never
even given the *option* to recommend something harder than the student has shown
basic competence at, regardless of what the UCB score would say. `redirect_
prerequisite` (3) is only allowed if some prerequisite of the current concept is
below `MASTERY_THRESHOLD` (0.85) — i.e. the bandit can only suggest "go fix a
prerequisite" when one is actually unmastered. This is a deliberate design choice:
**pedagogical guardrails are hard-coded, not left for the bandit to discover from
reward signal alone** — a reinforcement-learning system with a bad reward function
could in principle "learn" to recommend something harmful; gating the action space
up front removes that failure mode entirely rather than trying to patch it via
reward shaping.

**The prerequisite DAG, `backend/app/services/prerequisites.py`** — the structural
map the action gate reads from:

```
basic_syntax → (none)
loops        → basic_syntax
arrays       → loops
strings      → arrays
hashing      → arrays
two_pointers → arrays
sliding_window → two_pointers
recursion    → loops
backtracking → recursion
binary_search → arrays, loops
trees        → recursion
dynamic_programming → recursion
```

(Also tiered 1/2/3 for difficulty-curve purposes, and `MASTERY_THRESHOLD = 0.85` is
the single constant that defines "mastered" everywhere in the system — both for
unlocking a concept and for gating the bandit's redirect action.)

**The reward signal, `compute_reward()` — computed for the *previous* step, once
its outcome is known:**

```
abandoned                          → reward = −0.5
accepted, hint used                → reward =  0.5
accepted, no hint                  → reward =  1.0
  + 0.2 bonus if this was a jump from easy/medium → hard, or easy → medium
not accepted                       → reward = −0.3
− 0.1 penalty if this is the 3rd+ consecutive submission at the same difficulty
```

Three design choices worth being able to explain out loud: (1) a hint-assisted
correct answer is rewarded *less* than a clean one (0.5 vs 1.0) — the bandit is
taught that "got it right with help" is a weaker success signal than "got it right
alone," nudging future action selection away from over-relying on hints; (2) a
genuine difficulty jump gets a bonus on top of the base reward, so the policy is
positively reinforced for correctly judging a student ready to level up, not just
rewarded for "any correct answer"; (3) three-in-a-row at the same difficulty is
mildly penalized specifically to discourage the bandit from getting stuck in a
comfortable local rut once mastery has clearly moved past it.

**Updating the model, `update()` — a single rank-1 update, no retraining:**

```
A_a ← A_a + x·xᵀ
b_a ← b_a + reward · x
```

This is the online linear-regression update that makes LinUCB cheap enough to run
synchronously inside an HTTP request: no gradient descent, no batch job, no
retraining pass — just two matrix additions, after which `θ_a = A_a⁻¹b_a` is already
the updated best-fit estimate for the next request.

### The code-execution harness — `backend/app/services/piston.py`

Piston runs raw files and can only report stdout/stderr/exit-code — it has no
concept of "call this function with these arguments." AdaptCode's problems are
LeetCode-style (`def twoSum(self, nums, target):`), so `wrap_code()` generates a
small harness around the student's submission before sending it to Piston: for
Python, it appends a driver that reads newline-delimited JSON values from stdin,
JSON-decodes each into a positional argument, instantiates `Solution()`, calls the
named function, and prints the JSON-encoded result; the JavaScript harness does the
same via `fs.readFileSync(0, 'utf8')` and `JSON.parse`/`JSON.stringify`. This is why
hidden test cases are stored as plain `{input, expected_output}` strings rather than
a language-specific calling convention — the harness is what bridges "a JSON test
fixture" to "an actual function call" per language, and it's also why Java/C++
function-style grading is explicitly unimplemented today (harnessing a typed,
compiled language this way is materially harder than a dynamically-typed one, and
was deliberately deferred rather than half-built).

Output comparison (`_normalize_for_compare()`) round-trips both the actual and
expected output through `json.loads`→`json.dumps` with no extra whitespace before
comparing strings — this is what makes `[0, 1]` and `[0,1]` compare equal, and
`true`/`True` issues disappear, without needing a bespoke per-type comparator.

### The LLM explanation call — `backend/app/services/gemini.py`

Only fires (as a FastAPI background task, non-blocking) when a submission's
verdict isn't `accepted`. Selects one of 12 **concept-specific prompt fragments**
(e.g. for `dynamic_programming`: "Focus on overlapping subproblems, optimal
substructure, state definition, and transition relation") and builds a prompt
containing the student's exact code, the verdict, and the error/diff output, with
an explicit instruction to return **exactly** a 3-field JSON object
(`what_went_wrong`, `why_approach_fails`, `concept_to_review`) and an explicit
instruction to **never** provide the corrected solution — the product's pedagogical
stance is explanation, not answers. Retries on HTTP 429 with exponential backoff,
falls back to a generic explanation after 3 failures, so a Gemini outage degrades
gracefully instead of leaving the student stuck with no feedback at all.

---

## Part 5 — The database, exactly as it is

| Table | Purpose | Who can touch it directly (RLS) |
|---|---|---|
| `users` | Auth + profile mirror (`user_id`, `email`, `display_name`, `is_pro`) | Row owner only |
| `problems` | The curriculum (~473 live rows): `concept_tag`, `difficulty_level`, `test_cases` (JSONB, includes hidden cases), `starter_code` (JSONB, now populated for all 4 languages via PR #27) | **RLS on, no policies** — only the backend's service_role key, which bypasses RLS |
| `sessions` | Grouped practice sessions | Row owner only |
| `session_events` | Granular telemetry: verdict, timing, hints, compile errors — the dataset the bandit learns from | Row owner only |
| `mastery_scores` | BKT state per student per concept | Row owner only |
| `agent_state` | LinUCB's personal `A`/`b` matrices per student, JSONB | Row owner only |
| `explanations` | Gemini post-mortems, polled by the frontend | Row owner only |
| `bkt_params` | Per-concept `(l0, pT, pG, pS)` — lets the four BKT constants be tuned per concept without a code deploy | Backend-only |
| `login_attempts` | Per-email failed-login counters + `locked_until`, used by `login_lockout.py` | Backend-only (direct psycopg2 or admin client) |
| `audit_log`, `system_failures` | Operational/security logging | **RLS on, no policies** — backend-only, same reasoning as `problems` |

**Why RLS even exists when the backend already checks `auth.uid()` in application
code:** defense in depth. If a FastAPI route ever has a bug that queries the wrong
user's row, or if the `anon` key ever leaked service-level intent, RLS is the
database itself refusing the query — a second, independent layer that doesn't trust
the correctness of the first. For tables the frontend should *never* touch directly
at all (`problems`, `audit_log`, `system_failures`), enabling RLS with **zero**
policies is a deliberate idiom here: it's not "misconfigured and needs policies
written," it's "intentionally locked to backend-only, verified by checking no
frontend code calls Supabase directly for these tables."

**Row-Level Security policies are enforced per user**; the backend uses the
`service_role` key only on the server side and never ships it to the frontend (this
is also enforced by a grep check in CI on every PR, per `SECURITY.md §3`).

---

## Part 6 — Security: the full threat model

(This section absorbs [`SECURITY.md`](../SECURITY.md) in full — read that file
directly for the latest version; this is the "why," reproduced here so the whole
story lives in one place.)

### System at a glance

```
Browser ── HTTPS ──▶ Vercel (Next.js, Edge/Node)
                         │  httpOnly cookie "adaptcode_session"
                         ▼
                    Cloud Run (FastAPI + Tailscale userspace sidecar)
                         │           ▲
                         │           │  Supabase REST + Gemini (public)
                         ▼           │
                      AWS EC2 (Piston code sandbox)
                      reachable only over Tailscale
                      (100.114.155.33:2000, no public port)
```

Everything that touches user input flows through the Cloud Run backend. The
frontend never holds the Supabase service key — only the anon key (public by
Supabase's own design) — and routes every write through FastAPI.

### Attack surface and hardening, surface by surface

| Surface | Who can reach it | What stops them |
|---|---|---|
| Public Vercel app | Anyone on the internet | Strict CSP `connect-src`; httpOnly session cookie; Sentry only active if a DSN is configured |
| FastAPI public routes | Anyone | Session-cookie auth; CORS pinned to the Vercel origin + a preview-URL regex; SlowAPI rate limiting; no OpenAPI/Swagger in prod |
| Piston sandbox | **Nobody from the public internet** | Tailnet-only, zero public ingress, per-run CPU/mem/timeout caps |
| Supabase Postgres | Public TLS endpoint, but… | RLS on every user-owned table; anon key cannot cross users; service key server-side only |
| Cloud Build → Cloud Run | Google-authenticated | Secret Manager for runtime secrets |
| Dev-only docs | localhost only | `/docs`/`/redoc`/`/openapi.json` on only when `ENV != production/staging` |

### What is already closed (verified, not just claimed)

- Interactive API docs return 404 in production (`backend/app/main.py`).
- CORS is a comma-separated allowlist plus a strict regex for Vercel previews; a
  non-HTTPS origin fails an assertion in prod/staging.
- Session cookie is `httpOnly`, `secure`, `SameSite=strict`; a CSRF token is issued
  separately (`backend/app/routers/auth.py`).
- Standard security headers everywhere: `X-Content-Type-Options`,
  `X-Frame-Options: DENY`, HSTS with `includeSubDomains`, legacy `X-XSS-Protection`.
- CSP blocks inline scripts except where Next.js nonces them; `connect-src` is
  limited to Sentry ingest, the Cloud Run API, and Supabase.
- Piston has no public port — even full compromise of the Cloud Run process
  couldn't be used to pivot to the sandbox from anywhere else on the internet.
- Secrets live in Secret Manager, not in env vars on disk or baked into the image.
- The frontend never reads the service key — enforced by project rule *and*
  verified with a grep check in CI on every PR.

### The backlog, ranked by severity, and what each item actually protects against

1. **Per-user failed-login lockout** — closed Nov 11 (`6af63be`, verified `158616c`).
   SlowAPI only rate-limits by IP; an attacker rotating IPs could still
   credential-stuff a single known email indefinitely. Progressive tiers:
   5 failures → 15 min lock, 10 → 1 hour, 20 → 24 hours, keyed by normalized
   (trimmed, lowercased) email, checked via a direct `psycopg2` connection using the
   database's own clock (`now()`) so client/server clock skew can't be exploited to
   bypass a lock.
2. **Per-user daily submit cap** — closed alongside #1. The Piston sandbox is the
   expensive, finite resource; a free account hammering `/api/submit` far faster
   than a human could type is a cost-abuse vector the cap belongs in FastAPI to stop,
   not something to leave to Piston's own per-run limits.
3. **Cloudflare in front (free tier) — open.** Even with SlowAPI, L7 abuse
   (slow-loris, UA rotation, cheap DDoS) hits Cloud Run directly today. The
   documented runbook (`SECURITY.md §5`): point DNS through Cloudflare with the API
   subdomain proxied ("orange cloud on") and the main Vercel domain left unproxied
   (Vercel needs to terminate its own TLS), SSL mode "Full (strict)" (not
   "Flexible," which would downgrade Cloud Run traffic to plain HTTP and break the
   httpOnly cookie path), the free Managed Ruleset + Bot Fight Mode enabled, a
   Managed Challenge on `/api/auth/*`, and one free-tier rate-limiting rule on
   `/api/*`.
4. **`SENTRY_DSN` → Secret Manager — open.** Currently set via a plain
   `--update-env-vars`, which means anyone with Cloud Run Viewer access can read it
   back out via `gcloud run services describe` and use it to send junk events into
   the project's Sentry quota. Low severity (Sentry's own docs call a DSN
   "pseudo-public") but cheap to fix properly, with the exact three `gcloud`
   commands already written down.
5. **CAPTCHA on signup** — closed Nov 12 (`e5b026f`, feature-flagged, inert until
   secrets are set). Stops automated account-creation farms.
6. **Piston runtime pinning + CVE audit** — scaffolded Nov 12 (`01bda25`,
   feature-flagged). `LANGUAGE_MAP` requesting `"version": "*"` for every language
   means a silent runtime upgrade on the EC2 host — including one with a freshly
   disclosed CVE — lands in production with zero code change and zero visibility.
   The fix is deliberately *not* a guessed version string; the runbook requires
   querying the live Piston host's installed runtimes first
   (`curl http://100.114.155.33:2000/api/v2/runtimes` over Tailscale) and pinning to
   whatever is actually installed, because a wrong guess makes Piston reject every
   request with a 400.
7. **Dependency floor bumps** — partially closed (`3a14419`); the residual
   Dependabot queue is stale (6+ weeks) and should be closed and allowed to
   regenerate against current `main` rather than merged as-is (see Part 2's
   Dependabot discussion for why).
8. **Audit logging for admin routes — open.** `/api/admin/*` writes to Supabase but
   doesn't log the acting user's id to a tamper-evident log. Deliberately low
   priority while the admin surface and admin-user count are both tiny — explicitly
   "worth it before a second admin exists," not before.

### What the frontend intentionally never does

- Never stores the Supabase service key.
- Never signs JWTs — only reads the `adaptcode_session` cookie FastAPI sets.
- Never calls Piston directly — every "run my code" path goes through
  `/api/submit`, so SlowAPI, auth, and the per-user submit cap all apply uniformly.
- Never uses `dangerouslySetInnerHTML` on user content — problem statements render
  through `react-markdown`'s default (safe) renderer.

### Dev-only exceptions, and why they're safe

- `/docs`/`/redoc` are live only when `ENV != production` — only reachable against a
  developer's own locally-running FastAPI, never against anything deployed (which
  always runs `ENV=production`).
- `frontend/src/data/problems.ts`'s static sample problems contain no secrets or
  PII — they exist purely as the offline-mode fallback.
- `backend/apply_migrations.py` reads `SUPABASE_DB_URL` from the environment and
  must never be committed with a real connection string — the plaintext DSN that
  used to live in that file (and had leaked onto public GitHub, Part 3) was rotated,
  and a commit hook now rejects re-adding one.

---

## Part 7 — Interview-ready Q&A

**"Walk me through what happens when a student submits code."**
`POST /api/submit` runs five phases synchronously-except-the-last: (1) fetch the
problem's hidden test cases, wrap the student's function in a stdin/stdout harness,
run each test case on Piston over Tailscale, and derive a verdict; (2) feed the
verdict plus behavioral signals (hints, attempts, compile errors, time) into BKT's
`compute_effective_weight()` → `update_mastery()`, write the new mastery probability;
(3) insert a `session_events` row with the full telemetry — this is the dataset the
bandit learns from; (4) load this student's personal LinUCB matrices, build the
16-dimensional context vector, score the allowed actions, pick the highest
exploitation+exploration score, query for a matching unsolved problem, and persist
the updated `A`/`b` matrices; (5) only if the verdict wasn't `accepted`, fire a
background task to Gemini for a 3-part explanation, which the frontend polls for
separately so the verdict itself returns instantly.

**"Why two separate algorithms instead of one model that does both?"**
Different questions deserve different tools. BKT answers "what does this student
currently know" with a principled, interpretable probability, using decades-old,
well-studied psychometric theory. LinUCB answers "what should happen next," given
that number plus recent behavior, while personalizing *online*, per student, from a
cold start — no pre-collected training set, no offline training job, no GPU.
Splitting them means each is independently testable (and was independently
audited — the Sep 25 "fix the math" pass treated them as two separate correctness
problems) and each stays small enough to reason about by hand.

**"Why Postgres Row-Level Security if the backend already checks permissions in
code?"** Defense in depth. Application-code checks can have bugs; RLS is the
database itself enforcing the same boundary independently, so a bug in one layer
doesn't become a full breach. Concretely in this project: three tables (`problems`,
`audit_log`, `system_failures`) had RLS *off* until Nov 12 — not because they needed
per-row policies, but because leaving RLS off at all meant the publicly-shipped anon
key could reach Supabase's auto-generated REST API for those tables directly,
bypassing FastAPI (and every check FastAPI does) entirely.

**"Why is the code sandbox on a completely different cloud (AWS) from the backend
(Google), connected over Tailscale instead of a VPC peering setup?"** Piston needs
privileged Docker to run its own sub-containers per language, which a serverless
platform like Cloud Run can't grant — so it needed its own always-on box, and EC2 was
the box chosen. Tailscale rather than VPC peering because the goal was "this
service has no public listener at all," not "this service is firewalled" — a
qualitatively stronger guarantee for the same traffic volume, with no ongoing
cross-cloud networking infrastructure to maintain.

**"What's the most interesting bug you fixed on this project?"** Two honest
candidates: (1) the CORS root-cause found Nov 12 — the Vercel alias needed the
dash (`adapt-code.vercel.app`) that an earlier config omitted, and `gcloud`'s own
flag syntax silently truncated a comma-containing env var at the first comma — the
practical effect was that *every* live-wired endpoint had been CORS-blocked in
production for weeks, invisibly, because the app's own offline-fallback feature
(a deliberate resilience design) was quietly masking it by falling back to mock
data instead of erroring loudly. (2) the Sentry rollout, where getting an SDK to
"initialize successfully" turned out to be three separate silent failures deep — a
stale build cache, a CSP block, and a VPN proxy silently eating outbound calls —
each invisible until specifically diagnosed, which is a good general lesson about
distributed systems: a component reporting "I started fine" says nothing about
whether its actual job (getting data somewhere else) is succeeding.

**"What would you do differently, or next, at 10x the users?"** From the documented,
still-open backlog: put Cloudflare in front of Cloud Run for L7 abuse protection
(today, SlowAPI is the only line of defense against anything beyond basic
IP-rate-limited abuse); move `SENTRY_DSN` into Secret Manager; pin Piston's runtime
versions explicitly instead of trusting "latest installed" (today a silent runtime
CVE could land in prod unnoticed); add audit logging for admin actions before a
second admin account exists; and re-enable the backend CI job once it can run
against a disposable Supabase/Piston test environment instead of being gated off by
design. On the product/ML side: finish Java/C++ function-style grading harnesses
(currently Python/JS-only), and wire the `hint_augmented` LinUCB action into the
router (it's defined and scored but not yet acted on end to end).

**"Why did the deploy target change four times?"** Each move was driven by a
concrete, named failure, not indecision: Render (an invalid startup flag, awkward
for running a second background process); a local-machine/Judge0 combo (external
rate limits on the single most central feature — grading code); an Oracle free-tier
VM behind a Cloudflare tunnel (free, but too fragile/manual — no autoscaling, no
managed TLS, a single point of failure); landing on Cloud Run + EC2 + Tailscale
because Cloud Run accepts an arbitrary Dockerfile (letting the Tailscale daemon boot
alongside FastAPI in one container, since Cloud Run only runs one container per
service), scales to zero, and integrates with Secret Manager — while EC2 (not
Cloud Run) hosts Piston specifically because Piston needs privileged Docker that a
serverless platform can't grant.

**"How do you know the math is actually correct, not just 'the code runs'?"**
There was a dedicated audit pass (Sep 25, `5a51bef` + a written forensic audit
report) specifically to verify the BKT and LinUCB *equations* against their
textbook definitions, separate from "does the feature work end to end" testing that
had already passed. Concretely, this document's own derivation above
(Part 4) was re-derived from the live source files, not transcribed from memory —
anyone can re-verify it against `backend/app/services/bkt.py` and `linucb.py`
directly.

---

## Part 8 — Recurring lessons, across the whole timeline

1. **"Demo mode" / fake placeholders are a trap the team fell into twice** (the
   `TEST_MODE` short-circuit in October, the dozens of "— demo" buttons killed in
   November's `c251934`). Both times, the fake path quietly outlived its usefulness
   and had to be hunted down and removed. If you add a shortcut to make something
   *look* done before it *is* done, write down where, and remove it the same day the
   real thing lands.
2. **Secrets leaked onto public GitHub, twice** (`beb0d01`, `ed65dec`). Always
   double-check scripts like `apply_migrations.py` read credentials from the
   environment, never hardcode them, even "temporarily."
3. **Deployment target churned four times before settling**: Render → local/Judge0
   → Oracle VM + laptop + Cloudflare tunnel → Google Cloud Run + AWS EC2 +
   Tailscale. Each move was driven by a concrete failure, not indecision. The
   `CLAUDE.md` "Project stack (locked)" rule exists specifically so this doesn't
   happen a fifth time without a deliberate decision.
4. **Dependabot auto-bumps broke the build at least twice** (Next.js/Tailwind
   majors in October; a stale backend queue flagged in November). Treat any
   automated major-version bump on this repo as something to verify against a real
   build before trusting it.
5. **Browser *and* VPN-proxy networking caused real, silent production outages,
   repeatedly** — CSP blocking the API and Monaco's CDN, the Tailscale SOCKS5 proxy
   silently eating Sentry's outbound POSTs, and, worst of all, a CORS
   misconfiguration that was invisible for weeks because the offline-fallback
   feature quietly papered over it. Whenever a new external domain or outbound
   target is introduced (a CDN, an API host, an error-reporting endpoint), update
   CSP *and* `NO_PROXY` at the same time — and periodically verify the *live* data
   path is actually being exercised, not silently falling back.
6. **Line endings matter more than they look like they should.** A CRLF-corrupted
   shebang line (`sh\r`) broke container boot outright; fixed once, permanently, via
   `.gitattributes`, rather than re-fixed by hand every time someone commits from
   Windows.
7. **A rewritten/rebased git branch can silently drop a commit that wasn't part of
   the feature the rebase was organized around** — happened once to this very
   document. Diff old and new branch tips specifically when a branch's history looks
   like it moved; don't assume a push succeeded just because the branch name is
   unchanged.
8. **Numbered bug lists, written down and then cleared in a batch, are this
   project's de facto issue tracker** — B1–B12/M1–M5 in August, N1–N10 in September,
   the `SECURITY.md §4` backlog (4.1–4.8) in November. If picking up where a
   previous session left off, grep the repo (`security/`, `SECURITY.md`, `.gsd/`)
   for a lettered or numbered list before assuming nothing was tracked.
9. **The math got a dedicated correctness pass separate from the feature work**
   (Sep 25). Treat BKT/LinUCB as code that deserves its own verification,
   independent of whether the surrounding feature "looks like it works" — and
   verify security fixes against the live deployed system, not just a local test
   (as was done for the Nov 11 login-lockout fix).
10. **A security advisor tool (Supabase's) caught a real bug an audit might have
    missed**, and also flagged one false alarm — both are useful outcomes, and the
    right response to an advisor finding is to verify each one individually (is this
    function actually reachable by an untrusted caller, and does it actually trust
    an unchecked argument), not to either dismiss every finding or fix every finding
    blindly.

---

## How this document stays alive

This file is a **living document**. `CLAUDE.md` carries an instruction telling
future development sessions: whenever a phase of work completes, a major pivot
happens (a new deploy target, a dropped/added dependency that mattered, a security
incident, a reverted decision), or the "Current state" section of `CLAUDE.md`
changes — add a dated entry to this file's timeline (Part 3), and update Part 8 if a
new recurring lesson emerges, Part 6 if the security posture changes, or Part 4/5 if
an algorithm or schema changes. Small bug fixes that don't change *how the system
works or why* don't need an entry here; this is the "why and how," not a changelog
(git log already is the changelog).

**Last narrated commit:** `87aae62` (2026-11-12) — "record CORS fix and the gcloud
comma-separator gotcha." If extending this document, run
`git log --reverse --pretty=format:"%h|%ad|%s" --date=short` and diff against that
hash to find everything not yet told.
