#!/usr/bin/env python3
"""Database update script for multi-language starter code scaffolds.

Generates runnable starter scaffolds (Python, Java, C++, JavaScript) and updates
the `starter_code` JSONB column in dev Supabase, one row at a time (PostgREST
does not support varying payloads in a single UPDATE). Rows are iterated in
chunks of CHUNK_SIZE purely for progress reporting cadence — this is not a
bulk-UPDATE path.
"""

from __future__ import annotations

import difflib
import logging
import os
import random
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

# Ensure backend directory is in sys.path
HERE = Path(__file__).resolve().parent
BACKEND = HERE.parent
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

# Automatically load backend/.env if not already loaded into os.environ
ENV_FILE = BACKEND / ".env"
if ENV_FILE.exists():
    with ENV_FILE.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k, v = k.strip(), v.strip()
            if k not in os.environ:
                os.environ[k] = v

from app.core.config import settings  # noqa: E402
from app.core.database import get_supabase_admin  # noqa: E402
from app.services.starter_gen import generate_starter_code  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Rows are iterated in chunks purely for progress-bar cadence (one UPDATE per
# row — PostgREST can't bulk-UPDATE varying payloads). Keep this around 50 so
# the progress bar refreshes often enough to feel responsive.
CHUNK_SIZE = 50
MAX_RETRIES = 5


def _format_time(seconds: float) -> str:
    """Format seconds into MM:SS or HH:MM:SS string."""
    seconds = max(0.0, seconds)
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"


def _render_progress_bar(
    current: int,
    total: int,
    start_time: float,
    action: str,
    item_id: str = "",
    bar_len: int = 20,
) -> None:
    """Render an in-place terminal progress bar via carriage return."""
    if total <= 0:
        return

    now = time.time()
    elapsed = now - start_time
    rate = current / elapsed if elapsed > 0 else 0.0
    remaining = total - current
    eta = remaining / rate if rate > 0 else 0.0
    pct = (current / total) * 100.0

    filled = int(bar_len * current / total)
    if filled >= bar_len:
        bar = "=" * bar_len
    elif filled > 0:
        bar = "=" * (filled - 1) + ">" + " " * (bar_len - filled)
    else:
        bar = " " * bar_len

    elapsed_str = _format_time(elapsed)
    eta_str = _format_time(eta)

    short_id = item_id[:8] if item_id else ""
    status = f"{action} {short_id}..." if short_id else action
    line = f"[{bar}] {current}/{total} ({pct:5.1f}%) Elapsed: {elapsed_str} ETA: {eta_str} | {status}"

    # Overwrite line and flush
    sys.stdout.write("\r" + line.ljust(90))
    sys.stdout.flush()


def _is_retryable_error(exc: Exception) -> bool:
    """Check if exception corresponds to HTTP 429 or 5xx server error."""
    # Check postgrest APIError or httpx status code attributes
    if hasattr(exc, "status_code"):
        sc = getattr(exc, "status_code")
        if sc == 429 or (500 <= sc < 600):
            return True
    if hasattr(exc, "response") and hasattr(exc.response, "status_code"):
        sc = getattr(exc.response, "status_code")
        if sc == 429 or (500 <= sc < 600):
            return True
    if hasattr(exc, "code"):
        code_str = str(getattr(exc, "code"))
        if code_str == "429" or (len(code_str) == 3 and code_str.startswith("5")):
            return True

    err_text = str(exc).lower()
    if "429" in err_text or "too many requests" in err_text or "rate limit" in err_text:
        return True
    if any(
        status in err_text
        for status in ("500", "502", "503", "504", "bad gateway", "gateway timeout", "service unavailable")
    ):
        return True

    return False


def _update_starter_code_with_backoff(
    sb: Any,
    problem_id: str,
    new_starter: Dict[str, str],
    max_retries: int = MAX_RETRIES,
) -> None:
    """Update starter_code for problem_id with exponential backoff on 429/5xx."""
    for attempt in range(max_retries):
        try:
            sb.table("problems").update({"starter_code": new_starter}).eq("problem_id", problem_id).execute()
            return
        except Exception as exc:
            if attempt < max_retries - 1 and _is_retryable_error(exc):
                backoff = (0.5 * (2**attempt)) + random.uniform(0.1, 0.4)
                logger.warning(
                    "Retryable error on problem %s (attempt %d/%d): %s. Backing off %.2fs",
                    problem_id,
                    attempt + 1,
                    max_retries,
                    exc,
                    backoff,
                )
                time.sleep(backoff)
                continue
            raise


def _print_diff(
    problem: Dict[str, Any],
    existing_starter: Dict[str, str],
    new_starter: Dict[str, str],
    idx: int,
    total_diffs: int,
) -> None:
    """Print readable before/after diff for a problem during dry run."""
    title = problem.get("title", "Untitled")
    pid = problem.get("problem_id", "unknown")
    concept = problem.get("concept_tag", "none")

    print("=" * 80)
    print(f"Diff [{idx}/{total_diffs}]: {title} (ID: {pid}) | Concept: {concept}")
    print("-" * 80)
    print(f"--- BEFORE (starter_code keys: {sorted(list(existing_starter.keys()))}) ---")
    for lang in sorted(existing_starter.keys()):
        code = existing_starter[lang]
        lines = code.strip().splitlines()
        print(f"[{lang}]:")
        for line in lines[:8]:
            print(f"  {line}")
        if len(lines) > 8:
            print(f"  ... ({len(lines) - 8} more lines)")

    print()
    print(f"+++ AFTER (starter_code keys: {sorted(list(new_starter.keys()))}) +++")
    for lang in sorted(new_starter.keys()):
        code = new_starter[lang]
        lines = code.strip().splitlines()
        print(f"[{lang}]:")
        for line in lines[:10]:
            print(f"  {line}")
        if len(lines) > 10:
            print(f"  ... ({len(lines) - 10} more lines)")
    print("=" * 80)
    print()


def fetch_all_problems(sb: Any, limit: Optional[int] = None) -> List[Dict[str, Any]]:
    """Fetch problems from Supabase table with pagination in blocks of 500."""
    problems: List[Dict[str, Any]] = []
    page_size = 500
    offset = 0

    while True:
        target_end = offset + page_size - 1
        query = (
            sb.table("problems")
            .select("problem_id, title, description, concept_tag, test_cases, starter_code")
            .range(offset, target_end)
        )
        res = query.execute()
        data = res.data or []
        if not data:
            break

        problems.extend(data)

        if limit is not None and len(problems) >= limit:
            problems = problems[:limit]
            break

        if len(data) < page_size:
            break

        offset += page_size

    return problems


def main() -> int:
    supabase_url = os.environ.get("SUPABASE_URL") or settings.SUPABASE_URL
    print(f"SUPABASE_URL: {supabase_url}")

    is_dry_run = os.environ.get("DRY_RUN", "0") in ("1", "true", "True")
    raw_limit = os.environ.get("LIMIT")
    limit: Optional[int] = int(raw_limit) if raw_limit and raw_limit.isdigit() else None
    raw_lang = os.environ.get("LANG")
    target_languages: Optional[List[str]] = (
        [lang.strip() for lang in raw_lang.split(",") if lang.strip()] if raw_lang else None
    )

    if is_dry_run:
        print("[DRY RUN MODE ENABLED: No database writes will be executed]")
    if limit is not None:
        print(f"[LIMIT: Processing up to {limit} problems]")
    if target_languages:
        print(f"[LANGUAGES: Generating only {target_languages}]")

    sb = get_supabase_admin()
    problems = fetch_all_problems(sb, limit=limit)
    total = len(problems)
    print(f"Fetched {total} problems from database.")

    if total == 0:
        print("{updated: 0, skipped: 0, failed: 0}")
        return 0

    # Determine diff count for dry run
    max_diffs = 0
    if is_dry_run:
        if limit is not None:
            max_diffs = min(total, limit)
        else:
            max_diffs = min(total, 5)

    updated = 0
    skipped = 0
    failed = 0

    diffs_printed = 0
    start_time = time.time()

    # Pre-render diffs if dry run
    if is_dry_run and max_diffs > 0:
        print("\n" + "=" * 80)
        print(f"DRY RUN STARTER CODE DIFFS (Showing {max_diffs} problems)")
        print("=" * 80 + "\n")
        for i in range(max_diffs):
            p = problems[i]
            existing = p.get("starter_code") or {}
            generated = generate_starter_code(
                test_cases=p.get("test_cases") or [],
                concept_tag=p.get("concept_tag") or "",
                title=p.get("title") or "",
                languages=target_languages,
            )
            merged = dict(existing)
            merged.update(generated)
            _print_diff(p, existing, merged, i + 1, max_diffs)
            diffs_printed += 1

    print("\nStarting row-by-row processing...")
    current_idx = 0

    # Chunked iteration only for progress-bar pacing — each row is its own UPDATE.
    for chunk_start in range(0, total, CHUNK_SIZE):
        chunk = problems[chunk_start : chunk_start + CHUNK_SIZE]

        for problem in chunk:
            current_idx += 1
            pid = problem.get("problem_id", "")
            title = problem.get("title", "")
            concept_tag = problem.get("concept_tag", "")
            test_cases = problem.get("test_cases") or []
            existing_starter = problem.get("starter_code") or {}

            try:
                generated = generate_starter_code(
                    test_cases=test_cases,
                    concept_tag=concept_tag,
                    title=title,
                    languages=target_languages,
                )

                new_starter = dict(existing_starter)
                new_starter.update(generated)

                # Strict idempotency check
                if new_starter == existing_starter:
                    skipped += 1
                    _render_progress_bar(current_idx, total, start_time, "Skipped", pid)
                    continue

                if is_dry_run:
                    updated += 1
                    _render_progress_bar(current_idx, total, start_time, "DryRun", pid)
                else:
                    _render_progress_bar(current_idx, total, start_time, "Updating", pid)
                    _update_starter_code_with_backoff(sb, pid, new_starter)
                    updated += 1

            except Exception as exc:
                failed += 1
                logger.error("Failed processing problem %s (%s): %s", pid, title, exc)
                _render_progress_bar(current_idx, total, start_time, "Failed", pid)

    # Complete progress bar with newline
    sys.stdout.write("\n")
    sys.stdout.flush()

    # Log exact required final summary
    print(f"{{updated: {updated}, skipped: {skipped}, failed: {failed}}}")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
