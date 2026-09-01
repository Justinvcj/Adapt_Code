import json

concepts = [
    'basic_syntax', 'loops', 'arrays', 'strings', 'hashing', 'two_pointers', 
    'sliding_window', 'recursion', 'backtracking', 'binary_search', 'trees', 'dynamic_programming'
]

data = {
    'basic_syntax': [
        ("Add Two Numbers", "Given two numbers a and b, return their sum.", "easy", ["Use the + operator."], [("1, 2", "3"), ("-1, 1", "0"), ("0, 0", "0")]),
        ("Multiply Two Numbers", "Given two numbers, return their product.", "easy", ["Use the * operator."], [("2, 3", "6"), ("-2, 3", "-6"), ("0, 100", "0")]),
        ("Max of Three", "Given three numbers, return the maximum.", "medium", ["Use the max() function."], [("1, 2, 3", "3"), ("-1, -5, -2", "-1"), ("0, 0, 0", "0")]),
        ("Is Even", "Given a number, return True if even, False otherwise.", "medium", ["Use the modulo operator %."], [("2", "True"), ("3", "False"), ("0", "True")]),
        ("FizzBuzz Single", "Given n, return 'Fizz' if divisible by 3, 'Buzz' if by 5, 'FizzBuzz' if both, else the string of n.", "hard", ["Check modulo 15 first."], [("3", "'Fizz'"), ("5", "'Buzz'"), ("15", "'FizzBuzz'")])
    ],
    'loops': [
        ("Sum of N", "Given n, return sum from 1 to n.", "easy", ["Use a for loop."], [("5", "15"), ("1", "1"), ("10", "55")]),
        ("Factorial", "Return n! (n factorial).", "easy", ["Use a while or for loop."], [("5", "120"), ("0", "1"), ("3", "6")]),
        ("Print Squares", "Given n, return a list of squares from 0 to n-1.", "medium", ["Use list comprehension."], [("3", "[0, 1, 4]"), ("1", "[0]"), ("5", "[0, 1, 4, 9, 16]")]),
        ("Count Vowels", "Given a string, return the number of vowels.", "medium", ["Iterate through characters."], [("'hello'", "2"), ("'apple'", "2"), ("'bcd'", "0")]),
        ("Prime Check", "Return True if n is prime, False otherwise.", "hard", ["Iterate up to sqrt(n)."], [("2", "True"), ("4", "False"), ("17", "True")])
    ],
    'arrays': [
        ("Find Max", "Find the maximum element in a list.", "easy", ["Use max() or loop."], [("[1, 2, 3]", "3"), ("[-1, -2]", "-1"), ("[5]", "5")]),
        ("Reverse Array", "Return the reversed list.", "easy", ["Use [::-1]."], [("[1, 2]", "[2, 1]"), ("[]", "[]"), ("[5, 4, 3]", "[3, 4, 5]")]),
        ("Remove Duplicates", "Remove duplicates from array, return length.", "medium", ["Use a set."], [("[1, 1, 2]", "2"), ("[1, 2, 3]", "3"), ("[1, 1, 1, 1]", "1")]),
        ("Move Zeroes", "Move all zeroes to the end, maintain order. Return array.", "medium", ["Count zeroes and filter."], [("[0, 1, 0, 3]", "[1, 3, 0, 0]"), ("[0]", "[0]"), ("[1, 2]", "[1, 2]")]),
        ("Merge Sorted Arrays", "Merge two sorted arrays into one sorted array.", "hard", ["Use two pointers."], [("[1, 3], [2, 4]", "[1, 2, 3, 4]"), ("[], [1]", "[1]"), ("[2], [1]", "[1, 2]")])
    ],
    'strings': [
        ("Palindrome Check", "Return True if string is a palindrome.", "easy", ["Compare string to its reverse."], [("'racecar'", "True"), ("'hello'", "False"), ("'a'", "True")]),
        ("Valid Anagram", "Return True if s and t are anagrams.", "easy", ["Compare character counts."], [("'anagram', 'nagaram'", "True"), ("'rat', 'car'", "False"), ("'a', 'a'", "True")]),
        ("Longest Common Prefix", "Find longest common prefix in array of strings.", "medium", ["Compare character by character."], [("['flower','flow','flight']", "'fl'"), ("['dog','racecar','car']", "''"), ("['a']", "'a'")]),
        ("String Compression", "Compress string using counts of repeated characters.", "medium", ["Iterate and count consecutive characters."], [("'aabbb'", "'a2b3'"), ("'a'", "'a1'"), ("'aa'", "'a2'")]),
        ("Longest Substring Without Repeating Characters", "Find length of longest substring without repeats.", "hard", ["Use sliding window."], [("'abcabcbb'", "3"), ("'bbbbb'", "1"), ("'pwwkew'", "3")])
    ],
    'hashing': [
        ("Two Sum", "Find indices of two numbers that add up to target.", "easy", ["Use a hash map."], [("[2,7,11,15], 9", "[0, 1]"), ("[3,2,4], 6", "[1, 2]"), ("[3,3], 6", "[0, 1]")]),
        ("Contains Duplicate", "Return True if any value appears at least twice.", "easy", ["Use a set."], [("[1,2,3,1]", "True"), ("[1,2,3,4]", "False"), ("[1,1,1,3,3,4,3,2,4,2]", "True")]),
        ("Group Anagrams", "Group anagrams together.", "medium", ["Sort each string to use as key."], [("['eat','tea','tan','ate','nat','bat']", "[['eat','tea','ate'],['tan','nat'],['bat']]"), ("['']", "[['']]"), ("['a']", "[['a']]")]),
        ("Intersection of Two Arrays", "Return their intersection.", "medium", ["Use sets."], [("[1,2,2,1], [2,2]", "[2]"), ("[4,9,5], [9,4,9,8,4]", "[9, 4]"), ("[1], [1]", "[1]")]),
        ("Subarray Sum Equals K", "Find total number of continuous subarrays whose sum equals k.", "hard", ["Use prefix sum and hash map."], [("[1,1,1], 2", "2"), ("[1,2,3], 3", "2"), ("[1,-1,0], 0", "3")])
    ],
    'two_pointers': [
        ("Valid Palindrome", "Check if string is palindrome considering only alphanumeric chars.", "easy", ["Use left and right pointers."], [("'A man, a plan, a canal: Panama'", "True"), ("'race a car'", "False"), ("' '", "True")]),
        ("Reverse String", "Reverse string in place.", "easy", ["Swap left and right pointers."], [("['h','e','l','l','o']", "['o','l','l','e','h']"), ("['H','a','n','n','a','h']", "['h','a','n','n','a','H']"), ("['a']", "['a']")]),
        ("Container With Most Water", "Find two lines that together with x-axis forms container with most water.", "medium", ["Move the shorter line's pointer."], [("[1,8,6,2,5,4,8,3,7]", "49"), ("[1,1]", "1"), ("[4,3,2,1,4]", "16")]),
        ("Three Sum", "Find all unique triplets that sum to 0.", "medium", ["Sort then use two pointers."], [("[-1,0,1,2,-1,-4]", "[[-1, -1, 2], [-1, 0, 1]]"), ("[]", "[]"), ("[0]", "[]")]),
        ("Trapping Rain Water", "Compute how much water can be trapped after raining.", "hard", ["Use two pointers from edges."], [("[0,1,0,2,1,0,1,3,2,1,2,1]", "6"), ("[4,2,0,3,2,5]", "9"), ("[1,0,1]", "1")])
    ],
    'sliding_window': [
        ("Maximum Average Subarray I", "Find contiguous subarray of length k with max average.", "easy", ["Maintain sum of window."], [("[1,12,-5,-6,50,3], 4", "12.75"), ("[5], 1", "5.0"), ("[0,4,0,3,2], 1", "4.0")]),
        ("Contains Duplicate II", "Check if there are duplicate values within distance k.", "easy", ["Use a set of size k."], [("[1,2,3,1], 3", "True"), ("[1,0,1,1], 1", "True"), ("[1,2,3,1,2,3], 2", "False")]),
        ("Longest Repeating Character Replacement", "Find longest substring of same letter with k replacements.", "medium", ["Track counts in window."], [("'ABAB', 2", "4"), ("'AABABBA', 1", "4"), ("'A', 0", "1")]),
        ("Permutation in String", "Check if s2 contains a permutation of s1.", "medium", ["Use fixed window and char counts."], [("'ab', 'eidbaooo'", "True"), ("'ab', 'eidboaoo'", "False"), ("'a', 'a'", "True")]),
        ("Minimum Window Substring", "Find minimum window in s containing all chars of t.", "hard", ["Expand right, shrink left."], [("'ADOBECODEBANC', 'ABC'", "'BANC'"), ("'a', 'a'", "'a'"), ("'a', 'aa'", "''")])
    ],
    'recursion': [
        ("Fibonacci Number", "Return n-th Fibonacci number.", "easy", ["Base cases 0 and 1."], [("2", "1"), ("3", "2"), ("4", "3")]),
        ("Power of Two", "Check if n is a power of two.", "easy", ["Recursively divide by 2."], [("1", "True"), ("16", "True"), ("3", "False")]),
        ("Pow(x, n)", "Calculate x raised to power n.", "medium", ["Use fast exponentiation."], [("2.00000, 10", "1024.0"), ("2.10000, 3", "9.261"), ("2.00000, -2", "0.25")]),
        ("K-th Symbol in Grammar", "Find k-th symbol in n-th row of a specific grammar.", "medium", ["Relate k to k/2."], [("1, 1", "0"), ("2, 1", "0"), ("2, 2", "1")]),
        ("Regular Expression Matching", "Implement regex matching with . and *.", "hard", ["Handle * by matching 0 or 1+ times."], [("'aa', 'a'", "False"), ("'aa', 'a*'", "True"), ("'ab', '.*'", "True")])
    ],
    'backtracking': [
        ("Binary Watch", "Return all possible times for n LEDs on a binary watch.", "easy", ["Iterate through all 1024 combinations."], [("1", "['0:01', '0:02', '0:04', '0:08', '0:16', '0:32', '1:00', '2:00', '4:00', '8:00']"), ("0", "['0:00']"), ("9", "[]")]),
        ("Sum of All Subset XOR Totals", "Return sum of all XOR totals for every subset.", "easy", ["Backtrack include/exclude."], [("[1,3]", "6"), ("[5,1,6]", "28"), ("[3,4,5,6,7,8]", "480")]),
        ("Permutations", "Return all possible permutations of an array.", "medium", ["Swap elements and recurse."], [("[1,2,3]", "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"), ("[0,1]", "[[0,1],[1,0]]"), ("[1]", "[[1]]")]),
        ("Combinations", "Return all combinations of k numbers out of 1 to n.", "medium", ["Backtrack to build combinations."], [("4, 2", "[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]"), ("1, 1", "[[1]]"), ("3, 3", "[[1,2,3]]")]),
        ("N-Queens", "Solve N-Queens puzzle, return all valid board configurations.", "hard", ["Track columns and diagonals."], [("4", "[['.Q..','...Q','Q...','..Q.'],['..Q.','Q...','...Q','.Q..']]"), ("1", "[['Q']]"), ("2", "[]")])
    ],
    'binary_search': [
        ("Binary Search", "Find target in sorted array, return index or -1.", "easy", ["Check middle element."], [("[-1,0,3,5,9,12], 9", "4"), ("[-1,0,3,5,9,12], 2", "-1"), ("[5], 5", "0")]),
        ("Search Insert Position", "Find insert position for target in sorted array.", "easy", ["Binary search for insertion point."], [("[1,3,5,6], 5", "2"), ("[1,3,5,6], 2", "1"), ("[1,3,5,6], 7", "4")]),
        ("Search in Rotated Sorted Array", "Find target in rotated sorted array.", "medium", ["Check which half is sorted."], [("[4,5,6,7,0,1,2], 0", "4"), ("[4,5,6,7,0,1,2], 3", "-1"), ("[1], 0", "-1")]),
        ("Find Minimum in Rotated Sorted Array", "Find minimum element in rotated array.", "medium", ["Compare mid with right pointer."], [("[3,4,5,1,2]", "1"), ("[4,5,6,7,0,1,2]", "0"), ("[11,13,15,17]", "11")]),
        ("Median of Two Sorted Arrays", "Find median of two sorted arrays.", "hard", ["Binary search on smaller array."], [("[1,3], [2]", "2.0"), ("[1,2], [3,4]", "2.5"), ("[], [1]", "1.0")])
    ],
    'trees': [
        ("Maximum Depth of Binary Tree", "Return max depth of binary tree.", "easy", ["Recursively find max depth of children."], [("[3,9,20,None,None,15,7]", "3"), ("[1,None,2]", "2"), ("[]", "0")]),
        ("Invert Binary Tree", "Invert a binary tree.", "easy", ["Swap left and right children."], [("[4,2,7,1,3,6,9]", "[4,7,2,9,6,3,1]"), ("[2,1,3]", "[2,3,1]"), ("[]", "[]")]),
        ("Lowest Common Ancestor of BST", "Find LCA of two nodes in BST.", "medium", ["Use BST property."], [("[6,2,8,0,4,7,9,None,None,3,5], 2, 8", "6"), ("[6,2,8,0,4,7,9,None,None,3,5], 2, 4", "2"), ("[2,1], 2, 1", "2")]),
        ("Binary Tree Level Order Traversal", "Return level order traversal of nodes' values.", "medium", ["Use a queue (BFS)."], [("[3,9,20,None,None,15,7]", "[[3],[9,20],[15,7]]"), ("[1]", "[[1]]"), ("[]", "[]")]),
        ("Serialize and Deserialize Binary Tree", "Design an algorithm to serialize/deserialize a binary tree.", "hard", ["Use pre-order or level-order."], [("[1,2,3,None,None,4,5]", "[1,2,3,None,None,4,5]"), ("[]", "[]"), ("[1]", "[1]")])
    ],
    'dynamic_programming': [
        ("Climbing Stairs", "Find distinct ways to climb n steps (1 or 2 at a time).", "easy", ["Fibonacci sequence."], [("2", "2"), ("3", "3"), ("4", "5")]),
        ("Min Cost Climbing Stairs", "Find min cost to reach top of floor.", "easy", ["dp[i] = cost[i] + min(dp[i-1], dp[i-2])."], [("[10,15,20]", "15"), ("[1,100,1,1,1,100,1,1,100,1]", "6"), ("[0,0,0,0]", "0")]),
        ("Coin Change", "Find min coins to make amount.", "medium", ["Bottom-up DP."], [("[1,2,5], 11", "3"), ("[2], 3", "-1"), ("[1], 0", "0")]),
        ("Longest Increasing Subsequence", "Find length of LIS.", "medium", ["dp[i] = max(dp[j] + 1) for j < i."], [("[10,9,2,5,3,7,101,18]", "4"), ("[0,1,0,3,2,3]", "4"), ("[7,7,7,7,7,7,7]", "1")]),
        ("Edit Distance", "Min operations to convert word1 to word2.", "hard", ["2D DP array."], [("'horse', 'ros'", "3"), ("'intention', 'execution'", "5"), ("'', ''", "0")])
    ]
}

