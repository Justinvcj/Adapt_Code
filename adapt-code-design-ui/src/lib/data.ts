export const USER = {
  name: 'Justin Varghese',
  user: 'Justinvcj',
  rank: 909633,
  followers: 3,
  following: 0,
  solved: { easy: 120, medium: 63, hard: 3 },
  total: { easy: 961, medium: 2105, hard: 967 },
  subs: 407,
  days: 54,
  streak: 10,
  attempting: 1,
};

export interface Problem {
  id: number;
  title: string;
  diff: 'Easy' | 'Medium' | 'Hard';
  acc: number;
  st: '' | 'solved' | 'attempted';
}

export const PROBLEMS: Problem[] = [
  { id: 2904, title: 'Shortest and Lexicographically Smallest Beautiful String', diff: 'Medium', acc: 42.9, st: '' },
  { id: 1, title: 'Two Sum', diff: 'Easy', acc: 58.1, st: 'solved' },
  { id: 2, title: 'Add Two Numbers', diff: 'Medium', acc: 49.2, st: '' },
  { id: 3, title: 'Longest Substring Without Repeating Characters', diff: 'Medium', acc: 39.9, st: 'solved' },
  { id: 4, title: 'Median of Two Sorted Arrays', diff: 'Hard', acc: 38.1, st: '' },
  { id: 5, title: 'Longest Palindromic Substring', diff: 'Medium', acc: 32.4, st: 'solved' },
  { id: 9, title: 'Palindrome Number', diff: 'Easy', acc: 54.1, st: 'solved' },
  { id: 11, title: 'Container With Most Water', diff: 'Medium', acc: 55.8, st: '' },
  { id: 13, title: 'Roman to Integer', diff: 'Easy', acc: 59.2, st: 'solved' },
  { id: 14, title: 'Longest Common Prefix', diff: 'Easy', acc: 42.1, st: '' },
  { id: 15, title: '3Sum', diff: 'Medium', acc: 34.5, st: 'attempted' },
  { id: 17, title: 'Letter Combinations of a Phone Number', diff: 'Medium', acc: 58.2, st: '' },
  { id: 19, title: 'Remove Nth Node From End of List', diff: 'Medium', acc: 42.8, st: '' },
  { id: 20, title: 'Valid Parentheses', diff: 'Easy', acc: 40.3, st: 'solved' },
  { id: 21, title: 'Merge Two Sorted Lists', diff: 'Easy', acc: 63.5, st: 'solved' },
  { id: 22, title: 'Generate Parentheses', diff: 'Medium', acc: 73.5, st: '' },
  { id: 23, title: 'Merge k Sorted Lists', diff: 'Hard', acc: 51.5, st: '' },
  { id: 26, title: 'Remove Duplicates from Sorted Array', diff: 'Easy', acc: 54.1, st: '' },
  { id: 33, title: 'Search in Rotated Sorted Array', diff: 'Medium', acc: 40.3, st: 'attempted' },
  { id: 42, title: 'Trapping Rain Water', diff: 'Hard', acc: 59.8, st: '' },
  { id: 49, title: 'Group Anagrams', diff: 'Medium', acc: 67.6, st: 'solved' },
  { id: 53, title: 'Maximum Subarray', diff: 'Medium', acc: 50.6, st: 'solved' },
  { id: 56, title: 'Merge Intervals', diff: 'Medium', acc: 46.8, st: '' },
  { id: 70, title: 'Climbing Stairs', diff: 'Easy', acc: 52.7, st: 'solved' },
  { id: 76, title: 'Minimum Window Substring', diff: 'Hard', acc: 42.1, st: '' },
  { id: 121, title: 'Best Time to Buy and Sell Stock', diff: 'Easy', acc: 54.2, st: 'solved' },
  { id: 128, title: 'Longest Consecutive Sequence', diff: 'Medium', acc: 47.2, st: '' },
  { id: 200, title: 'Number of Islands', diff: 'Medium', acc: 58.1, st: 'attempted' },
  { id: 206, title: 'Reverse Linked List', diff: 'Easy', acc: 74.5, st: 'solved' },
  { id: 238, title: 'Product of Array Except Self', diff: 'Medium', acc: 65.8, st: '' },
];

export const TAGS = [
  { n: 'Array', c: 2238 },
  { n: 'String', c: 893 },
  { n: 'Hash Table', c: 832 },
  { n: 'Math', c: 702 },
  { n: 'Dynamic Programming', c: 678 },
  { n: 'Sorting', c: 534 },
  { n: 'Greedy', c: 422 },
  { n: 'Depth-First Search', c: 312 },
  { n: 'Binary Search', c: 298 },
  { n: 'Tree', c: 267 },
];

export const CODE: Record<string, string> = {
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer,Integer>map=new HashMap<>();
        for(int i=0;i<nums.length;i++){
            int compliment=target-nums[i];
            if(map.containsKey(compliment)){
                return new int[]{map.get(compliment),i};
            }
            map.put(nums[i],i);
        }
        return null;
    }
}`,
  python3: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`,
  javascript: `var twoSum = function(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
};`,
  cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
};

export const LANG_NAMES: Record<string, string> = {
  java: 'Java',
  python3: 'Python 3',
  javascript: 'JavaScript',
  cpp: 'C++',
};
