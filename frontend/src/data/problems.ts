import type { ConceptId } from './concepts';

export type Example = { input: string; output: string; explanation?: string };

export type Problem = {
  slug: string;
  id: number;
  title: string;
  concept: ConceptId;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptance: number;
  summary: string;
  description: string;
  examples: Example[];
  constraints: string[];
  starter: Record<'java' | 'python' | 'javascript' | 'cpp', string>;
  solution: Record<'java' | 'python' | 'javascript' | 'cpp', string>;
  defaultTestcase: { input: Record<string, string>; expected: string };
};

export const PROBLEM_BANK: Record<string, Problem> = {
  'two-sum': {
    slug: 'two-sum',
    id: 1,
    title: 'Pair sum lookup',
    concept: 'hashing',
    difficulty: 'Easy',
    acceptance: 58.1,
    summary: 'Find the two indices whose values add up to a target.',
    description:
      'Given an array of integers and an integer target, return the indices of the two numbers that add up to target. You may assume exactly one such pair exists, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '−10⁹ ≤ nums[i] ≤ 10⁹', 'Exactly one valid answer exists'],
    starter: {
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // your code\n        return new int[]{};\n    }\n}',
      python: 'class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # your code\n        return []',
      javascript: 'var twoSum = function(nums, target) {\n    // your code\n    return [];\n};',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // your code\n        return {};\n    }\n};',
    },
    solution: {
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        HashMap<Integer,Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int c = target - nums[i];\n            if (seen.containsKey(c)) return new int[]{seen.get(c), i};\n            seen.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}',
      python: 'class Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        for i, n in enumerate(nums):\n            if target - n in seen:\n                return [seen[target - n], i]\n            seen[n] = i',
      javascript: 'var twoSum = function(nums, target) {\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const c = target - nums[i];\n        if (seen.has(c)) return [seen.get(c), i];\n        seen.set(nums[i], i);\n    }\n};',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int,int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            int c = target - nums[i];\n            if (seen.count(c)) return {seen[c], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};',
    },
    defaultTestcase: { input: { 'nums': '[2, 7, 11, 15]', 'target': '9' }, expected: '[0, 1]' },
  },

  'valid-parentheses': {
    slug: 'valid-parentheses',
    id: 20,
    title: 'Balanced brackets',
    concept: 'arrays',
    difficulty: 'Easy',
    acceptance: 40.3,
    summary: 'Decide whether a string of brackets is validly nested.',
    description:
      'Given a string of only the characters ( ) [ ] { }, return true if every opening bracket is closed by the matching kind in the correct order.',
    examples: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
      { input: 's = "([)]"', output: 'false' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁴', 's consists only of ( ) [ ] { }'],
    starter: {
      java: 'class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}',
      python: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        return False',
      javascript: 'var isValid = function(s) {\n    return false;\n};',
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};',
    },
    solution: {
      java: 'class Solution {\n    public boolean isValid(String s) {\n        Deque<Character> st = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == \'(\') st.push(\')\');\n            else if (c == \'[\') st.push(\']\');\n            else if (c == \'{\') st.push(\'}\');\n            else if (st.isEmpty() || st.pop() != c) return false;\n        }\n        return st.isEmpty();\n    }\n}',
      python: 'class Solution:\n    def isValid(self, s):\n        st, pairs = [], {")":"(", "]":"[", "}":"{"}\n        for c in s:\n            if c in "([{": st.append(c)\n            elif not st or st.pop() != pairs[c]: return False\n        return not st',
      javascript: 'var isValid = function(s) {\n    const st = [], p = {")":"(","]":"[","}":"{"};\n    for (const c of s) {\n        if ("([{".includes(c)) st.push(c);\n        else if (st.pop() !== p[c]) return false;\n    }\n    return st.length === 0;\n};',
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == \'(\') st.push(\')\');\n            else if (c == \'[\') st.push(\']\');\n            else if (c == \'{\') st.push(\'}\');\n            else if (st.empty() || st.top() != c) return false;\n            else st.pop();\n        }\n        return st.empty();\n    }\n};',
    },
    defaultTestcase: { input: { 's': '"()[]{}"' }, expected: 'true' },
  },

  'reverse-string': {
    slug: 'reverse-string',
    id: 344,
    title: 'Reverse a string in place',
    concept: 'two_pointers',
    difficulty: 'Easy',
    acceptance: 76.3,
    summary: 'Reverse the characters of a string without extra space.',
    description: 'Reverse the input character array in O(1) extra memory.',
    examples: [{ input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }],
    constraints: ['1 ≤ s.length ≤ 10⁵'],
    starter: {
      java: 'class Solution {\n    public void reverseString(char[] s) {\n        // in place\n    }\n}',
      python: 'class Solution:\n    def reverseString(self, s: list[str]) -> None:\n        pass',
      javascript: 'var reverseString = function(s) {\n    // in place\n};',
      cpp: 'class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // in place\n    }\n};',
    },
    solution: {
      java: 'class Solution {\n    public void reverseString(char[] s) {\n        int l = 0, r = s.length - 1;\n        while (l < r) { char t = s[l]; s[l++] = s[r]; s[r--] = t; }\n    }\n}',
      python: 'class Solution:\n    def reverseString(self, s):\n        l, r = 0, len(s) - 1\n        while l < r:\n            s[l], s[r] = s[r], s[l]\n            l, r = l + 1, r - 1',
      javascript: 'var reverseString = function(s) {\n    let l = 0, r = s.length - 1;\n    while (l < r) { [s[l], s[r]] = [s[r], s[l]]; l++; r--; }\n};',
      cpp: 'class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        int l = 0, r = s.size() - 1;\n        while (l < r) swap(s[l++], s[r--]);\n    }\n};',
    },
    defaultTestcase: { input: { 's': '["h","e","l","l","o"]' }, expected: '["o","l","l","e","h"]' },
  },

  'longest-substring': {
    slug: 'longest-substring',
    id: 3,
    title: 'Longest substring without repeats',
    concept: 'sliding_window',
    difficulty: 'Medium',
    acceptance: 39.9,
    summary: 'Length of the longest substring with no repeated characters.',
    description: 'Given a string s, return the length of the longest substring that contains no repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: '"abc" has length 3.' },
      { input: 's = "bbbbb"', output: '1' },
      { input: 's = "pwwkew"', output: '3' },
    ],
    constraints: ['0 ≤ s.length ≤ 5·10⁴'],
    starter: {
      java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}',
      python: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        return 0',
      javascript: 'var lengthOfLongestSubstring = function(s) {\n    return 0;\n};',
      cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};',
    },
    solution: {
      java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        Map<Character, Integer> last = new HashMap<>();\n        int best = 0, l = 0;\n        for (int r = 0; r < s.length(); r++) {\n            Integer p = last.get(s.charAt(r));\n            if (p != null && p >= l) l = p + 1;\n            last.put(s.charAt(r), r);\n            best = Math.max(best, r - l + 1);\n        }\n        return best;\n    }\n}',
      python: 'class Solution:\n    def lengthOfLongestSubstring(self, s):\n        last, best, l = {}, 0, 0\n        for r, c in enumerate(s):\n            if c in last and last[c] >= l: l = last[c] + 1\n            last[c] = r\n            best = max(best, r - l + 1)\n        return best',
      javascript: 'var lengthOfLongestSubstring = function(s) {\n    const last = new Map();\n    let best = 0, l = 0;\n    for (let r = 0; r < s.length; r++) {\n        const c = s[r];\n        if (last.has(c) && last.get(c) >= l) l = last.get(c) + 1;\n        last.set(c, r);\n        best = Math.max(best, r - l + 1);\n    }\n    return best;\n};',
      cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        unordered_map<char,int> last;\n        int best = 0, l = 0;\n        for (int r = 0; r < s.size(); r++) {\n            if (last.count(s[r]) && last[s[r]] >= l) l = last[s[r]] + 1;\n            last[s[r]] = r;\n            best = max(best, r - l + 1);\n        }\n        return best;\n    }\n};',
    },
    defaultTestcase: { input: { 's': '"abcabcbb"' }, expected: '3' },
  },

  'binary-search': {
    slug: 'binary-search',
    id: 704,
    title: 'Classic binary search',
    concept: 'binary_search',
    difficulty: 'Easy',
    acceptance: 55.4,
    summary: 'Find a target in a sorted array in O(log n).',
    description: 'Given a sorted array of distinct integers and a target, return the target\'s index or -1 if not present. Your algorithm must run in O(log n).',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴', 'nums is sorted in ascending order'],
    starter: {
      java: 'class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}',
      python: 'class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        return -1',
      javascript: 'var search = function(nums, target) {\n    return -1;\n};',
      cpp: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};',
    },
    solution: {
      java: 'class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[m] < target) l = m + 1; else r = m - 1;\n        }\n        return -1;\n    }\n}',
      python: 'class Solution:\n    def search(self, nums, target):\n        l, r = 0, len(nums) - 1\n        while l <= r:\n            m = (l + r) // 2\n            if nums[m] == target: return m\n            if nums[m] < target: l = m + 1\n            else: r = m - 1\n        return -1',
      javascript: 'var search = function(nums, target) {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const m = (l + r) >> 1;\n        if (nums[m] === target) return m;\n        if (nums[m] < target) l = m + 1; else r = m - 1;\n    }\n    return -1;\n};',
      cpp: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int l = 0, r = (int)nums.size() - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            if (nums[m] < target) l = m + 1; else r = m - 1;\n        }\n        return -1;\n    }\n};',
    },
    defaultTestcase: { input: { 'nums': '[-1,0,3,5,9,12]', 'target': '9' }, expected: '4' },
  },

  'climbing-stairs': {
    slug: 'climbing-stairs',
    id: 70,
    title: 'Climb the stairs',
    concept: 'dynamic_programming',
    difficulty: 'Easy',
    acceptance: 52.7,
    summary: 'Count distinct ways to reach step n taking 1 or 2 at a time.',
    description: 'You climb n steps. Each move you take 1 or 2 steps. Return the number of distinct ways to reach the top.',
    examples: [{ input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1' }],
    constraints: ['1 ≤ n ≤ 45'],
    starter: {
      java: 'class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}',
      python: 'class Solution:\n    def climbStairs(self, n: int) -> int:\n        return 0',
      javascript: 'var climbStairs = function(n) {\n    return 0;\n};',
      cpp: 'class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};',
    },
    solution: {
      java: 'class Solution {\n    public int climbStairs(int n) {\n        int a = 1, b = 1;\n        for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }\n        return b;\n    }\n}',
      python: 'class Solution:\n    def climbStairs(self, n):\n        a, b = 1, 1\n        for _ in range(2, n + 1): a, b = b, a + b\n        return b',
      javascript: 'var climbStairs = function(n) {\n    let a = 1, b = 1;\n    for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c; }\n    return b;\n};',
      cpp: 'class Solution {\npublic:\n    int climbStairs(int n) {\n        int a = 1, b = 1;\n        for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }\n        return b;\n    }\n};',
    },
    defaultTestcase: { input: { 'n': '3' }, expected: '3' },
  },

  'maximum-subarray': {
    slug: 'maximum-subarray',
    id: 53,
    title: 'Max contiguous subarray sum',
    concept: 'dynamic_programming',
    difficulty: 'Medium',
    acceptance: 50.6,
    summary: 'Largest sum of any contiguous subarray.',
    description: 'Given an integer array nums, find the contiguous subarray with the largest sum and return that sum.',
    examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1] sums to 6.' }],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '−10⁴ ≤ nums[i] ≤ 10⁴'],
    starter: {
      java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}',
      python: 'class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        return 0',
      javascript: 'var maxSubArray = function(nums) {\n    return 0;\n};',
      cpp: 'class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};',
    },
    solution: {
      java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        int cur = nums[0], best = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            cur = Math.max(nums[i], cur + nums[i]);\n            best = Math.max(best, cur);\n        }\n        return best;\n    }\n}',
      python: 'class Solution:\n    def maxSubArray(self, nums):\n        cur = best = nums[0]\n        for x in nums[1:]:\n            cur = max(x, cur + x)\n            best = max(best, cur)\n        return best',
      javascript: 'var maxSubArray = function(nums) {\n    let cur = nums[0], best = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        cur = Math.max(nums[i], cur + nums[i]);\n        best = Math.max(best, cur);\n    }\n    return best;\n};',
      cpp: 'class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        int cur = nums[0], best = nums[0];\n        for (int i = 1; i < (int)nums.size(); i++) {\n            cur = max(nums[i], cur + nums[i]);\n            best = max(best, cur);\n        }\n        return best;\n    }\n};',
    },
    defaultTestcase: { input: { 'nums': '[-2,1,-3,4,-1,2,1,-5,4]' }, expected: '6' },
  },

  'reverse-linked-list': {
    slug: 'reverse-linked-list',
    id: 206,
    title: 'Reverse a linked list',
    concept: 'recursion',
    difficulty: 'Easy',
    acceptance: 74.5,
    summary: 'Reverse a singly-linked list.',
    description: 'Given the head of a singly linked list, reverse the list and return the new head.',
    examples: [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }],
    constraints: ['0 ≤ list length ≤ 5000'],
    starter: {
      java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        return null;\n    }\n}',
      python: 'class Solution:\n    def reverseList(self, head):\n        return None',
      javascript: 'var reverseList = function(head) {\n    return null;\n};',
      cpp: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        return nullptr;\n    }\n};',
    },
    solution: {
      java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null, cur = head;\n        while (cur != null) { ListNode n = cur.next; cur.next = prev; prev = cur; cur = n; }\n        return prev;\n    }\n}',
      python: 'class Solution:\n    def reverseList(self, head):\n        prev, cur = None, head\n        while cur:\n            nxt = cur.next\n            cur.next = prev\n            prev, cur = cur, nxt\n        return prev',
      javascript: 'var reverseList = function(head) {\n    let prev = null, cur = head;\n    while (cur) { const n = cur.next; cur.next = prev; prev = cur; cur = n; }\n    return prev;\n};',
      cpp: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode *prev = nullptr, *cur = head;\n        while (cur) { auto n = cur->next; cur->next = prev; prev = cur; cur = n; }\n        return prev;\n    }\n};',
    },
    defaultTestcase: { input: { 'head': '[1,2,3,4,5]' }, expected: '[5,4,3,2,1]' },
  },

  'fizzbuzz': {
    slug: 'fizzbuzz',
    id: 412,
    title: 'FizzBuzz',
    concept: 'loops',
    difficulty: 'Easy',
    acceptance: 71.0,
    summary: 'Classic FizzBuzz — the loops warm-up.',
    description: 'Return a string array where index i-1 holds "FizzBuzz" if i is divisible by both 3 and 5, "Fizz" if only 3, "Buzz" if only 5, otherwise i as a string.',
    examples: [{ input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]' }],
    constraints: ['1 ≤ n ≤ 10⁴'],
    starter: {
      java: 'class Solution {\n    public List<String> fizzBuzz(int n) {\n        return new ArrayList<>();\n    }\n}',
      python: 'class Solution:\n    def fizzBuzz(self, n: int) -> list[str]:\n        return []',
      javascript: 'var fizzBuzz = function(n) {\n    return [];\n};',
      cpp: 'class Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        return {};\n    }\n};',
    },
    solution: {
      java: 'class Solution {\n    public List<String> fizzBuzz(int n) {\n        List<String> out = new ArrayList<>();\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) out.add("FizzBuzz");\n            else if (i % 3 == 0) out.add("Fizz");\n            else if (i % 5 == 0) out.add("Buzz");\n            else out.add(String.valueOf(i));\n        }\n        return out;\n    }\n}',
      python: 'class Solution:\n    def fizzBuzz(self, n):\n        return ["FizzBuzz" if i % 15 == 0 else "Fizz" if i % 3 == 0 else "Buzz" if i % 5 == 0 else str(i) for i in range(1, n + 1)]',
      javascript: 'var fizzBuzz = function(n) {\n    const out = [];\n    for (let i = 1; i <= n; i++) {\n        if (i % 15 === 0) out.push("FizzBuzz");\n        else if (i % 3 === 0) out.push("Fizz");\n        else if (i % 5 === 0) out.push("Buzz");\n        else out.push(String(i));\n    }\n    return out;\n};',
      cpp: 'class Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        vector<string> out;\n        for (int i = 1; i <= n; i++) {\n            if (i % 15 == 0) out.push_back("FizzBuzz");\n            else if (i % 3 == 0) out.push_back("Fizz");\n            else if (i % 5 == 0) out.push_back("Buzz");\n            else out.push_back(to_string(i));\n        }\n        return out;\n    }\n};',
    },
    defaultTestcase: { input: { 'n': '5' }, expected: '["1","2","Fizz","4","Buzz"]' },
  },

  'group-anagrams': {
    slug: 'group-anagrams',
    id: 49,
    title: 'Group anagrams',
    concept: 'hashing',
    difficulty: 'Medium',
    acceptance: 67.6,
    summary: 'Group strings that are anagrams of each other.',
    description: 'Given an array of strings, group the anagrams together. You can return the answer in any order.',
    examples: [{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }],
    constraints: ['1 ≤ strs.length ≤ 10⁴'],
    starter: {
      java: 'class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        return new ArrayList<>();\n    }\n}',
      python: 'class Solution:\n    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:\n        return []',
      javascript: 'var groupAnagrams = function(strs) {\n    return [];\n};',
      cpp: 'class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        return {};\n    }\n};',
    },
    solution: {
      java: 'class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        Map<String, List<String>> g = new HashMap<>();\n        for (String s : strs) {\n            char[] c = s.toCharArray(); Arrays.sort(c);\n            g.computeIfAbsent(new String(c), k -> new ArrayList<>()).add(s);\n        }\n        return new ArrayList<>(g.values());\n    }\n}',
      python: 'from collections import defaultdict\nclass Solution:\n    def groupAnagrams(self, strs):\n        g = defaultdict(list)\n        for s in strs:\n            g["".join(sorted(s))].append(s)\n        return list(g.values())',
      javascript: 'var groupAnagrams = function(strs) {\n    const g = new Map();\n    for (const s of strs) {\n        const k = s.split("").sort().join("");\n        if (!g.has(k)) g.set(k, []);\n        g.get(k).push(s);\n    }\n    return [...g.values()];\n};',
      cpp: 'class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        unordered_map<string, vector<string>> g;\n        for (auto& s : strs) {\n            auto k = s; sort(k.begin(), k.end());\n            g[k].push_back(s);\n        }\n        vector<vector<string>> out;\n        for (auto& [_, v] : g) out.push_back(v);\n        return out;\n    }\n};',
    },
    defaultTestcase: { input: { 'strs': '["eat","tea","tan","ate","nat","bat"]' }, expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
  },
};

export const PROBLEM_LIST: Problem[] = Object.values(PROBLEM_BANK);

/** Problem suggestions keyed by concept, used by the Explanation panel. */
export const PROBLEMS_BY_CONCEPT: Partial<Record<ConceptId, string[]>> = PROBLEM_LIST.reduce((acc, p) => {
  (acc[p.concept] ??= []).push(p.slug);
  return acc;
}, {} as Partial<Record<ConceptId, string[]>>);

/** Teaching copy for the Explanation panel, per concept. */
export const CONCEPT_TEACHING: Record<ConceptId, {
  idiom: string;
  commonMistake: string;
  nextTopic: string;
}> = {
  basic_syntax: {
    idiom: 'Reading what the compiler is telling you, and the mechanical shape of a program.',
    commonMistake: 'Treating syntax errors as a wall rather than as a precise message pointing at a line.',
    nextTopic: 'Loops & Iteration',
  },
  loops: {
    idiom: 'A loop invariant — the thing that stays true across every iteration — plus clear termination.',
    commonMistake: 'Off-by-one on the final iteration, usually because the invariant was never written down.',
    nextTopic: 'Strings',
  },
  strings: {
    idiom: 'Strings are immutable sequences — any "edit" costs an allocation.',
    commonMistake: 'Mutating a string in a loop (quadratic cost) when a buffer or join would make it linear.',
    nextTopic: 'Arrays',
  },
  arrays: {
    idiom: 'A single sweep with constant extra space is the right default; copying is a smell.',
    commonMistake: 'Allocating a new array when an in-place two-index pass would do it.',
    nextTopic: 'Hashing',
  },
  hashing: {
    idiom: 'One-pass lookup: for each element, derive the key you need, probe the map, then insert.',
    commonMistake: 'Inserting the current element before probing — the map then matches the number against itself.',
    nextTopic: 'Sliding Window',
  },
  two_pointers: {
    idiom: 'Two indices under one invariant, each moving under a different rule.',
    commonMistake: 'Advancing both pointers blindly on every step instead of letting the invariant decide.',
    nextTopic: 'Sliding Window',
  },
  sliding_window: {
    idiom: 'A window [l..r] that grows at r and shrinks from l when an invariant breaks.',
    commonMistake: 'Rebuilding the window state on every step instead of updating incrementally.',
    nextTopic: 'Binary Search',
  },
  recursion: {
    idiom: 'A base case, and a step that makes real progress toward it.',
    commonMistake: 'Returning without combining the recursive result, so the caller sees nothing.',
    nextTopic: 'Backtracking',
  },
  backtracking: {
    idiom: 'Choose, recurse, un-choose — leaving the state exactly as you found it.',
    commonMistake: 'Forgetting to un-choose, so a later branch inherits a dirty state.',
    nextTopic: 'Dynamic Programming',
  },
  binary_search: {
    idiom: 'Shrink a half-interval on each step; the loop ends when the interval is empty.',
    commonMistake: 'Writing l < r when the invariant needs l <= r (or vice versa) and then losing the answer.',
    nextTopic: 'Trees & Graphs',
  },
  trees: {
    idiom: 'A tree problem is a recursive problem: solve for the subtree, then combine.',
    commonMistake: 'Mutating a shared accumulator from recursive calls without a defined merge rule.',
    nextTopic: 'Dynamic Programming',
  },
  dynamic_programming: {
    idiom: 'Define the subproblem precisely; the recurrence then writes itself.',
    commonMistake: 'Jumping to code before writing the recurrence down in words.',
    nextTopic: 'Graphs',
  },
};
