import {
  Braces, RotateCw, Quote, Rows3, KeyRound, ArrowLeftRight,
  LayoutGrid, Repeat, GitBranch, Search, Network, Grid3x3,
  type LucideIcon,
} from 'lucide-react';

export type ConceptId =
  | 'basic_syntax' | 'loops' | 'strings' | 'arrays'
  | 'hashing' | 'two_pointers' | 'sliding_window' | 'recursion'
  | 'backtracking' | 'binary_search' | 'trees' | 'dynamic_programming';

export type Concept = {
  id: ConceptId;
  title: string;
  short: string;
  long: string;
  icon: LucideIcon;
  prereqs: ConceptId[];
  problems: { easy: number; medium: number; hard: number };
};

export const CONCEPTS: Concept[] = [
  {
    id: 'basic_syntax',
    title: 'Basic Syntax',
    short: 'Variables, types, control flow',
    long: 'The grammar of the language — variables, primitive types, operators, if/else, and I/O. Everything builds from here.',
    icon: Braces,
    prereqs: [],
    problems: { easy: 24, medium: 0, hard: 0 },
  },
  {
    id: 'loops',
    title: 'Loops & Iteration',
    short: 'Repeating structures',
    long: 'For, while, and do-while loops. Loop invariants, termination conditions, and the off-by-one trap.',
    icon: RotateCw,
    prereqs: ['basic_syntax'],
    problems: { easy: 36, medium: 12, hard: 0 },
  },
  {
    id: 'strings',
    title: 'Strings',
    short: 'Characters, substrings, parsing',
    long: 'Immutability, slicing, character-level operations, encoding, and the common string-manipulation patterns.',
    icon: Quote,
    prereqs: ['loops'],
    problems: { easy: 52, medium: 41, hard: 11 },
  },
  {
    id: 'arrays',
    title: 'Arrays',
    short: 'Indexed sequences',
    long: 'Fixed- and dynamic-size arrays, in-place vs copy, bounds, and the array-traversal idioms every later topic depends on.',
    icon: Rows3,
    prereqs: ['loops'],
    problems: { easy: 78, medium: 92, hard: 24 },
  },
  {
    id: 'hashing',
    title: 'Hashing',
    short: 'O(1) lookup by key',
    long: 'Hash maps and sets. Choosing the right key, dealing with collisions, and recognising when hashing collapses an O(n²) solution to O(n).',
    icon: KeyRound,
    prereqs: ['arrays', 'strings'],
    problems: { easy: 31, medium: 54, hard: 18 },
  },
  {
    id: 'two_pointers',
    title: 'Two Pointers',
    short: 'Converging / diverging indices',
    long: 'A pair of indices moving through a sequence under a shared invariant. Core to sorted-array problems and in-place manipulation.',
    icon: ArrowLeftRight,
    prereqs: ['arrays'],
    problems: { easy: 14, medium: 38, hard: 9 },
  },
  {
    id: 'sliding_window',
    title: 'Sliding Window',
    short: 'A moving sub-range',
    long: 'A contiguous window that expands and contracts across a sequence, tracking per-window state. Specialised two-pointers.',
    icon: LayoutGrid,
    prereqs: ['arrays', 'two_pointers'],
    problems: { easy: 8, medium: 29, hard: 15 },
  },
  {
    id: 'recursion',
    title: 'Recursion',
    short: 'Problems defined in terms of themselves',
    long: 'Base case, recursive case, the call stack. The scaffolding for backtracking, trees, and dynamic programming.',
    icon: Repeat,
    prereqs: ['loops'],
    problems: { easy: 11, medium: 34, hard: 22 },
  },
  {
    id: 'backtracking',
    title: 'Backtracking',
    short: 'Choice → explore → undo',
    long: 'Systematic exploration with state restoration after each branch. Permutations, subsets, constraint satisfaction.',
    icon: GitBranch,
    prereqs: ['recursion'],
    problems: { easy: 2, medium: 24, hard: 17 },
  },
  {
    id: 'binary_search',
    title: 'Binary Search',
    short: 'Halve the search space',
    long: 'Not just on arrays — on any monotonic predicate. Defining the search space is often harder than the loop.',
    icon: Search,
    prereqs: ['arrays'],
    problems: { easy: 9, medium: 31, hard: 16 },
  },
  {
    id: 'trees',
    title: 'Trees',
    short: 'Branching recursive structures',
    long: 'Binary trees, BSTs, traversal orders, and the recursive patterns that generalise to all tree problems.',
    icon: Network,
    prereqs: ['recursion'],
    problems: { easy: 18, medium: 44, hard: 21 },
  },
  {
    id: 'dynamic_programming',
    title: 'Dynamic Programming',
    short: 'Overlapping subproblems',
    long: 'Optimal substructure, memoisation, bottom-up tables. The topic that separates competitive solvers from the rest.',
    icon: Grid3x3,
    prereqs: ['recursion', 'arrays'],
    problems: { easy: 4, medium: 48, hard: 62 },
  },
];

export const CONCEPT_BY_ID = Object.fromEntries(CONCEPTS.map((c) => [c.id, c])) as Record<ConceptId, Concept>;

export type MasteryEntry = { mastery: number; solved: number; unlocked: boolean };

export const MOCK_MASTERY: Record<ConceptId, MasteryEntry> = {
  basic_syntax:        { mastery: 0.96, solved: 23, unlocked: true  },
  loops:               { mastery: 0.88, solved: 41, unlocked: true  },
  strings:             { mastery: 0.74, solved: 58, unlocked: true  },
  arrays:              { mastery: 0.81, solved: 97, unlocked: true  },
  hashing:             { mastery: 0.62, solved: 44, unlocked: true  },
  two_pointers:        { mastery: 0.55, solved: 21, unlocked: true  },
  sliding_window:      { mastery: 0.34, solved: 11, unlocked: true  },
  recursion:           { mastery: 0.48, solved: 19, unlocked: true  },
  backtracking:        { mastery: 0.21, solved:  6, unlocked: true  },
  binary_search:       { mastery: 0.42, solved: 15, unlocked: true  },
  trees:               { mastery: 0.00, solved:  0, unlocked: false },
  dynamic_programming: { mastery: 0.00, solved:  0, unlocked: false },
};

export function isUnlocked(conceptId: ConceptId, mastery: Record<ConceptId, MasteryEntry>): boolean {
  const c = CONCEPT_BY_ID[conceptId];
  const THRESHOLD = 0.5;
  return c.prereqs.every((p) => (mastery[p]?.mastery ?? 0) >= THRESHOLD);
}
