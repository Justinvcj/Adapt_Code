# Testing

## Backend — pytest

Still has import debt; CI gates it off (`.github/workflows/ci.yml` → `if: ${{ false }}`). Do not re-enable without sign-off ([CLAUDE.md](../CLAUDE.md)).

```bash
cd backend && pytest tests/
```

## Frontend — Jest unit tests

```bash
cd frontend && npm test
```

## Frontend — Playwright E2E (smoke)

Playwright runs `npm run dev` for you when `PLAYWRIGHT_BASE_URL` is unset, and passes against mocks (no backend needed) because the UI has an offline fallback (see [CLAUDE.md](../CLAUDE.md)).

### Run against local dev
```bash
cd frontend
npx playwright install chromium   # one time
npm run test:e2e                  # headless, 6 smokes, ~12s warm
npm run test:e2e:ui               # interactive UI mode
```

### Run against a deployed URL
```bash
PLAYWRIGHT_BASE_URL=https://adaptcode.vercel.app npx playwright test
```

### What the smokes cover

| Spec | Check |
|---|---|
| homepage | Title + Learn CTA + mastery panel heading |
| login | Sign-in / Create-account tabs + Google button |
| problems list | Renders a problem row |
| problem page | Run/Submit buttons + editor container (`.ed-area`, `select.lang-sel`) |
| onboarding | Concept picker renders with at least one tile |
| /learn | Dispatcher redirects to `/problem/<slug>` |

**Why no `.monaco-editor` assertion?** `@monaco-editor/react` loads via `next/dynamic` and doesn't always finish mounting in headless Chromium (known upstream issue with the web-worker loader). The container (`.ed-area`) is a stable proxy — if that's visible, the dynamic import ran and the page is laid out.
