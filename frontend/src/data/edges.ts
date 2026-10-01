import type { ConceptId } from './concepts';

export type EdgeNote = { from: ConceptId; to: ConceptId; why: string };

/**
 * Why each prerequisite exists. Short, static, canonical.
 * Order: from (prerequisite) → to (dependent).
 */
export const EDGE_NOTES: EdgeNote[] = [
  { from: 'basic_syntax', to: 'loops',
    why: 'Loops are a control-flow construct. You need variables, conditions and blocks before iteration makes sense.' },

  { from: 'loops', to: 'strings',
    why: 'Every string problem beyond read-and-print scans characters in a loop. Immutability patterns build on that.' },
  { from: 'loops', to: 'arrays',
    why: 'Arrays are iterated to be useful. Index-based traversal is the first array pattern.' },
  { from: 'loops', to: 'recursion',
    why: 'Recursion is iteration expressed as self-reference. Seeing a loop first gives you something to translate from.' },

  { from: 'arrays', to: 'hashing',
    why: 'Hash maps replace linear array scans with O(1) lookups. You can\'t appreciate the speedup without feeling the scan first.' },
  { from: 'strings', to: 'hashing',
    why: 'Character-counting and anagram problems are the canonical place to meet hash maps.' },

  { from: 'arrays', to: 'two_pointers',
    why: 'Two pointers only exists as a pattern over a linear structure. Array traversal is the floor you build on.' },
  { from: 'arrays', to: 'binary_search',
    why: 'Binary search assumes a sorted sequence with random access. That\'s an array by definition.' },

  { from: 'two_pointers', to: 'sliding_window',
    why: 'Sliding window is a constrained two-pointers: both move in one direction under a window invariant.' },
  { from: 'arrays', to: 'sliding_window',
    why: 'The window slides over an array. You need the primitive first.' },

  { from: 'recursion', to: 'backtracking',
    why: 'Backtracking is recursion with explicit choice-undo. The recursive frame is where the "undo" happens.' },
  { from: 'recursion', to: 'trees',
    why: 'Trees are recursive by definition: each subtree is a tree. Traversal collapses to a recursive call.' },
  { from: 'recursion', to: 'dynamic_programming',
    why: 'DP memoises recursive subproblems. You write the recursion first, then cache its results.' },
  { from: 'arrays', to: 'dynamic_programming',
    why: 'DP tables are arrays (1D, 2D). Fluent array indexing is the prerequisite to writing clean transitions.' },
];

export function noteFor(from: ConceptId, to: ConceptId): string | undefined {
  return EDGE_NOTES.find((e) => e.from === from && e.to === to)?.why;
}

/**
 * Prereq-depth layering for the graph layout.
 * Layer 0 = no prerequisites. Layer N = max(layer of prereqs) + 1.
 */
export const CONCEPT_LAYERS: Record<ConceptId, number> = {
  basic_syntax:        0,
  loops:               1,
  strings:             2,
  arrays:              2,
  recursion:           2,
  hashing:             3,
  two_pointers:        3,
  binary_search:       3,
  backtracking:        3,
  trees:               3,
  sliding_window:      4,
  dynamic_programming: 4,
};