result = []
for concept, problems in data.items():
    for p in problems:
        title, desc, diff, hints, tcs = p
        
        tc_dicts = []
        for inp, out in tcs:
            tc_dicts.append({
                'input': inp,
                'expected_output': out
            })
            
        prob_dict = {
            'title': title,
            'description': desc,
            'concept': concept,
            'difficulty': diff,
            'hints': hints,
            'starter_code': {"python": "def solve():\n    pass"},
            'test_cases': tc_dicts
        }
        result.append(prob_dict)

file_top = """import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get('SUPABASE_URL', '')
key: str = os.environ.get('SUPABASE_KEY', '')
if not url or not key:
    print('No supabase URL/KEY. Exiting.')
    exit(1)
supabase: Client = create_client(url, key)

PROBLEMS = [
"""

file_bottom = """
]

def seed():
    # clear existing
    supabase.table('problems').delete().neq('problem_id', '00000000-0000-0000-0000-000000000000').execute()
    res = supabase.table('problems').insert(PROBLEMS).execute()
    print(f'Seeded {len(res.data)} problems.')

if __name__ == '__main__':
    seed()
"""

with open('backend/seed_db.py', 'w') as f:
    f.write(file_top)
    for r in result:
        f.write(f"    {json.dumps(r)},\n")
    f.write(file_bottom)

print("Generated backend/seed_db.py successfully.")
