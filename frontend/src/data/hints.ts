export type HintTier = 'nudge' | 'scaffold' | 'near_solution';

export type Hint = {
  tier: HintTier;
  title: string;
  body: string;
  mastery_multiplier: number;   // multiplied into the BKT weight on correct solve
};

export type ProblemHints = {
  problem_id: string;
  hints: Record<HintTier, Hint>;
};

export const TIER_LABEL: Record<HintTier, string> = {
  nudge:         'Nudge',
  scaffold:      'Scaffold',
  near_solution: 'Near-solution',
};

export const TIER_PENALTY_LABEL: Record<HintTier, string> = {
  nudge:         'No penalty',
  scaffold:      'Mastery × 0.7',
  near_solution: 'Mastery × 0.4',
};

/**
 * Hint availability rules — matches `backend/app/routers/problems.py`
 * diagnostic-escalation thresholds (attempt ≥ 2, compile errors ≥ 3,
 * or time ≥ T(difficulty)).  See docs/HINT_SYSTEM.md.
 */
export type HintCtx = {
  attempt_count: number;
  compile_errors: number;
  time_on_task_seconds: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

const TIME_THRESHOLD: Record<'Easy' | 'Medium' | 'Hard', number> = {
  Easy: 300, Medium: 600, Hard: 1200,
};

export function isHintAvailable(ctx: HintCtx, tier: HintTier): boolean {
  // Nudge is available after any struggle signal
  if (tier === 'nudge') {
    return ctx.attempt_count >= 2
        || ctx.compile_errors >= 3
        || ctx.time_on_task_seconds >= TIME_THRESHOLD[ctx.difficulty];
  }
  // Scaffold needs a stronger signal
  if (tier === 'scaffold') {
    return ctx.attempt_count >= 3
        || ctx.compile_errors >= 5
        || ctx.time_on_task_seconds >= TIME_THRESHOLD[ctx.difficulty] * 1.5;
  }
  // Near-solution is a last resort
  return ctx.attempt_count >= 4
      || ctx.compile_errors >= 8
      || ctx.time_on_task_seconds >= TIME_THRESHOLD[ctx.difficulty] * 2;
}

export function nextAvailableAt(ctx: HintCtx, tier: HintTier): string {
  const T = TIME_THRESHOLD[ctx.difficulty];
  if (tier === 'nudge')         return `After attempt 2, or ${T}s on task`;
  if (tier === 'scaffold')      return `After attempt 3, or ${Math.round(T * 1.5)}s on task`;
  return `After attempt 4, or ${T * 2}s on task`;
}

export const HINTS_BY_PROBLEM: Record<string, ProblemHints> = {
  'two-sum': {
    problem_id: 'two-sum',
    hints: {
      nudge: {
        tier: 'nudge',
        title: 'Think about what you repeat',
        body: 'A pair of indices where nums[i] + nums[j] == target. The brute force checks every pair — can you avoid checking any pair twice? What are you asking the array *for* on each outer iteration?',
        mastery_multiplier: 0.9,
      },
      scaffold: {
        tier: 'scaffold',
        title: 'Trade space for time with a map',
        body: 'For each num at index i, you need to know whether target - num has already appeared earlier. A hash map keyed by number → index lets you ask that question in O(1). Walk the array once; before you store num, check if its complement is in the map.',
        mastery_multiplier: 0.7,
      },
      near_solution: {
        tier: 'near_solution',
        title: 'One-pass hash map outline',
        body: `seen = {}                      # key: number, value: index
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        return [___, ___]        # which index pair?
    seen[num] = i`,
        mastery_multiplier: 0.4,
      },
    },
  },
};

export function getHints(problemId: string): ProblemHints | undefined {
  return HINTS_BY_PROBLEM[problemId];
}
