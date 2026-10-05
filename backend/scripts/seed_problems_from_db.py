"""
Seed the Supabase `problems` table from problems_db/final_problems_db.json.

For each of our 12 concepts, pick up to 5 Easy + 5 Medium + 5 Hard problems
whose LeetCode topics map to that concept. Each problem is upserted with:
  - problem_id      = deterministic uuid5(DNS, "adaptcode.problem." + slug)
  - starter_code    = {_meta: {function_name, parameters, returns_json},
                       python/java/javascript/cpp: original LeetCode templates}
  - test_cases      = normalized list of {input: str, expected_output: str, is_hidden: bool}
                      where `input` is newline-separated JSON args and `expected_output`
                      is the expected JSON result (the backend's Piston harness feeds
                      stdin and compares stdout).

Idempotent: safe to re-run (upserts on problem_id).
"""
from __future__ import annotations

import json
import os
import sys
import uuid
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List

HERE = Path(__file__).resolve().parent
BACKEND = HERE.parent
sys.path.insert(0, str(BACKEND))

from app.core.database import get_supabase_admin  # noqa: E402

PROBLEMS_JSON = BACKEND.parent / "problems_db" / "final_problems_db.json"

# Our 12 concept slugs → list of LeetCode topic names (any match counts).
# Order matters only for display; selection is first-match.
CONCEPT_TOPIC_MAP: Dict[str, List[str]] = {
    "basic_syntax":        ["Math", "Counting", "Simulation"],
    "loops":               ["Simulation", "Counting", "Enumeration"],
    "strings":             ["String"],
    "arrays":              ["Array"],
    "hashing":             ["Hash Table", "Hash Function"],
    "two_pointers":        ["Two Pointers"],
    "sliding_window":      ["Sliding Window"],
    "recursion":           ["Recursion", "Divide and Conquer"],
    "backtracking":        ["Backtracking"],
    "binary_search":       ["Binary Search"],
    "trees":               ["Tree", "Binary Tree", "Binary Search Tree", "Trie"],
    "dynamic_programming": ["Dynamic Programming"],
}

DIFF_MAP = {"Easy": "easy", "Medium": "medium", "Hard": "hard"}
NAMESPACE = uuid.NAMESPACE_DNS


def slug_to_uuid(slug: str) -> str:
    return str(uuid.uuid5(NAMESPACE, f"adaptcode.problem.{slug}"))


def normalize_test_cases(raw: List[dict]) -> List[Dict[str, Any]]:
    """LeetCode-shape test case → our Piston harness shape.

    LC: {input: ["[2,7,11,15]", "9"], output: "[0,1]", isHidden: bool}
    Ours: {input: "[2,7,11,15]\\n9", expected_output: "[0,1]", is_hidden: bool}
    """
    out = []
    for tc in raw:
        args = tc.get("input") or []
        if not isinstance(args, list):
            continue
        stdin = "\n".join(str(a) for a in args)
        expected = tc.get("output", "")
        if not isinstance(expected, str):
            expected = json.dumps(expected, separators=(",", ":"))
        out.append({
            "input": stdin,
            "expected_output": expected,
            "is_hidden": bool(tc.get("isHidden", False)),
        })
    return out


def pick_problems(all_problems: List[dict]) -> Dict[str, List[dict]]:
    """Return {concept_tag: [problems...]} with up to 5 of each difficulty."""
    # Pre-index for fast topic lookup.
    chosen_slugs: set[str] = set()
    out: Dict[str, List[dict]] = defaultdict(list)

    for concept, topics in CONCEPT_TOPIC_MAP.items():
        topic_set = set(topics)
        buckets: Dict[str, List[dict]] = {"Easy": [], "Medium": [], "Hard": []}
        for p in all_problems:
            if p["problem_slug"] in chosen_slugs:
                continue
            pf = p.get("parsed_function") or {}
            if not pf.get("test_cases"):
                continue
            if not any(t in topic_set for t in p.get("topics") or []):
                continue
            diff = p.get("difficulty")
            if diff not in buckets or len(buckets[diff]) >= 5:
                continue
            buckets[diff].append(p)

        selected = buckets["Easy"] + buckets["Medium"] + buckets["Hard"]
        for p in selected:
            chosen_slugs.add(p["problem_slug"])
            out[concept].append(p)

    return out


LANG_KEYS = {"python": "python", "java": "java", "javascript": "javascript", "cpp": "cpp"}


def to_supabase_row(concept: str, p: dict) -> Dict[str, Any]:
    pf = p["parsed_function"]
    test_cases = normalize_test_cases(pf.get("test_cases") or [])

    # Original LC code_snippets keys map directly to our starter_code languages.
    starter: Dict[str, Any] = {
        "_meta": {
            "function_name": pf.get("function_name"),
            "parameters": pf.get("parameters") or [],
            # If output looks like a JSON structure (list/dict/number as JSON), we
            # compare after json.loads of both sides. Otherwise, string compare.
            "compare_as_json": True,
        }
    }
    code_snippets = p.get("code_snippets") or {}
    for lang_in, lang_out in LANG_KEYS.items():
        if lang_in in code_snippets:
            starter[lang_out] = code_snippets[lang_in]

    description = p.get("description") or ""
    # Keep examples readable in the description — the raw LC description trims them.
    examples_text = ""
    for ex in (p.get("examples") or [])[:3]:
        examples_text += "\n\n" + (ex.get("example_text") or "")
    if examples_text:
        description = description + examples_text

    hint_text = ""
    hints = p.get("hints") or []
    if hints:
        hint_text = "\n\n".join(h for h in hints[:3] if isinstance(h, str))

    return {
        "problem_id": slug_to_uuid(p["problem_slug"]),
        "title": p.get("title") or p["problem_slug"],
        "description": description.strip()[:8000],  # safety cap
        "concept_tag": concept,
        "difficulty_level": DIFF_MAP[p["difficulty"]],
        "test_cases": test_cases,
        "hint_text": hint_text[:4000] or None,
        "starter_code": starter,
    }


def main() -> int:
    if not PROBLEMS_JSON.exists():
        print(f"ERR: {PROBLEMS_JSON} not found", file=sys.stderr)
        return 2
    with PROBLEMS_JSON.open(encoding="utf-8") as f:
        all_problems = json.load(f)

    picked = pick_problems(all_problems)
    rows: List[Dict[str, Any]] = []
    for concept, items in picked.items():
        for p in items:
            rows.append(to_supabase_row(concept, p))

    print(f"Picked {len(rows)} problems across {len(picked)} concepts.")
    for concept, items in picked.items():
        by_diff: Dict[str, int] = defaultdict(int)
        for p in items:
            by_diff[p["difficulty"]] += 1
        parts = [f"{d}:{by_diff.get(d, 0)}" for d in ("Easy", "Medium", "Hard")]
        print(f"  {concept:22s} {len(items):3d}  ({', '.join(parts)})")

    if os.environ.get("DRY_RUN") == "1":
        print("\nDRY_RUN=1 — not writing to Supabase.")
        return 0

    sb = get_supabase_admin()
    # Upsert in batches to keep each HTTP body reasonable.
    BATCH = 25
    written = 0
    for i in range(0, len(rows), BATCH):
        chunk = rows[i : i + BATCH]
        sb.table("problems").upsert(chunk, on_conflict="problem_id").execute()
        written += len(chunk)
        print(f"  upserted {written}/{len(rows)}")
    print(f"\nDone — {written} problems in Supabase.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
