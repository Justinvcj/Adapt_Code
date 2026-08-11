import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
supabase: Client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

PROBLEMS = [
    # 1. basic_syntax
    {
        "title": "FizzBuzz",
        "description": "Write a program that takes an integer `n` as input and prints the numbers from 1 to `n`. But for multiples of three print `Fizz` instead of the number and for the multiples of five print `Buzz`. For numbers which are multiples of both three and five print `FizzBuzz`.\nInput format: A single integer `n`.\nOutput format: A list of strings separated by spaces.",
        "concept_tag": "basic_syntax",
        "difficulty_level": "easy",
        "hint_text": "Use a loop from 1 to n. Use the modulo operator `%` to check for divisibility. Check `% 15` first!",
        "solution_code": "import sys\nn = int(sys.stdin.read().strip())\nres = []\nfor i in range(1, n+1):\n    if i % 15 == 0: res.append('FizzBuzz')\n    elif i % 3 == 0: res.append('Fizz')\n    elif i % 5 == 0: res.append('Buzz')\n    else: res.append(str(i))\nprint(' '.join(res))",
        "solution_explanation": "We iterate from 1 to n. Checking divisibility by 15 first handles the intersection of 3 and 5.",
        "test_cases": [
            {"input": "3", "expected_output": "1 2 Fizz\n"},
            {"input": "5", "expected_output": "1 2 Fizz 4 Buzz\n"},
            {"input": "15", "expected_output": "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz\n"}
        ]
    },
    {
        "title": "Print Square",
        "description": "Given an integer `n`, print an `n x n` square of asterisks `*`.\nInput: integer `n`.\nOutput: `n` lines of `n` asterisks.",
        "concept_tag": "basic_syntax",
        "difficulty_level": "easy",
        "hint_text": "Use string multiplication in Python, e.g., `'*' * n`.",
        "solution_code": "import sys\nn = int(sys.stdin.read().strip())\nfor _ in range(n):\n    print('*' * n)",
        "solution_explanation": "String multiplication creates a string of n asterisks which we print n times.",
        "test_cases": [
            {"input": "2", "expected_output": "**\n**\n"},
            {"input": "3", "expected_output": "***\n***\n***\n"}
        ]
    },
    
    # 2. loops
    {
        "title": "Sum of N Numbers",
        "description": "Given an integer `n`, calculate the sum of all integers from 1 to `n` inclusive using a loop.\nInput: integer `n`.\nOutput: The sum.",
        "concept_tag": "loops",
        "difficulty_level": "easy",
        "hint_text": "Initialize a variable `total = 0`, then use a `for` loop to add each number.",
        "solution_code": "import sys\nn = int(sys.stdin.read().strip())\ntotal = 0\nfor i in range(1, n+1):\n    total += i\nprint(total)",
        "solution_explanation": "A simple accumulator pattern. Note that the math formula n*(n+1)//2 is O(1) but the prompt asks for a loop.",
        "test_cases": [
            {"input": "5", "expected_output": "15\n"},
            {"input": "10", "expected_output": "55\n"}
        ]
    },
    {
        "title": "Factorial",
        "description": "Given an integer `n`, compute its factorial `n!` using a loop.\nInput: integer `n`.\nOutput: `n!`.",
        "concept_tag": "loops",
        "difficulty_level": "easy",
        "hint_text": "Initialize a product variable to 1, then multiply it by each integer up to `n`.",
        "solution_code": "import sys\nn = int(sys.stdin.read().strip())\nprod = 1\nfor i in range(1, n+1):\n    prod *= i\nprint(prod)",
        "solution_explanation": "We accumulate the product. For n=0, the loop doesn't run, leaving prod=1 which is correct for 0!.",
        "test_cases": [
            {"input": "4", "expected_output": "24\n"},
            {"input": "5", "expected_output": "120\n"},
            {"input": "0", "expected_output": "1\n"}
        ]
    },
    
    # 3. arrays
    {
        "title": "Maximum Subarray (Brute Force)",
        "description": "Given an array of integers, find the maximum sum of a contiguous subarray. (For this array concept level, an O(N^2) solution is acceptable, but try to optimize if you can!).\nInput: First line `N` (length), Second line `N` integers.\nOutput: Maximum sum.",
        "concept_tag": "arrays",
        "difficulty_level": "medium",
        "hint_text": "Kadane's algorithm is O(N): keep a running sum, and reset it to 0 if it goes negative.",
        "solution_code": "import sys\ndata = sys.stdin.read().split()\nif len(data) < 2: sys.exit(0)\nn = int(data[0])\narr = [int(x) for x in data[1:n+1]]\nmax_so_far = arr[0]\ncurr = 0\nfor x in arr:\n    curr = max(x, curr + x)\n    max_so_far = max(max_so_far, curr)\nprint(max_so_far)",
        "solution_explanation": "Kadane's algorithm dynamically decides whether to extend the current subarray or start a new one.",
        "test_cases": [
            {"input": "9\n-2 1 -3 4 -1 2 1 -5 4", "expected_output": "6\n"},
            {"input": "1\n5", "expected_output": "5\n"}
        ]
    },
    {
        "title": "Rotate Array",
        "description": "Rotate an array to the right by `k` steps. \nInput: First line `N k`, Second line `N` integers.\nOutput: Space-separated rotated array.",
        "concept_tag": "arrays",
        "difficulty_level": "medium",
        "hint_text": "Remember that `k` could be larger than `N`, so use `k = k % N` first. You can use array slicing in Python.",
        "solution_code": "import sys\ndata = sys.stdin.read().split()\nif len(data) < 2: sys.exit(0)\nn, k = int(data[0]), int(data[1])\narr = [int(x) for x in data[2:n+2]]\nk = k % n\nres = arr[-k:] + arr[:-k] if k > 0 else arr\nprint(' '.join(map(str, res)))",
        "solution_explanation": "Python's slicing makes this O(N) by splitting the array into two parts and swapping their order.",
        "test_cases": [
            {"input": "7 3\n1 2 3 4 5 6 7", "expected_output": "5 6 7 1 2 3 4\n"},
            {"input": "4 2\n-1 -100 3 99", "expected_output": "3 99 -1 -100\n"}
        ]
    },

    # 4. strings
    {
        "title": "Valid Parentheses",
        "description": "Given a string containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\nInput: string `s`.\nOutput: `true` or `false`.",
        "concept_tag": "strings",
        "difficulty_level": "easy",
        "hint_text": "Use a stack (list in Python). Push open brackets, and pop to check against closing brackets.",
        "solution_code": "import sys\ns = sys.stdin.read().strip()\nstack = []\nm = {')': '(', '}': '{', ']': '['}\nfor c in s:\n    if c in m:\n        if not stack or stack.pop() != m[c]:\n            print('false')\n            sys.exit(0)\n    else:\n        stack.append(c)\nprint('true' if not stack else 'false')",
        "solution_explanation": "A classic stack problem. Open brackets are pushed, close brackets must match the top of the stack.",
        "test_cases": [
            {"input": "()[]{}", "expected_output": "true\n"},
            {"input": "(]", "expected_output": "false\n"},
            {"input": "([)]", "expected_output": "false\n"}
        ]
    },
    {
        "title": "Palindrome Check",
        "description": "Check if a given string is a palindrome (reads the same forwards and backwards).\nInput: string `s`.\nOutput: `true` or `false`.",
        "concept_tag": "strings",
        "difficulty_level": "easy",
        "hint_text": "In Python, `s[::-1]` reverses a string. Or use two pointers.",
        "solution_code": "import sys\ns = sys.stdin.read().strip()\nprint('true' if s == s[::-1] else 'false')",
        "solution_explanation": "Reversing the string and comparing it to the original.",
        "test_cases": [
            {"input": "racecar", "expected_output": "true\n"},
            {"input": "hello", "expected_output": "false\n"}
        ]
    },

    # 5. hashing
    {
        "title": "Two Sum",
        "description": "Given an array of integers and an integer target, return the 0-indexed positions of the two numbers that add up to target.\nInput: First line `N`, Second line `N` space-separated integers. Third line `target`.\nOutput: `index1 index2`.",
        "concept_tag": "hashing",
        "difficulty_level": "easy",
        "hint_text": "Use a hash map (dictionary) to store the indices of the elements you have already seen.",
        "solution_code": "import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\nnums = [int(x) for x in data[1:n+1]]\ntarget = int(data[n+1])\nseen = {}\nfor i, num in enumerate(nums):\n    diff = target - num\n    if diff in seen:\n        print(f'{seen[diff]} {i}')\n        sys.exit(0)\n    seen[num] = i",
        "solution_explanation": "Hashing allows us to find the complement in O(1) time.",
        "test_cases": [
            {"input": "4\n2 7 11 15\n9", "expected_output": "0 1\n"},
            {"input": "3\n3 2 4\n6", "expected_output": "1 2\n"}
        ]
    },
    {
        "title": "Group Anagrams",
        "description": "Group anagrams together from a list of strings.\nInput: First line `N`. Second line `N` strings.\nOutput: Each group on a new line, space-separated, sorted lexicographically within the group.",
        "concept_tag": "hashing",
        "difficulty_level": "medium",
        "hint_text": "Sort the characters of each string to use as a dictionary key.",
        "solution_code": "import sys\ndata = sys.stdin.read().split()\nif not data: sys.exit(0)\nn = int(data[0])\nwords = data[1:n+1]\nfrom collections import defaultdict\ngroups = defaultdict(list)\nfor w in words:\n    groups[''.join(sorted(w))].append(w)\nfor k in sorted(groups.keys()):\n    print(' '.join(sorted(groups[k])))",
        "solution_explanation": "Sorted characters of an anagram always yield the same string, making it a perfect hash key.",
        "test_cases": [
            {"input": "6\neat tea tan ate nat bat", "expected_output": "aet ate eat tea\nant nat tan\nabt bat\n"}
        ]
    },

    # 6. two_pointers
    {
        "title": "Container With Most Water",
        "description": "Given `N` non-negative integers where each represents a point at coordinate `(i, ai)`. Find two lines that form a container that holds the most water.\nInput: First line `N`, Second line `N` heights.\nOutput: Max area integer.",
        "concept_tag": "two_pointers",
        "difficulty_level": "medium",
        "hint_text": "Start with pointers at both ends. Move the pointer pointing to the shorter line inward.",
        "solution_code": "import sys\ndata = sys.stdin.read().split()\nif len(data) < 2: sys.exit(0)\nn = int(data[0])\nheight = [int(x) for x in data[1:n+1]]\nl, r = 0, n-1\nmax_area = 0\nwhile l < r:\n    area = min(height[l], height[r]) * (r - l)\n    max_area = max(max_area, area)\n    if height[l] < height[r]:\n        l += 1\n    else:\n        r -= 1\nprint(max_area)",
        "solution_explanation": "We greedily move the shorter boundary inward because the area is constrained by the shortest line.",
        "test_cases": [
            {"input": "9\n1 8 6 2 5 4 8 3 7", "expected_output": "49\n"},
            {"input": "2\n1 1", "expected_output": "1\n"}
        ]
    },

    # 7. sliding_window
    {
        "title": "Max Sum Subarray of Size K",
        "description": "Find the maximum sum of any contiguous subarray of size `K`.\nInput: First line `N K`. Second line `N` integers.\nOutput: Max sum.",
        "concept_tag": "sliding_window",
        "difficulty_level": "easy",
        "hint_text": "Maintain a running sum of the window. When sliding, subtract the element leaving and add the element entering.",
        "solution_code": "import sys\ndata = sys.stdin.read().split()\nn, k = int(data[0]), int(data[1])\narr = [int(x) for x in data[2:n+2]]\ncurr = sum(arr[:k])\nmx = curr\nfor i in range(k, n):\n    curr += arr[i] - arr[i-k]\n    mx = max(mx, curr)\nprint(mx)",
        "solution_explanation": "Sliding window avoids recalculating the sum of the entire window from scratch.",
        "test_cases": [
            {"input": "7 3\n2 1 5 1 3 2 9", "expected_output": "14\n"}
        ]
    },
    {
        "title": "Longest Substring Without Repeating",
        "description": "Find the length of the longest substring without repeating characters.\nInput: string `s`.\nOutput: Integer length.",
        "concept_tag": "sliding_window",
        "difficulty_level": "medium",
        "hint_text": "Use a dictionary to track the last seen index of each character and dynamically adjust your left window bound.",
        "solution_code": "import sys\ns = sys.stdin.read().strip()\nseen = {}\nl = 0\nmx = 0\nfor r, c in enumerate(s):\n    if c in seen and seen[c] >= l:\n        l = seen[c] + 1\n    seen[c] = r\n    mx = max(mx, r - l + 1)\nprint(mx)",
        "solution_explanation": "When a duplicate is found inside the current window, we jump the left boundary just past its previous occurrence.",
        "test_cases": [
            {"input": "abcabcbb", "expected_output": "3\n"},
            {"input": "bbbbb", "expected_output": "1\n"}
        ]
    },

    # 8. recursion
    {
        "title": "Fibonacci Number",
        "description": "Calculate the Nth Fibonacci number recursively (0-indexed where F(0)=0, F(1)=1).\nInput: Integer `N`.\nOutput: F(N).",
        "concept_tag": "recursion",
        "difficulty_level": "easy",
        "hint_text": "F(N) = F(N-1) + F(N-2). Don't forget base cases N=0 and N=1.",
        "solution_code": "import sys\nn = int(sys.stdin.read().strip())\ndef fib(x):\n    if x <= 1: return x\n    return fib(x-1) + fib(x-2)\nprint(fib(n))",
        "solution_explanation": "Classic recursion. Note: standard recursion is O(2^N).",
        "test_cases": [
            {"input": "4", "expected_output": "3\n"},
            {"input": "6", "expected_output": "8\n"}
        ]
    },
    {
        "title": "Power of Two",
        "description": "Determine if a number is a power of two using recursion.\nInput: Integer `N`.\nOutput: `true` or `false`.",
        "concept_tag": "recursion",
        "difficulty_level": "easy",
        "hint_text": "If N is 1, return true. If N <= 0 or N % 2 != 0, return false. Otherwise, recurse on N / 2.",
        "solution_code": "import sys\nn = int(sys.stdin.read().strip())\ndef is_power(x):\n    if x == 1: return True\n    if x <= 0 or x % 2 != 0: return False\n    return is_power(x // 2)\nprint('true' if is_power(n) else 'false')",
        "solution_explanation": "Recursively dividing by 2 checks if the only prime factor is 2.",
        "test_cases": [
            {"input": "16", "expected_output": "true\n"},
            {"input": "3", "expected_output": "false\n"}
        ]
    },

    # 9. backtracking
    {
        "title": "Subsets",
        "description": "Given a set of distinct integers, print all possible subsets (the power set). Sort subsets by size, then lexicographically.\nInput: First line `N`. Second line `N` distinct integers.\nOutput: Subsets separated by newlines, space-separated inside. Empty set is just a blank line.",
        "concept_tag": "backtracking",
        "difficulty_level": "medium",
        "hint_text": "At each element, you have two choices: include it or exclude it.",
        "solution_code": "import sys\ndata = sys.stdin.read().split()\nif len(data) < 2: \n    print()\n    sys.exit(0)\nn = int(data[0])\nnums = sorted([int(x) for x in data[1:n+1]])\nres = []\ndef backtrack(idx, path):\n    res.append(path[:])\n    for i in range(idx, n):\n        path.append(nums[i])\n        backtrack(i+1, path)\n        path.pop()\nbacktrack(0, [])\nres.sort(key=lambda x: (len(x), x))\nfor r in res:\n    print(' '.join(map(str, r)))",
        "solution_explanation": "Backtracking explores all possible combinations by appending, recursing, and then popping.",
        "test_cases": [
            {"input": "3\n1 2 3", "expected_output": "\n1\n2\n3\n1 2\n1 3\n2 3\n1 2 3\n"}
        ]
    },

    # 10. binary_search
    {
        "title": "Search in Sorted Array",
        "description": "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return -1.\nInput: First line `N`. Second line `N` sorted integers. Third line `target`.\nOutput: integer index.",
        "concept_tag": "binary_search",
        "difficulty_level": "easy",
        "hint_text": "Maintain `left` and `right` pointers. Calculate `mid = (left + right) // 2`.",
        "solution_code": "import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\nnums = [int(x) for x in data[1:n+1]]\ntarget = int(data[n+1])\nl, r = 0, n-1\nres = -1\nwhile l <= r:\n    mid = (l + r) // 2\n    if nums[mid] == target:\n        res = mid\n        break\n    elif nums[mid] < target:\n        l = mid + 1\n    else:\n        r = mid - 1\nprint(res)",
        "solution_explanation": "Binary search halves the search space at every step, yielding O(log N) time.",
        "test_cases": [
            {"input": "6\n-1 0 3 5 9 12\n9", "expected_output": "4\n"},
            {"input": "6\n-1 0 3 5 9 12\n2", "expected_output": "-1\n"}
        ]
    },

    # 11. trees
    {
        "title": "Binary Tree Depth",
        "description": "Given an array representation of a complete binary tree (level-order), find its max depth.\nInput: First line `N`. Second line `N` nodes.\nOutput: Integer depth.",
        "concept_tag": "trees",
        "difficulty_level": "easy",
        "hint_text": "In a 0-indexed complete binary tree array, children of `i` are at `2i+1` and `2i+2`. Or, just use math: depth = floor(log2(N)) + 1.",
        "solution_code": "import sys, math\ndata = sys.stdin.read().split()\nif len(data) < 2:\n    print(0)\nelse:\n    n = int(data[0])\n    print(int(math.log2(n)) + 1)",
        "solution_explanation": "Since it's a completely packed array representing a tree, the depth is directly related to the length of the array via log2.",
        "test_cases": [
            {"input": "7\n1 2 3 4 5 6 7", "expected_output": "3\n"},
            {"input": "1\n1", "expected_output": "1\n"}
        ]
    },

    # 12. dynamic_programming
    {
        "title": "Climbing Stairs",
        "description": "You are climbing a staircase. It takes `N` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?\nInput: Integer `N`.\nOutput: Integer ways.",
        "concept_tag": "dynamic_programming",
        "difficulty_level": "easy",
        "hint_text": "This is essentially the Fibonacci sequence. DP state: `dp[i] = dp[i-1] + dp[i-2]`.",
        "solution_code": "import sys\nn = int(sys.stdin.read().strip())\nif n <= 2:\n    print(n)\nelse:\n    a, b = 1, 2\n    for _ in range(3, n+1):\n        a, b = b, a+b\n    print(b)",
        "solution_explanation": "To reach step n, you must step from n-1 or n-2. Thus the total ways is the sum of ways to reach those two steps.",
        "test_cases": [
            {"input": "2", "expected_output": "2\n"},
            {"input": "3", "expected_output": "3\n"},
            {"input": "5", "expected_output": "8\n"}
        ]
    },
    {
        "title": "Coin Change",
        "description": "Given an array of coin denominations and an integer `amount`, return the fewest number of coins needed to make up that amount. Return -1 if impossible.\nInput: First line `N`. Second line `N` coins. Third line `amount`.\nOutput: Integer count.",
        "concept_tag": "dynamic_programming",
        "difficulty_level": "medium",
        "hint_text": "Use a `dp` array where `dp[i]` is the min coins for amount `i`. Initialize to infinity.",
        "solution_code": "import sys\ndata = sys.stdin.read().split()\nn = int(data[0])\ncoins = [int(x) for x in data[1:n+1]]\namount = int(data[n+1])\ndp = [float('inf')] * (amount + 1)\ndp[0] = 0\nfor c in coins:\n    for i in range(c, amount + 1):\n        dp[i] = min(dp[i], dp[i-c] + 1)\nprint(dp[amount] if dp[amount] != float('inf') else -1)",
        "solution_explanation": "Bottom-up DP. For each amount, we check if adding a coin yields a smaller total coin count than our previously known best.",
        "test_cases": [
            {"input": "3\n1 2 5\n11", "expected_output": "3\n"},
            {"input": "1\n2\n3", "expected_output": "-1\n"}
        ]
    }
]

def seed_db():
    print("Seeding database with 20 problems...")
    for p in PROBLEMS:
        try:
            # Check if exists
            existing = supabase.table("problems").select("problem_id").eq("title", p["title"]).execute()
            if existing.data:
                print(f"Skipped (already exists): {p['title']}")
            else:
                supabase.table("problems").insert(p).execute()
                print(f"Inserted: {p['title']}")
        except Exception as e:
            print(f"Failed to process {p['title']}: {e}")

if __name__ == "__main__":
    # First optionally clear problems
    # supabase.table("problems").delete().neq("problem_id", "00000000-0000-0000-0000-000000000000").execute()
    seed_db()
