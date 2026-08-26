import os
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
    {
        "title": "Hello World",
        "description": "Write a function that returns the string 'Hello World'.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "basic_syntax",
        "difficulty_level": "easy",
        "hint_text": "Just return the string literal.",
        "solution_code": "def solve():\n    return 'Hello World'\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "In Python, you can return a string directly.",
        "test_cases": [
            {
                "input": "",
                "expected_output": "Hello World"
            },
            {
                "input": "",
                "expected_output": "Hello World"
            },
            {
                "input": "",
                "expected_output": "Hello World"
            }
        ]
    },
    {
        "title": "Add Two Numbers",
        "description": "Given two numbers a and b, return their sum.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "basic_syntax",
        "difficulty_level": "easy",
        "hint_text": "Use the + operator.",
        "solution_code": "def solve(a, b):\n    return a + b\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "The + operator adds two numerical values.",
        "test_cases": [
            {
                "input": "1, 2",
                "expected_output": "3"
            },
            {
                "input": "10, -5",
                "expected_output": "5"
            },
            {
                "input": "0, 0",
                "expected_output": "0"
            }
        ]
    },
    {
        "title": "Temperature Converter",
        "description": "Convert Celsius to Fahrenheit using the formula F = C * 9/5 + 32. Return the result.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "basic_syntax",
        "difficulty_level": "medium",
        "hint_text": "Apply the mathematical formula directly.",
        "solution_code": "def solve(celsius):\n    return celsius * 9/5 + 32\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Standard math operators perform the conversion.",
        "test_cases": [
            {
                "input": "0",
                "expected_output": "32.0"
            },
            {
                "input": "100",
                "expected_output": "212.0"
            },
            {
                "input": "-40",
                "expected_output": "-40.0"
            }
        ]
    },
    {
        "title": "Even or Odd",
        "description": "Given an integer n, return 'Even' if it is even, and 'Odd' if it is odd.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "basic_syntax",
        "difficulty_level": "medium",
        "hint_text": "Use the modulo operator %.",
        "solution_code": "def solve(n):\n    return 'Even' if n % 2 == 0 else 'Odd'\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "The modulo operator helps determine divisibility by 2.",
        "test_cases": [
            {
                "input": "4",
                "expected_output": "Even"
            },
            {
                "input": "7",
                "expected_output": "Odd"
            },
            {
                "input": "0",
                "expected_output": "Even"
            }
        ]
    },
    {
        "title": "Simple Calculator",
        "description": "Given two numbers and a string operator ('+', '-', '*', '/'), perform the operation and return the result. Division by zero should return 'Error'.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "basic_syntax",
        "difficulty_level": "hard",
        "hint_text": "Use an if-elif-else chain.",
        "solution_code": "def solve(a, b, op):\n    if op == '+': return a + b\n    elif op == '-': return a - b\n    elif op == '*': return a * b\n    elif op == '/':\n        if b == 0: return 'Error'\n        return a / b\n    return None\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Using conditional statements to evaluate the operator.",
        "test_cases": [
            {
                "input": "5, 3, '+'",
                "expected_output": "8"
            },
            {
                "input": "10, 0, '/'",
                "expected_output": "Error"
            },
            {
                "input": "4, 2, '*'",
                "expected_output": "8"
            }
        ]
    },
    {
        "title": "Print 1 to N",
        "description": "Return a list of numbers from 1 to N.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "loops",
        "difficulty_level": "easy",
        "hint_text": "Use a for loop and the range function.",
        "solution_code": "def solve(n):\n    return list(range(1, n + 1))\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "range(1, n + 1) generates numbers from 1 up to N.",
        "test_cases": [
            {
                "input": "3",
                "expected_output": "[1, 2, 3]"
            },
            {
                "input": "1",
                "expected_output": "[1]"
            },
            {
                "input": "5",
                "expected_output": "[1, 2, 3, 4, 5]"
            }
        ]
    },
    {
        "title": "Sum of First N Numbers",
        "description": "Given a number N, calculate the sum of all integers from 1 to N using a loop.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "loops",
        "difficulty_level": "easy",
        "hint_text": "Initialize a sum variable to 0 and add each number in the loop.",
        "solution_code": "def solve(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "A simple accumulator pattern with a loop.",
        "test_cases": [
            {
                "input": "5",
                "expected_output": "15"
            },
            {
                "input": "1",
                "expected_output": "1"
            },
            {
                "input": "10",
                "expected_output": "55"
            }
        ]
    },
    {
        "title": "Factorial Calculation",
        "description": "Return the factorial of N using a loop.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "loops",
        "difficulty_level": "medium",
        "hint_text": "Multiply an accumulator starting from 1 by each integer up to N.",
        "solution_code": "def solve(n):\n    res = 1\n    for i in range(1, n + 1):\n        res *= i\n    return res\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Iteratively multiply numbers to get the factorial.",
        "test_cases": [
            {
                "input": "5",
                "expected_output": "120"
            },
            {
                "input": "0",
                "expected_output": "1"
            },
            {
                "input": "3",
                "expected_output": "6"
            }
        ]
    },
    {
        "title": "Prime Number Check",
        "description": "Given an integer n > 1, return True if it is a prime number, else False.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "loops",
        "difficulty_level": "medium",
        "hint_text": "Check divisibility up to the square root of n.",
        "solution_code": "def solve(n):\n    if n <= 1: return False\n    for i in range(2, int(n ** 0.5) + 1):\n        if n % i == 0:\n            return False\n    return True\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Checking factors up to sqrt(n) is sufficient for primality testing.",
        "test_cases": [
            {
                "input": "7",
                "expected_output": "true"
            },
            {
                "input": "10",
                "expected_output": "false"
            },
            {
                "input": "2",
                "expected_output": "true"
            }
        ]
    },
    {
        "title": "Collatz Conjecture Steps",
        "description": "Return the number of steps required to reach 1 for a given integer N under the Collatz rules (if even, divide by 2; if odd, multiply by 3 and add 1).\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "loops",
        "difficulty_level": "hard",
        "hint_text": "Use a while loop until n == 1.",
        "solution_code": "def solve(n):\n    steps = 0\n    while n != 1:\n        if n % 2 == 0:\n            n //= 2\n        else:\n            n = 3 * n + 1\n        steps += 1\n    return steps\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "A while loop simulates the Collatz process step-by-step.",
        "test_cases": [
            {
                "input": "12",
                "expected_output": "9"
            },
            {
                "input": "1",
                "expected_output": "0"
            },
            {
                "input": "5",
                "expected_output": "5"
            }
        ]
    },
    {
        "title": "Sum of Array",
        "description": "Given a list of numbers, return their sum.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "arrays",
        "difficulty_level": "easy",
        "hint_text": "Iterate through the array or use built-in sum().",
        "solution_code": "def solve(arr):\n    return sum(arr)\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Using Python's built-in sum() is optimal for array summation.",
        "test_cases": [
            {
                "input": "[1, 2, 3]",
                "expected_output": "6"
            },
            {
                "input": "[-1, 1]",
                "expected_output": "0"
            },
            {
                "input": "[10, 20, 30]",
                "expected_output": "60"
            }
        ]
    },
    {
        "title": "Find Maximum",
        "description": "Given a list of numbers, return the maximum element.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "arrays",
        "difficulty_level": "easy",
        "hint_text": "You can use the built-in max() function or a loop.",
        "solution_code": "def solve(arr):\n    if not arr: return None\n    return max(arr)\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Python provides max() for finding the largest item.",
        "test_cases": [
            {
                "input": "[1, 5, 3]",
                "expected_output": "5"
            },
            {
                "input": "[-10, -2, -5]",
                "expected_output": "-2"
            },
            {
                "input": "[0]",
                "expected_output": "0"
            }
        ]
    },
    {
        "title": "Reverse Array",
        "description": "Given a list, return a new list with elements in reverse order.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "arrays",
        "difficulty_level": "medium",
        "hint_text": "Use list slicing or the reverse method.",
        "solution_code": "def solve(arr):\n    return arr[::-1]\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "arr[::-1] creates a reversed copy of the list.",
        "test_cases": [
            {
                "input": "[1, 2, 3]",
                "expected_output": "[3, 2, 1]"
            },
            {
                "input": "[]",
                "expected_output": "[]"
            },
            {
                "input": "[5]",
                "expected_output": "[5]"
            }
        ]
    },
    {
        "title": "Move Zeroes",
        "description": "Given an array, move all 0's to the end while maintaining the relative order of non-zero elements.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "arrays",
        "difficulty_level": "medium",
        "hint_text": "Keep a pointer for the position of the next non-zero element.",
        "solution_code": "def solve(arr):\n    pos = 0\n    for i in range(len(arr)):\n        if arr[i] != 0:\n            arr[pos], arr[i] = arr[i], arr[pos]\n            pos += 1\n    return arr\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Swapping non-zeros to the front leaves zeros at the back.",
        "test_cases": [
            {
                "input": "[0, 1, 0, 3, 12]",
                "expected_output": "[1, 3, 12, 0, 0]"
            },
            {
                "input": "[0, 0, 1]",
                "expected_output": "[1, 0, 0]"
            },
            {
                "input": "[2, 1]",
                "expected_output": "[2, 1]"
            }
        ]
    },
    {
        "title": "Rotate Array",
        "description": "Given an array, rotate it to the right by k steps.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "arrays",
        "difficulty_level": "hard",
        "hint_text": "Use modulo to avoid unnecessary rotations, then array slicing.",
        "solution_code": "def solve(arr, k):\n    if not arr: return []\n    k %= len(arr)\n    return arr[-k:] + arr[:-k]\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "List concatenation allows simple array rotation.",
        "test_cases": [
            {
                "input": "[1, 2, 3, 4, 5, 6, 7], 3",
                "expected_output": "[5, 6, 7, 1, 2, 3, 4]"
            },
            {
                "input": "[-1, -100, 3, 99], 2",
                "expected_output": "[3, 99, -1, -100]"
            },
            {
                "input": "[1], 0",
                "expected_output": "[1]"
            }
        ]
    },
    {
        "title": "Reverse String",
        "description": "Write a function that reverses a string.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "strings",
        "difficulty_level": "easy",
        "hint_text": "Slicing in Python can reverse strings easily.",
        "solution_code": "def solve(s):\n    return s[::-1]\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "String slicing with step -1 returns the reversed string.",
        "test_cases": [
            {
                "input": "'hello'",
                "expected_output": "olleh"
            },
            {
                "input": "'a'",
                "expected_output": "a"
            },
            {
                "input": "''",
                "expected_output": ""
            }
        ]
    },
    {
        "title": "Valid Palindrome",
        "description": "Check if a given string is a palindrome, ignoring non-alphanumeric characters and case.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "strings",
        "difficulty_level": "easy",
        "hint_text": "Filter alphanumeric characters first, then compare with reverse.",
        "solution_code": "def solve(s):\n    filtered = ''.join(c.lower() for c in s if c.isalnum())\n    return filtered == filtered[::-1]\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Clean the string and check if it reads the same backwards.",
        "test_cases": [
            {
                "input": "'A man, a plan, a canal: Panama'",
                "expected_output": "true"
            },
            {
                "input": "'race a car'",
                "expected_output": "false"
            },
            {
                "input": "' '",
                "expected_output": "true"
            }
        ]
    },
    {
        "title": "Longest Substring Without Repeating Characters",
        "description": "Find the length of the longest substring without repeating characters.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "strings",
        "difficulty_level": "medium",
        "hint_text": "Use a sliding window with a set to track seen characters.",
        "solution_code": "def solve(s):\n    seen = set()\n    left = max_len = 0\n    for right in range(len(s)):\n        while s[right] in seen:\n            seen.remove(s[left])\n            left += 1\n        seen.add(s[right])\n        max_len = max(max_len, right - left + 1)\n    return max_len\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "A sliding window expands to include unique characters and shrinks when duplicates are found.",
        "test_cases": [
            {
                "input": "'abcabcbb'",
                "expected_output": "3"
            },
            {
                "input": "'bbbbb'",
                "expected_output": "1"
            },
            {
                "input": "'pwwkew'",
                "expected_output": "3"
            }
        ]
    },
    {
        "title": "String to Integer (atoi)",
        "description": "Convert a string to a 32-bit signed integer. Ignore leading whitespace, parse optional sign and digits.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "strings",
        "difficulty_level": "medium",
        "hint_text": "Handle whitespaces, sign, digits, and overflow bounds sequentially.",
        "solution_code": "def solve(s):\n    s = s.lstrip()\n    if not s: return 0\n    sign = -1 if s[0] == '-' else 1\n    if s[0] in ['-', '+']: s = s[1:]\n    res = 0\n    for c in s:\n        if not c.isdigit(): break\n        res = res * 10 + int(c)\n    res *= sign\n    return max(-2**31, min(res, 2**31 - 1))\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Process the string step-by-step applying integer conversion rules.",
        "test_cases": [
            {
                "input": "'42'",
                "expected_output": "42"
            },
            {
                "input": "'   -42'",
                "expected_output": "-42"
            },
            {
                "input": "'4193 with words'",
                "expected_output": "4193"
            }
        ]
    },
    {
        "title": "Longest Palindromic Substring",
        "description": "Given a string s, return the longest palindromic substring in s.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "strings",
        "difficulty_level": "hard",
        "hint_text": "Expand around the center for each character and pair of characters.",
        "solution_code": "def solve(s):\n    if not s: return ''\n    def expand(left, right):\n        while left >= 0 and right < len(s) and s[left] == s[right]:\n            left -= 1\n            right += 1\n        return s[left+1:right]\n    res = ''\n    for i in range(len(s)):\n        res = max(res, expand(i, i), expand(i, i+1), key=len)\n    return res\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Check all possible palindrome centers and find the longest one.",
        "test_cases": [
            {
                "input": "'babad'",
                "expected_output": "bab"
            },
            {
                "input": "'cbbd'",
                "expected_output": "bb"
            },
            {
                "input": "'a'",
                "expected_output": "a"
            }
        ]
    },
    {
        "title": "Two Sum",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "hashing",
        "difficulty_level": "easy",
        "hint_text": "Use a hash map to store previously seen elements and their indices.",
        "solution_code": "def solve(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "A single pass algorithm storing numbers to their indices to look up the complement.",
        "test_cases": [
            {
                "input": "[2, 7, 11, 15], 9",
                "expected_output": "[0, 1]"
            },
            {
                "input": "[3, 2, 4], 6",
                "expected_output": "[1, 2]"
            },
            {
                "input": "[3, 3], 6",
                "expected_output": "[0, 1]"
            }
        ]
    },
    {
        "title": "Contains Duplicate",
        "description": "Given an integer array nums, return True if any value appears at least twice in the array.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "hashing",
        "difficulty_level": "easy",
        "hint_text": "Compare the length of the list with the length of its set.",
        "solution_code": "def solve(nums):\n    return len(nums) != len(set(nums))\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Sets only store unique elements, so length will differ if duplicates exist.",
        "test_cases": [
            {
                "input": "[1, 2, 3, 1]",
                "expected_output": "true"
            },
            {
                "input": "[1, 2, 3, 4]",
                "expected_output": "false"
            },
            {
                "input": "[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]",
                "expected_output": "true"
            }
        ]
    },
    {
        "title": "Group Anagrams",
        "description": "Given an array of strings, group the anagrams together.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "hashing",
        "difficulty_level": "medium",
        "hint_text": "Use the sorted string or character count tuple as a dictionary key.",
        "solution_code": "def solve(strs):\n    import collections\n    groups = collections.defaultdict(list)\n    for s in strs:\n        groups[''.join(sorted(s))].append(s)\n    return list(groups.values())\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Anagrams will have the same sorted character sequence.",
        "test_cases": [
            {
                "input": "['eat','tea','tan','ate','nat','bat']",
                "expected_output": "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]"
            },
            {
                "input": "['']",
                "expected_output": "[['']]"
            },
            {
                "input": "['a']",
                "expected_output": "[['a']]"
            }
        ]
    },
    {
        "title": "Top K Frequent Elements",
        "description": "Given an integer array nums and an integer k, return the k most frequent elements.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "hashing",
        "difficulty_level": "medium",
        "hint_text": "Use a Counter and sort by frequency.",
        "solution_code": "def solve(nums, k):\n    import collections\n    return [item for item, count in collections.Counter(nums).most_common(k)]\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "The Counter module automatically keeps track of frequencies and provides most_common(k).",
        "test_cases": [
            {
                "input": "[1, 1, 1, 2, 2, 3], 2",
                "expected_output": "[1, 2]"
            },
            {
                "input": "[1], 1",
                "expected_output": "[1]"
            },
            {
                "input": "[4, 4, 4, 5, 5, 5, 5], 1",
                "expected_output": "[5]"
            }
        ]
    },
    {
        "title": "Longest Consecutive Sequence",
        "description": "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence in O(n) time.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "hashing",
        "difficulty_level": "hard",
        "hint_text": "Use a set and only start counting from elements that have no predecessor.",
        "solution_code": "def solve(nums):\n    num_set = set(nums)\n    max_len = 0\n    for n in num_set:\n        if n - 1 not in num_set:\n            cur = n\n            cur_len = 1\n            while cur + 1 in num_set:\n                cur += 1\n                cur_len += 1\n            max_len = max(max_len, cur_len)\n    return max_len\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "By checking `n-1 not in set`, we guarantee we only iterate sequences from the start.",
        "test_cases": [
            {
                "input": "[100, 4, 200, 1, 3, 2]",
                "expected_output": "4"
            },
            {
                "input": "[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]",
                "expected_output": "9"
            },
            {
                "input": "[]",
                "expected_output": "0"
            }
        ]
    },
    {
        "title": "Reverse String with Pointers",
        "description": "Reverse a string array in place using two pointers.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "two_pointers",
        "difficulty_level": "easy",
        "hint_text": "Swap elements at left and right pointers, then move them inward.",
        "solution_code": "def solve(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        s[left], s[right] = s[right], s[left]\n        left += 1\n        right -= 1\n    return s\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Swapping the outer elements continuously reverses the entire list.",
        "test_cases": [
            {
                "input": "['h', 'e', 'l', 'l', 'o']",
                "expected_output": "['o', 'l', 'l', 'e', 'h']"
            },
            {
                "input": "['H', 'a', 'n', 'n', 'a', 'h']",
                "expected_output": "['h', 'a', 'n', 'n', 'a', 'H']"
            },
            {
                "input": "['a']",
                "expected_output": "['a']"
            }
        ]
    },
    {
        "title": "Valid Palindrome II",
        "description": "Return True if you can delete at most one character to make the string a palindrome.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "two_pointers",
        "difficulty_level": "easy",
        "hint_text": "If characters mismatch, try skipping either the left or right character.",
        "solution_code": "def solve(s):\n    def is_pal(sub):\n        return sub == sub[::-1]\n    l, r = 0, len(s) - 1\n    while l < r:\n        if s[l] != s[r]:\n            return is_pal(s[l:r]) or is_pal(s[l+1:r+1])\n        l += 1\n        r -= 1\n    return True\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Once a mismatch occurs, checking the two possible deletions suffices.",
        "test_cases": [
            {
                "input": "'aba'",
                "expected_output": "true"
            },
            {
                "input": "'abca'",
                "expected_output": "true"
            },
            {
                "input": "'abc'",
                "expected_output": "false"
            }
        ]
    },
    {
        "title": "Two Sum II - Input Array Is Sorted",
        "description": "Find two numbers such that they add up to a specific target number in a 1-indexed sorted array.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "two_pointers",
        "difficulty_level": "medium",
        "hint_text": "Since it's sorted, use left and right pointers and move them based on the sum.",
        "solution_code": "def solve(numbers, target):\n    l, r = 0, len(numbers) - 1\n    while l < r:\n        s = numbers[l] + numbers[r]\n        if s == target: return [l + 1, r + 1]\n        if s < target: l += 1\n        else: r -= 1\n    return []\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Narrow down the window by checking the sum against the target.",
        "test_cases": [
            {
                "input": "[2, 7, 11, 15], 9",
                "expected_output": "[1, 2]"
            },
            {
                "input": "[2, 3, 4], 6",
                "expected_output": "[1, 3]"
            },
            {
                "input": "[-1, 0], -1",
                "expected_output": "[1, 2]"
            }
        ]
    },
    {
        "title": "Container With Most Water",
        "description": "Given n non-negative integers representing heights of walls, find two lines that form a container that holds the most water.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "two_pointers",
        "difficulty_level": "medium",
        "hint_text": "Start with maximum width and move the pointer with the smaller height.",
        "solution_code": "def solve(height):\n    l, r = 0, len(height) - 1\n    max_area = 0\n    while l < r:\n        max_area = max(max_area, min(height[l], height[r]) * (r - l))\n        if height[l] < height[r]:\n            l += 1\n        else:\n            r -= 1\n    return max_area\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Moving the shorter wall might increase area, moving the taller definitely decreases it.",
        "test_cases": [
            {
                "input": "[1,8,6,2,5,4,8,3,7]",
                "expected_output": "49"
            },
            {
                "input": "[1,1]",
                "expected_output": "1"
            },
            {
                "input": "[4,3,2,1,4]",
                "expected_output": "16"
            }
        ]
    },
    {
        "title": "Trapping Rain Water",
        "description": "Given n non-negative integers representing an elevation map where width of each bar is 1, compute how much water it can trap after raining.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "two_pointers",
        "difficulty_level": "hard",
        "hint_text": "Keep track of max heights from left and right using two pointers.",
        "solution_code": "def solve(height):\n    if not height: return 0\n    l, r = 0, len(height) - 1\n    l_max, r_max = height[l], height[r]\n    water = 0\n    while l < r:\n        if l_max < r_max:\n            l += 1\n            l_max = max(l_max, height[l])\n            water += l_max - height[l]\n        else:\n            r -= 1\n            r_max = max(r_max, height[r])\n            water += r_max - height[r]\n    return water\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Water trapped depends on the minimum of the highest walls to the left and right.",
        "test_cases": [
            {
                "input": "[0,1,0,2,1,0,1,3,2,1,2,1]",
                "expected_output": "6"
            },
            {
                "input": "[4,2,0,3,2,5]",
                "expected_output": "9"
            },
            {
                "input": "[1,2,3]",
                "expected_output": "0"
            }
        ]
    },
    {
        "title": "Maximum Average Subarray I",
        "description": "Find a contiguous subarray of given length k that has the maximum average value.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "sliding_window",
        "difficulty_level": "easy",
        "hint_text": "Maintain a running sum of window of size k.",
        "solution_code": "def solve(nums, k):\n    window = max_sum = sum(nums[:k])\n    for i in range(k, len(nums)):\n        window += nums[i] - nums[i - k]\n        max_sum = max(max_sum, window)\n    return max_sum / k\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Add the new element and remove the oldest element to slide the window.",
        "test_cases": [
            {
                "input": "[1,12,-5,-6,50,3], 4",
                "expected_output": "12.75"
            },
            {
                "input": "[5], 1",
                "expected_output": "5.0"
            },
            {
                "input": "[-1], 1",
                "expected_output": "-1.0"
            }
        ]
    },
    {
        "title": "Contains Duplicate II",
        "description": "Check if there are two distinct indices i and j such that nums[i] == nums[j] and abs(i - j) <= k.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "sliding_window",
        "difficulty_level": "easy",
        "hint_text": "Use a set to keep track of a window of size k.",
        "solution_code": "def solve(nums, k):\n    seen = set()\n    for i, num in enumerate(nums):\n        if num in seen: return True\n        seen.add(num)\n        if len(seen) > k:\n            seen.remove(nums[i - k])\n    return False\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Maintain a sliding window set of length k.",
        "test_cases": [
            {
                "input": "[1,2,3,1], 3",
                "expected_output": "true"
            },
            {
                "input": "[1,0,1,1], 1",
                "expected_output": "true"
            },
            {
                "input": "[1,2,3,1,2,3], 2",
                "expected_output": "false"
            }
        ]
    },
    {
        "title": "Find All Anagrams in a String",
        "description": "Given two strings s and p, return an array of all the start indices of p's anagrams in s.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "sliding_window",
        "difficulty_level": "medium",
        "hint_text": "Use character counts of a window of size len(p) and compare it.",
        "solution_code": "def solve(s, p):\n    from collections import Counter\n    res, p_count = [], Counter(p)\n    s_count = Counter(s[:len(p)-1])\n    for i in range(len(p)-1, len(s)):\n        s_count[s[i]] += 1\n        if s_count == p_count:\n            res.append(i - len(p) + 1)\n        s_count[s[i - len(p) + 1]] -= 1\n        if s_count[s[i - len(p) + 1]] == 0:\n            del s_count[s[i - len(p) + 1]]\n    return res\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Use a sliding frequency map.",
        "test_cases": [
            {
                "input": "'cbaebabacd', 'abc'",
                "expected_output": "[0, 6]"
            },
            {
                "input": "'abab', 'ab'",
                "expected_output": "[0, 1, 2]"
            },
            {
                "input": "'a', 'ab'",
                "expected_output": "[]"
            }
        ]
    },
    {
        "title": "Minimum Size Subarray Sum",
        "description": "Given an array of positive integers and a target, find the minimal length of a contiguous subarray of which the sum >= target.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "sliding_window",
        "difficulty_level": "medium",
        "hint_text": "Expand the right pointer, and shrink from the left as long as the sum >= target.",
        "solution_code": "def solve(target, nums):\n    l = total = 0\n    res = float('inf')\n    for r in range(len(nums)):\n        total += nums[r]\n        while total >= target:\n            res = min(res, r - l + 1)\n            total -= nums[l]\n            l += 1\n    return res if res != float('inf') else 0\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Dynamically adjust window size to find the minimal valid span.",
        "test_cases": [
            {
                "input": "7, [2,3,1,2,4,3]",
                "expected_output": "2"
            },
            {
                "input": "4, [1,4,4]",
                "expected_output": "1"
            },
            {
                "input": "11, [1,1,1,1,1,1,1,1]",
                "expected_output": "0"
            }
        ]
    },
    {
        "title": "Sliding Window Maximum",
        "description": "Given an integer array and a sliding window size k, return the max sliding window.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "sliding_window",
        "difficulty_level": "hard",
        "hint_text": "Use a monotonically decreasing deque to store indices.",
        "solution_code": "def solve(nums, k):\n    import collections\n    q = collections.deque()\n    res = []\n    for i, x in enumerate(nums):\n        while q and q[0] < i - k + 1: q.popleft()\n        while q and nums[q[-1]] < x: q.pop()\n        q.append(i)\n        if i >= k - 1: res.append(nums[q[0]])\n    return res\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "A deque keeps track of candidate maximums for each window efficiently.",
        "test_cases": [
            {
                "input": "[1,3,-1,-3,5,3,6,7], 3",
                "expected_output": "[3, 3, 5, 5, 6, 7]"
            },
            {
                "input": "[1], 1",
                "expected_output": "[1]"
            },
            {
                "input": "[1,-1], 1",
                "expected_output": "[1, -1]"
            }
        ]
    },
    {
        "title": "Factorial (Recursive)",
        "description": "Calculate the factorial of a number using recursion.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "recursion",
        "difficulty_level": "easy",
        "hint_text": "Base case is n == 0 or n == 1 returning 1.",
        "solution_code": "def solve(n):\n    if n <= 1: return 1\n    return n * solve(n - 1)\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Recursively call the function with n-1.",
        "test_cases": [
            {
                "input": "5",
                "expected_output": "120"
            },
            {
                "input": "0",
                "expected_output": "1"
            },
            {
                "input": "3",
                "expected_output": "6"
            }
        ]
    },
    {
        "title": "Fibonacci Number (Recursive)",
        "description": "Calculate the nth Fibonacci number.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "recursion",
        "difficulty_level": "easy",
        "hint_text": "Return f(n-1) + f(n-2).",
        "solution_code": "def solve(n):\n    if n <= 1: return n\n    return solve(n - 1) + solve(n - 2)\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Naive recursion directly applying the Fibonacci mathematical definition.",
        "test_cases": [
            {
                "input": "2",
                "expected_output": "1"
            },
            {
                "input": "3",
                "expected_output": "2"
            },
            {
                "input": "4",
                "expected_output": "3"
            }
        ]
    },
    {
        "title": "Power(x, n)",
        "description": "Implement pow(x, n), which calculates x raised to the power n.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "recursion",
        "difficulty_level": "medium",
        "hint_text": "Use fast exponentiation: pow(x, n/2) squared.",
        "solution_code": "def solve(x, n):\n    if n == 0: return 1.0\n    if n < 0:\n        x = 1 / x\n        n = -n\n    half = solve(x, n // 2)\n    if n % 2 == 0:\n        return half * half\n    else:\n        return half * half * x\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Recursively split exponent in half for logarithmic time complexity.",
        "test_cases": [
            {
                "input": "2.0, 10",
                "expected_output": "1024.0"
            },
            {
                "input": "2.1, 3",
                "expected_output": "9.261000000000001"
            },
            {
                "input": "2.0, -2",
                "expected_output": "0.25"
            }
        ]
    },
    {
        "title": "Reverse Linked List (Recursive)",
        "description": "Reverse a singly linked list recursively (simulated with lists here).\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "recursion",
        "difficulty_level": "medium",
        "hint_text": "Reverse the rest of the list and put the head at the end.",
        "solution_code": "def solve(arr):\n    if len(arr) <= 1: return arr\n    return solve(arr[1:]) + [arr[0]]\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "The rest of the list is reversed, then the first element is appended.",
        "test_cases": [
            {
                "input": "[1, 2, 3, 4, 5]",
                "expected_output": "[5, 4, 3, 2, 1]"
            },
            {
                "input": "[1, 2]",
                "expected_output": "[2, 1]"
            },
            {
                "input": "[]",
                "expected_output": "[]"
            }
        ]
    },
    {
        "title": "K-th Symbol in Grammar",
        "description": "On the first row, we write a 0. Each row, we replace 0 with 01, and 1 with 10. Given row n and index k, return the kth symbol.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "recursion",
        "difficulty_level": "hard",
        "hint_text": "Notice the second half of the row is the complement of the first.",
        "solution_code": "def solve(n, k):\n    if n == 1: return 0\n    mid = 2 ** (n - 2)\n    if k <= mid:\n        return solve(n - 1, k)\n    else:\n        return 1 - solve(n - 1, k - mid)\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Recursively resolve whether k is in the first or second half.",
        "test_cases": [
            {
                "input": "1, 1",
                "expected_output": "0"
            },
            {
                "input": "2, 1",
                "expected_output": "0"
            },
            {
                "input": "2, 2",
                "expected_output": "1"
            }
        ]
    },
    {
        "title": "Subsets",
        "description": "Given an integer array of unique elements, return all possible subsets (the power set).\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "backtracking",
        "difficulty_level": "easy",
        "hint_text": "For each element, you can either include it or exclude it.",
        "solution_code": "def solve(nums):\n    res = []\n    def dfs(index, path):\n        res.append(path)\n        for i in range(index, len(nums)):\n            dfs(i + 1, path + [nums[i]])\n    dfs(0, [])\n    return res\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "A standard backtracking template appending paths iteratively.",
        "test_cases": [
            {
                "input": "[1, 2]",
                "expected_output": "[[], [1], [1, 2], [2]]"
            },
            {
                "input": "[0]",
                "expected_output": "[[], [0]]"
            },
            {
                "input": "[]",
                "expected_output": "[[]]"
            }
        ]
    },
    {
        "title": "Permutations",
        "description": "Given an array of distinct integers, return all the possible permutations.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "backtracking",
        "difficulty_level": "easy",
        "hint_text": "Keep track of elements that haven't been added to the current permutation.",
        "solution_code": "def solve(nums):\n    res = []\n    def dfs(path, remaining):\n        if not remaining:\n            res.append(path)\n            return\n        for i in range(len(remaining)):\n            dfs(path + [remaining[i]], remaining[:i] + remaining[i+1:])\n    dfs([], nums)\n    return res\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Iterate through remaining elements and pass the updated array to dfs.",
        "test_cases": [
            {
                "input": "[1, 2]",
                "expected_output": "[[1, 2], [2, 1]]"
            },
            {
                "input": "[0, 1]",
                "expected_output": "[[0, 1], [1, 0]]"
            },
            {
                "input": "[1]",
                "expected_output": "[[1]]"
            }
        ]
    },
    {
        "title": "Combinations",
        "description": "Given two integers n and k, return all possible combinations of k numbers chosen from the range [1, n].\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "backtracking",
        "difficulty_level": "medium",
        "hint_text": "Backtrack from numbers 1 to n.",
        "solution_code": "def solve(n, k):\n    res = []\n    def dfs(start, path):\n        if len(path) == k:\n            res.append(path)\n            return\n        for i in range(start, n + 1):\n            dfs(i + 1, path + [i])\n    dfs(1, [])\n    return res\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "DFS search stopping at depth k.",
        "test_cases": [
            {
                "input": "4, 2",
                "expected_output": "[[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]"
            },
            {
                "input": "1, 1",
                "expected_output": "[[1]]"
            },
            {
                "input": "3, 3",
                "expected_output": "[[1, 2, 3]]"
            }
        ]
    },
    {
        "title": "Combination Sum",
        "description": "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations where the chosen numbers sum to target.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "backtracking",
        "difficulty_level": "medium",
        "hint_text": "You can reuse elements, so don't increment the start index when branching.",
        "solution_code": "def solve(candidates, target):\n    res = []\n    def dfs(idx, path, total):\n        if total == target:\n            res.append(path)\n            return\n        if total > target or idx >= len(candidates):\n            return\n        dfs(idx, path + [candidates[idx]], total + candidates[idx])\n        dfs(idx + 1, path, total)\n    dfs(0, [], 0)\n    return res\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Decision tree: include the current element or move to the next.",
        "test_cases": [
            {
                "input": "[2, 3, 6, 7], 7",
                "expected_output": "[[2, 2, 3], [7]]"
            },
            {
                "input": "[2, 3, 5], 8",
                "expected_output": "[[2, 2, 2, 2], [2, 3, 3], [3, 5]]"
            },
            {
                "input": "[2], 1",
                "expected_output": "[]"
            }
        ]
    },
    {
        "title": "N-Queens",
        "description": "Place n queens on an n x n chessboard such that no two queens attack each other.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "backtracking",
        "difficulty_level": "hard",
        "hint_text": "Track columns, and two diagonals (r-c and r+c).",
        "solution_code": "def solve(n):\n    cols, posDiag, negDiag = set(), set(), set()\n    res = []\n    board = [['.'] * n for _ in range(n)]\n    def backtrack(r):\n        if r == n:\n            res.append([''.join(row) for row in board])\n            return\n        for c in range(n):\n            if c in cols or (r + c) in posDiag or (r - c) in negDiag: continue\n            cols.add(c)\n            posDiag.add(r + c)\n            negDiag.add(r - c)\n            board[r][c] = 'Q'\n            backtrack(r + 1)\n            cols.remove(c)\n            posDiag.remove(r + c)\n            negDiag.remove(r - c)\n            board[r][c] = '.'\n    backtrack(0)\n    return len(res)\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Backtracking algorithm checking validity of placing a queen row by row (returning number of valid boards).",
        "test_cases": [
            {
                "input": "4",
                "expected_output": "2"
            },
            {
                "input": "1",
                "expected_output": "1"
            },
            {
                "input": "8",
                "expected_output": "92"
            }
        ]
    },
    {
        "title": "Binary Search",
        "description": "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "binary_search",
        "difficulty_level": "easy",
        "hint_text": "Check middle element, adjust left or right pointers.",
        "solution_code": "def solve(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        elif nums[m] < target: l = m + 1\n        else: r = m - 1\n    return -1\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Classic divide-and-conquer binary search algorithm.",
        "test_cases": [
            {
                "input": "[-1,0,3,5,9,12], 9",
                "expected_output": "4"
            },
            {
                "input": "[-1,0,3,5,9,12], 2",
                "expected_output": "-1"
            },
            {
                "input": "[5], 5",
                "expected_output": "0"
            }
        ]
    },
    {
        "title": "Search Insert Position",
        "description": "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "binary_search",
        "difficulty_level": "easy",
        "hint_text": "Standard binary search, returning left pointer at the end.",
        "solution_code": "def solve(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        elif nums[m] < target: l = m + 1\n        else: r = m - 1\n    return l\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "The 'left' pointer perfectly tracks the insertion index.",
        "test_cases": [
            {
                "input": "[1,3,5,6], 5",
                "expected_output": "2"
            },
            {
                "input": "[1,3,5,6], 2",
                "expected_output": "1"
            },
            {
                "input": "[1,3,5,6], 7",
                "expected_output": "4"
            }
        ]
    },
    {
        "title": "Find First and Last Position of Element in Sorted Array",
        "description": "Find the starting and ending position of a given target value in a sorted array.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "binary_search",
        "difficulty_level": "medium",
        "hint_text": "Use binary search twice: once for left bound, once for right.",
        "solution_code": "def solve(nums, target):\n    def find(is_left):\n        l, r = 0, len(nums) - 1\n        idx = -1\n        while l <= r:\n            m = (l + r) // 2\n            if nums[m] > target or (is_left and nums[m] == target):\n                r = m - 1\n            else:\n                l = m + 1\n            if nums[m] == target: idx = m\n        return idx\n    return [find(True), find(False)]\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Running binary search skewed to the left and then to the right finds bounds.",
        "test_cases": [
            {
                "input": "[5,7,7,8,8,10], 8",
                "expected_output": "[3, 4]"
            },
            {
                "input": "[5,7,7,8,8,10], 6",
                "expected_output": "[-1, -1]"
            },
            {
                "input": "[], 0",
                "expected_output": "[-1, -1]"
            }
        ]
    },
    {
        "title": "Search in Rotated Sorted Array",
        "description": "Given a rotated sorted integer array nums and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "binary_search",
        "difficulty_level": "medium",
        "hint_text": "Identify which half of the array is properly sorted.",
        "solution_code": "def solve(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        if nums[l] <= nums[m]:\n            if nums[l] <= target < nums[m]: r = m - 1\n            else: l = m + 1\n        else:\n            if nums[m] < target <= nums[r]: l = m + 1\n            else: r = m - 1\n    return -1\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "A modified binary search determining the monotonically sorted partition first.",
        "test_cases": [
            {
                "input": "[4,5,6,7,0,1,2], 0",
                "expected_output": "4"
            },
            {
                "input": "[4,5,6,7,0,1,2], 3",
                "expected_output": "-1"
            },
            {
                "input": "[1], 0",
                "expected_output": "-1"
            }
        ]
    },
    {
        "title": "Median of Two Sorted Arrays",
        "description": "Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "binary_search",
        "difficulty_level": "hard",
        "hint_text": "Binary search on the smaller array to find partition cuts.",
        "solution_code": "def solve(nums1, nums2):\n    if len(nums1) > len(nums2): nums1, nums2 = nums2, nums1\n    m, n = len(nums1), len(nums2)\n    l, r = 0, m\n    while l <= r:\n        i = (l + r) // 2\n        j = (m + n + 1) // 2 - i\n        max_l1 = float('-inf') if i == 0 else nums1[i - 1]\n        min_r1 = float('inf') if i == m else nums1[i]\n        max_l2 = float('-inf') if j == 0 else nums2[j - 1]\n        min_r2 = float('inf') if j == n else nums2[j]\n        if max_l1 <= min_r2 and max_l2 <= min_r1:\n            if (m + n) % 2 == 0:\n                return (max(max_l1, max_l2) + min(min_r1, min_r2)) / 2\n            else:\n                return max(max_l1, max_l2)\n        elif max_l1 > min_r2:\n            r = i - 1\n        else:\n            l = i + 1\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Using binary search on partition ranges ensures O(log(min(M,N))) complexity.",
        "test_cases": [
            {
                "input": "[1,3], [2]",
                "expected_output": "2.0"
            },
            {
                "input": "[1,2], [3,4]",
                "expected_output": "2.5"
            },
            {
                "input": "[0,0], [0,0]",
                "expected_output": "0.0"
            }
        ]
    },
    {
        "title": "Maximum Depth of Binary Tree",
        "description": "Given the root of a binary tree (represented as a nested list), return its maximum depth. E.g. [value, left_node, right_node]\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "trees",
        "difficulty_level": "easy",
        "hint_text": "Recursively find max of left and right, add 1.",
        "solution_code": "def solve(root):\n    if not root: return 0\n    return 1 + max(solve(root[1]), solve(root[2]))\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "A simple DFS to find the deepest node.",
        "test_cases": [
            {
                "input": "[3, [9, None, None], [20, [15, None, None], [7, None, None]]]",
                "expected_output": "3"
            },
            {
                "input": "[1, None, [2, None, None]]",
                "expected_output": "2"
            },
            {
                "input": "None",
                "expected_output": "0"
            }
        ]
    },
    {
        "title": "Invert Binary Tree",
        "description": "Given the root of a binary tree, invert the tree and return it.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "trees",
        "difficulty_level": "easy",
        "hint_text": "Recursively swap the left and right children.",
        "solution_code": "def solve(root):\n    if not root: return None\n    return [root[0], solve(root[2]), solve(root[1])]\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Swap at each node going downwards recursively.",
        "test_cases": [
            {
                "input": "[2, [1, None, None], [3, None, None]]",
                "expected_output": "[2, [3, None, None], [1, None, None]]"
            },
            {
                "input": "None",
                "expected_output": "None"
            },
            {
                "input": "[1, [2, None, None], None]",
                "expected_output": "[1, None, [2, None, None]]"
            }
        ]
    },
    {
        "title": "Same Tree",
        "description": "Given roots of two binary trees p and q, write a function to check if they are the same or not.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "trees",
        "difficulty_level": "medium",
        "hint_text": "Check current node value, then recursively check left and right.",
        "solution_code": "def solve(p, q):\n    if not p and not q: return True\n    if not p or not q or p[0] != q[0]: return False\n    return solve(p[1], q[1]) and solve(p[2], q[2])\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Tree equality means both structure and node values match entirely.",
        "test_cases": [
            {
                "input": "[1,[2,None,None],[3,None,None]], [1,[2,None,None],[3,None,None]]",
                "expected_output": "true"
            },
            {
                "input": "[1,[2,None,None],None], [1,None,[2,None,None]]",
                "expected_output": "false"
            },
            {
                "input": "None, None",
                "expected_output": "true"
            }
        ]
    },
    {
        "title": "Validate Binary Search Tree",
        "description": "Given a binary tree, determine if it is a valid binary search tree (BST).\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "trees",
        "difficulty_level": "medium",
        "hint_text": "Use a min and max limit for the recursion of each subtree.",
        "solution_code": "def solve(root, min_val=float('-inf'), max_val=float('inf')):\n    if not root: return True\n    if not (min_val < root[0] < max_val): return False\n    return solve(root[1], min_val, root[0]) and solve(root[2], root[0], max_val)\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Each node bounds the acceptable values for its children.",
        "test_cases": [
            {
                "input": "[2, [1, None, None], [3, None, None]]",
                "expected_output": "true"
            },
            {
                "input": "[5, [1, None, None], [4, [3, None, None], [6, None, None]]]",
                "expected_output": "false"
            },
            {
                "input": "[0, None, None]",
                "expected_output": "true"
            }
        ]
    },
    {
        "title": "Serialize and Deserialize Binary Tree (Mock)",
        "description": "Return the tree itself to represent serialization and returning it back.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "trees",
        "difficulty_level": "hard",
        "hint_text": "For lists acting as trees, this is just returning the list.",
        "solution_code": "def solve(root):\n    import json\n    return json.loads(json.dumps(root))\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Converting tree structure to a JSON string and back.",
        "test_cases": [
            {
                "input": "[1, [2, None, None], [3, None, None]]",
                "expected_output": "[1, [2, None, None], [3, None, None]]"
            },
            {
                "input": "None",
                "expected_output": "None"
            },
            {
                "input": "[1, None, None]",
                "expected_output": "[1, None, None]"
            }
        ]
    },
    {
        "title": "Climbing Stairs",
        "description": "You are climbing a staircase. It takes n steps to reach the top. You can climb 1 or 2 steps. In how many ways can you reach the top?\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "dynamic_programming",
        "difficulty_level": "easy",
        "hint_text": "This is mathematically identical to the Fibonacci sequence.",
        "solution_code": "def solve(n):\n    a, b = 1, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Iteratively track the last two states to achieve O(1) space.",
        "test_cases": [
            {
                "input": "2",
                "expected_output": "2"
            },
            {
                "input": "3",
                "expected_output": "3"
            },
            {
                "input": "5",
                "expected_output": "8"
            }
        ]
    },
    {
        "title": "Min Cost Climbing Stairs",
        "description": "Given a cost array, you can start at index 0 or 1. Pay the cost to jump 1 or 2 steps. Find minimum cost to reach the top.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "dynamic_programming",
        "difficulty_level": "easy",
        "hint_text": "Cost at step i = cost[i] + min(total_cost(i-1), total_cost(i-2)).",
        "solution_code": "def solve(cost):\n    for i in range(2, len(cost)):\n        cost[i] += min(cost[i-1], cost[i-2])\n    return min(cost[-1], cost[-2])\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "In-place DP reduces space complexity while keeping O(N) time.",
        "test_cases": [
            {
                "input": "[10, 15, 20]",
                "expected_output": "15"
            },
            {
                "input": "[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]",
                "expected_output": "6"
            },
            {
                "input": "[0, 0, 0, 0]",
                "expected_output": "0"
            }
        ]
    },
    {
        "title": "Coin Change",
        "description": "Given an integer array coins and an integer amount, return the fewest number of coins to make up that amount.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "dynamic_programming",
        "difficulty_level": "medium",
        "hint_text": "Use an array dp of size amount+1, initialized to infinity.",
        "solution_code": "def solve(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for a in range(1, amount + 1):\n        for c in coins:\n            if a - c >= 0:\n                dp[a] = min(dp[a], 1 + dp[a - c])\n    return dp[amount] if dp[amount] != float('inf') else -1\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Bottom-up DP finding the minimum coins for every value up to amount.",
        "test_cases": [
            {
                "input": "[1, 2, 5], 11",
                "expected_output": "3"
            },
            {
                "input": "[2], 3",
                "expected_output": "-1"
            },
            {
                "input": "[1], 0",
                "expected_output": "0"
            }
        ]
    },
    {
        "title": "Longest Increasing Subsequence",
        "description": "Given an integer array nums, return the length of the longest strictly increasing subsequence.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "dynamic_programming",
        "difficulty_level": "medium",
        "hint_text": "O(N^2) using an array of LIS sizes for each index.",
        "solution_code": "def solve(nums):\n    dp = [1] * len(nums)\n    for i in range(len(nums)):\n        for j in range(i):\n            if nums[i] > nums[j]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    return max(dp)\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Checks previous elements to build the longest subsequence length ending at i.",
        "test_cases": [
            {
                "input": "[10,9,2,5,3,7,101,18]",
                "expected_output": "4"
            },
            {
                "input": "[0,1,0,3,2,3]",
                "expected_output": "4"
            },
            {
                "input": "[7,7,7,7,7,7,7]",
                "expected_output": "1"
            }
        ]
    },
    {
        "title": "Edit Distance",
        "description": "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually.",
        "concept_tag": "dynamic_programming",
        "difficulty_level": "hard",
        "hint_text": "2D DP array. dp[i][j] tracks operations for prefixes.",
        "solution_code": "def solve(word1, word2):\n    m, n = len(word1), len(word2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(m + 1): dp[i][0] = i\n    for j in range(n + 1): dp[0][j] = j\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if word1[i-1] == word2[j-1]:\n                dp[i][j] = dp[i-1][j-1]\n            else:\n                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])\n    return dp[m][n]\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({input_data},)' if ',' not in input_data and not input_data.startswith('(') else f'({input_data})')\n        res = solve(*args) if isinstance(args, tuple) else solve(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)",
        "solution_explanation": "Evaluates deletion, insertion, or replacement at each step if characters do not match.",
        "test_cases": [
            {
                "input": "'horse', 'ros'",
                "expected_output": "3"
            },
            {
                "input": "'intention', 'execution'",
                "expected_output": "5"
            },
            {
                "input": "'', ''",
                "expected_output": "0"
            }
        ]
    },
]

def seed():
    # clear existing
    supabase.table('problems').delete().neq('problem_id', '00000000-0000-0000-0000-000000000000').execute()
    res = supabase.table('problems').insert(PROBLEMS).execute()
    print(f'Seeded {len(res.data)} problems.')

if __name__ == '__main__':
    seed()
