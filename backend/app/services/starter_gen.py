"""Starter code heuristics service.

Generates runnable starter code scaffolds for Python, Java, C++, and JavaScript
from test case inputs and expected outputs using pure Python standard library heuristics.
"""

from __future__ import annotations

import json
import logging
import re
import sys
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = ("python", "java", "cpp", "javascript")

# Disallowed unsafe tokens across all generated code
UNSAFE_MODULE_PATTERNS = [
    r"\bos\.system\b",
    r"\bsubprocess\b",
    r"\bProcessBuilder\b",
    r"\bsystem\s*\(",
    r"\bchild_process\b",
]


def _assert_safe_code(code: str, lang: str) -> None:
    """Ensure generated code never references unsafe modules or functions."""
    for pattern in UNSAFE_MODULE_PATTERNS:
        if re.search(pattern, code):
            raise ValueError(f"Security violation: generated {lang} code matched unsafe pattern {pattern}")


def infer_input_type(raw_input: Any) -> Tuple[str, bool]:
    """Infer input format heuristic from test_cases[0].input.

    Returns:
        (input_type, is_fallback)
        where input_type is one of:
          - "json_array"
          - "bool"
          - "single_int"
          - "int_list"
          - "string"
          - "multiline"
          - "raw_string"
        and is_fallback is True if input is empty or missing.
    """
    if raw_input is None:
        return "raw_string", True

    if not isinstance(raw_input, str):
        # Convert non-string to string representation
        if isinstance(raw_input, (list, dict)):
            try:
                raw_input = json.dumps(raw_input)
            except Exception:
                raw_input = str(raw_input)
        elif isinstance(raw_input, bool):
            raw_input = "true" if raw_input else "false"
        else:
            raw_input = str(raw_input)

    stripped = raw_input.strip()
    if not stripped:
        return "raw_string", True

    # Check for multiline input (\n in input)
    if "\n" in stripped:
        return "multiline", False

    # starts with [ -> JSON array
    if stripped.startswith("["):
        return "json_array", False

    # true/false/True/False only -> boolean
    if stripped in ("true", "false", "True", "False"):
        return "bool", False

    # purely digits/signs/commas/spaces -> list of ints (CSV or single)
    if re.match(r"^[-+\d\s,]+$", stripped) and re.search(r"\d", stripped):
        # Check if single int or list/CSV
        numbers = [x for x in stripped.replace(",", " ").split() if x]
        if len(numbers) == 1:
            return "single_int", False
        return "int_list", False

    # quoted -> string
    if (stripped.startswith('"') and stripped.endswith('"') and len(stripped) >= 2) or (
        stripped.startswith("'") and stripped.endswith("'") and len(stripped) >= 2
    ):
        return "string", False

    # else -> raw string
    return "raw_string", False


def infer_output_type(raw_output: Any) -> str:
    r"""Infer output format heuristic from test_cases[0].expected_output.

    Returns one of:
      - "python_bool" (True/False)
      - "json_bool"   (true/false)
      - "int"         (digit-only)
      - "float"       (matches ^-?\d+\.\d+$)
      - "array"       (starts with [)
      - "string"      (else)
      - "empty"       (empty / missing)
    """
    if raw_output is None:
        return "empty"

    if not isinstance(raw_output, str):
        if isinstance(raw_output, bool):
            return "json_bool"
        if isinstance(raw_output, int):
            return "int"
        if isinstance(raw_output, float):
            return "float"
        if isinstance(raw_output, (list, dict)):
            return "array"
        raw_output = str(raw_output)

    stripped = raw_output.strip()
    if not stripped:
        return "empty"

    if stripped in ("True", "False"):
        return "python_bool"
    if stripped in ("true", "false"):
        return "json_bool"
    if re.match(r"^-?\d+$", stripped):
        return "int"
    if re.match(r"^-?\d+\.\d+$", stripped):
        return "float"
    if stripped.startswith("["):
        return "array"
    return "string"


def _format_example_comment(raw_input: Any) -> str:
    """Format truncated 80-character example input comment for the first test case."""
    if raw_input is None:
        return ""
    if not isinstance(raw_input, str):
        raw_input = str(raw_input)
    # Normalize carriage returns and format newlines as visible \n to preserve single line
    cleaned = raw_input.replace("\r", "").replace("\n", "\\n").strip()
    return cleaned[:80]


# ============================================================================
# Python Scaffold Generator
# ============================================================================


def _generate_python(
    input_type: str,
    output_type: str,
    example_input: str,
    concept_tag: str = "",
    is_fallback: bool = False,
) -> str:
    """Generate runnable Python 3 starter scaffold."""
    ex_comment = f"# example stdin: {example_input}" if example_input else "# example stdin:"

    # Default return value for solve()
    if output_type in ("python_bool", "json_bool"):
        ret_val = "False"
        ret_hint = "bool"
    elif output_type == "int":
        ret_val = "0"
        ret_hint = "int"
    elif output_type == "float":
        ret_val = "0.0"
        ret_hint = "float"
    elif output_type == "array":
        ret_val = "[]"
        ret_hint = "list"
    elif output_type == "string":
        ret_val = '""'
        ret_hint = "str"
    else:  # empty / fallback
        ret_val = "None"
        ret_hint = "None"

    # Input parsing & solve signature
    if is_fallback or input_type == "raw_string":
        sig = "def solve(data: str)"
        read_logic = "    data = sys.stdin.read().strip()\n    result = solve(data)"
    elif input_type == "multiline":
        sig = "def solve(lines: list[str])"
        read_logic = (
            "    lines = [line.strip() for line in sys.stdin.read().splitlines() if line.strip()]\n"
            "    result = solve(lines)"
        )
    elif input_type == "json_array":
        sig = "def solve(arr: list)"
        read_logic = (
            "    raw_input = sys.stdin.read().strip()\n"
            "    data = json.loads(raw_input) if raw_input else []\n"
            "    result = solve(data)"
        )
    elif input_type == "bool":
        sig = "def solve(flag: bool)"
        read_logic = (
            "    raw_input = sys.stdin.read().strip()\n"
            "    flag = raw_input.lower() == 'true'\n"
            "    result = solve(flag)"
        )
    elif input_type == "single_int":
        sig = "def solve(n: int)"
        read_logic = (
            "    raw_input = sys.stdin.read().strip()\n"
            "    n = int(raw_input) if raw_input else 0\n"
            "    result = solve(n)"
        )
    elif input_type == "int_list":
        sig = "def solve(nums: list[int])"
        read_logic = (
            "    raw_input = sys.stdin.read().strip()\n"
            "    nums = [int(x) for x in raw_input.replace(',', ' ').split() if x]\n"
            "    result = solve(nums)"
        )
    elif input_type == "string":
        sig = "def solve(s: str)"
        read_logic = (
            "    raw_input = sys.stdin.read().strip()\n"
            "    s = raw_input[1:-1] if (raw_input.startswith(('\"', \"'\")) and raw_input.endswith(('\"', \"'\"))) else raw_input\n"
            "    result = solve(s)"
        )
    else:
        sig = "def solve(data: str)"
        read_logic = "    data = sys.stdin.read().strip()\n    result = solve(data)"

    # Output formatting
    if output_type == "json_bool":
        print_logic = "    print(json.dumps(result))"
    elif output_type == "array":
        print_logic = "    print(json.dumps(result))"
    elif output_type == "empty":
        print_logic = "    if result is not None:\n        print(result)"
    else:
        print_logic = "    print(result)"

    imports = ["import sys"]
    if input_type == "json_array" or output_type in ("json_bool", "array"):
        imports.append("import json")

    import_block = "\n".join(imports)

    code = f"""{ex_comment}
{import_block}


{sig} -> {ret_hint}:
    # TODO: implement your solution here
    return {ret_val}


def main():
{read_logic}
{print_logic}


if __name__ == "__main__":
    main()
"""
    _assert_safe_code(code, "python")
    return code


# ============================================================================
# Java Scaffold Generator (class Main for Piston)
# ============================================================================


def _generate_java(
    input_type: str,
    output_type: str,
    example_input: str,
    concept_tag: str = "",
    is_fallback: bool = False,
) -> str:
    """Generate runnable Java starter scaffold with class Main."""
    ex_comment = f"// example stdin: {example_input}" if example_input else "// example stdin:"

    # Return type & default
    if output_type in ("python_bool", "json_bool"):
        ret_type = "boolean"
        ret_val = "false;"
    elif output_type == "int":
        ret_type = "int"
        ret_val = "0;"
    elif output_type == "float":
        ret_type = "double"
        ret_val = "0.0;"
    elif output_type == "array":
        ret_type = "List<Integer>"
        ret_val = "new ArrayList<>();"
    elif output_type == "string":
        ret_type = "String"
        ret_val = '""' + ";"
    else:  # empty / fallback
        ret_type = "String"
        ret_val = '""' + ";"

    # Output printing
    if output_type == "python_bool":
        print_stmt = 'System.out.println(result ? "True" : "False");'
    elif output_type == "empty":
        print_stmt = 'if (result != null) System.out.println(result);'
    else:
        print_stmt = "System.out.println(result);"

    # Input parsing & method signature
    if is_fallback or input_type == "raw_string":
        method_sig = f"public static {ret_type} solve(String data)"
        read_block = """        Scanner scanner = new Scanner(System.in);
        String data = scanner.hasNextLine() ? scanner.nextLine().trim() : "";
        String result = solve(data);"""
    elif input_type == "multiline":
        method_sig = f"public static {ret_type} solve(List<String> lines)"
        read_block = """        Scanner scanner = new Scanner(System.in);
        scanner.useDelimiter("\\\\A");
        String rawInput = scanner.hasNext() ? scanner.next() : "";
        List<String> lines = new ArrayList<>();
        if (!rawInput.isEmpty()) {
            for (String line : rawInput.split("\\\\r?\\\\n")) {
                if (!line.trim().isEmpty()) {
                    lines.add(line.trim());
                }
            }
        }
        """ + f"{ret_type} result = solve(lines);"
    elif input_type == "json_array":
        method_sig = f"public static {ret_type} solve(List<Integer> nums)"
        read_block = """        Scanner scanner = new Scanner(System.in);
        String raw = scanner.hasNextLine() ? scanner.nextLine().trim() : "";
        List<Integer> nums = new ArrayList<>();
        String cleaned = raw.replaceAll("[\\\\[\\\\]]", "").trim();
        if (!cleaned.isEmpty()) {
            for (String s : cleaned.split(",")) {
                try {
                    nums.add(Integer.parseInt(s.trim()));
                } catch (NumberFormatException ignored) {}
            }
        }
        """ + f"{ret_type} result = solve(nums);"
    elif input_type == "bool":
        method_sig = f"public static {ret_type} solve(boolean flag)"
        read_block = """        Scanner scanner = new Scanner(System.in);
        String raw = scanner.hasNext() ? scanner.next().trim() : "";
        boolean flag = Boolean.parseBoolean(raw);
        """ + f"{ret_type} result = solve(flag);"
    elif input_type == "single_int":
        method_sig = f"public static {ret_type} solve(int n)"
        read_block = """        Scanner scanner = new Scanner(System.in);
        int n = scanner.hasNextInt() ? scanner.nextInt() : 0;
        """ + f"{ret_type} result = solve(n);"
    elif input_type == "int_list":
        method_sig = f"public static {ret_type} solve(List<Integer> nums)"
        read_block = """        Scanner scanner = new Scanner(System.in);
        String raw = scanner.hasNextLine() ? scanner.nextLine().trim() : "";
        List<Integer> nums = new ArrayList<>();
        String cleaned = raw.replace(",", " ").trim();
        if (!cleaned.isEmpty()) {
            for (String s : cleaned.split("\\\\s+")) {
                try {
                    nums.add(Integer.parseInt(s.trim()));
                } catch (NumberFormatException ignored) {}
            }
        }
        """ + f"{ret_type} result = solve(nums);"
    elif input_type == "string":
        method_sig = f"public static {ret_type} solve(String s)"
        read_block = """        Scanner scanner = new Scanner(System.in);
        String raw = scanner.hasNextLine() ? scanner.nextLine().trim() : "";
        if (raw.startsWith("\\\"") && raw.endsWith("\\\"") && raw.length() >= 2) {
            raw = raw.substring(1, raw.length() - 1);
        }
        """ + f"{ret_type} result = solve(raw);"
    else:
        method_sig = f"public static {ret_type} solve(String data)"
        read_block = """        Scanner scanner = new Scanner(System.in);
        String data = scanner.hasNextLine() ? scanner.nextLine().trim() : "";
        """ + f"{ret_type} result = solve(data);"

    code = f"""{ex_comment}
import java.util.*;
import java.io.*;

public class Main {{
    {method_sig} {{
        // TODO: implement your solution here
        return {ret_val}
    }}

    public static void main(String[] args) {{
{read_block}
        {print_stmt}
    }}
}}
"""
    _assert_safe_code(code, "java")
    return code


# ============================================================================
# C++ Scaffold Generator
# ============================================================================


def _generate_cpp(
    input_type: str,
    output_type: str,
    example_input: str,
    concept_tag: str = "",
    is_fallback: bool = False,
) -> str:
    """Generate runnable C++ starter scaffold."""
    ex_comment = f"// example stdin: {example_input}" if example_input else "// example stdin:"

    # Return type & default
    if output_type in ("python_bool", "json_bool"):
        ret_type = "bool"
        ret_val = "false;"
    elif output_type == "int":
        ret_type = "int"
        ret_val = "0;"
    elif output_type == "float":
        ret_type = "double"
        ret_val = "0.0;"
    elif output_type == "array":
        ret_type = "std::vector<int>"
        ret_val = "{};"
    elif output_type == "string":
        ret_type = "std::string"
        ret_val = '""' + ";"
    else:
        ret_type = "std::string"
        ret_val = '""' + ";"

    # Output printing
    if output_type == "python_bool":
        print_stmt = '    std::cout << (result ? "True" : "False") << std::endl;'
    elif output_type == "json_bool":
        print_stmt = '    std::cout << (result ? "true" : "false") << std::endl;'
    elif output_type == "array":
        print_stmt = """    std::cout << "[";
    for (size_t i = 0; i < result.size(); ++i) {
        std::cout << result[i] << (i + 1 < result.size() ? "," : "");
    }
    std::cout << "]" << std::endl;"""
    elif output_type == "empty":
        print_stmt = "    if (!result.empty()) std::cout << result << std::endl;"
    else:
        print_stmt = "    std::cout << result << std::endl;"

    # Input parsing & function signature
    if is_fallback or input_type == "raw_string":
        func_sig = f"{ret_type} solve(const std::string& data)"
        read_block = """    std::string data;
    std::getline(std::cin, data);
    if (!data.empty() && data.back() == '\\r') data.pop_back();
    """ + f"{ret_type} result = solve(data);"
    elif input_type == "multiline":
        func_sig = f"{ret_type} solve(const std::vector<std::string>& lines)"
        read_block = """    std::vector<std::string> lines;
    std::string line;
    while (std::getline(std::cin, line)) {
        if (!line.empty() && line.back() == '\\r') {
            line.pop_back();
        }
        if (!line.empty()) {
            lines.push_back(line);
        }
    }
    """ + f"{ret_type} result = solve(lines);"
    elif input_type == "json_array":
        func_sig = f"{ret_type} solve(const std::vector<int>& nums)"
        read_block = """    std::string line;
    std::getline(std::cin, line);
    std::vector<int> nums;
    std::string clean = "";
    for (char c : line) {
        if (c != '[' && c != ']') clean += (c == ',' ? ' ' : c);
    }
    std::stringstream ss(clean);
    int val;
    while (ss >> val) {
        nums.push_back(val);
    }
    """ + f"{ret_type} result = solve(nums);"
    elif input_type == "bool":
        func_sig = f"{ret_type} solve(bool flag)"
        read_block = """    std::string token;
    std::cin >> token;
    bool flag = (token == "true" || token == "True" || token == "1");
    """ + f"{ret_type} result = solve(flag);"
    elif input_type == "single_int":
        func_sig = f"{ret_type} solve(int n)"
        read_block = """    int n = 0;
    std::cin >> n;
    """ + f"{ret_type} result = solve(n);"
    elif input_type == "int_list":
        func_sig = f"{ret_type} solve(const std::vector<int>& nums)"
        read_block = """    std::string line;
    std::getline(std::cin, line);
    std::vector<int> nums;
    std::string clean = "";
    for (char c : line) {
        clean += (c == ',' ? ' ' : c);
    }
    std::stringstream ss(clean);
    int val;
    while (ss >> val) {
        nums.push_back(val);
    }
    """ + f"{ret_type} result = solve(nums);"
    elif input_type == "string":
        func_sig = f"{ret_type} solve(const std::string& s)"
        read_block = """    std::string s;
    std::getline(std::cin, s);
    if (!s.empty() && s.back() == '\\r') s.pop_back();
    if (s.size() >= 2 && ((s.front() == '"' && s.back() == '"') || (s.front() == '\\'' && s.back() == '\\''))) {
        s = s.substr(1, s.size() - 2);
    }
    """ + f"{ret_type} result = solve(s);"
    else:
        func_sig = f"{ret_type} solve(const std::string& data)"
        read_block = """    std::string data;
    std::getline(std::cin, data);
    if (!data.empty() && data.back() == '\\r') data.pop_back();
    """ + f"{ret_type} result = solve(data);"

    code = f"""{ex_comment}
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

{func_sig} {{
    // TODO: implement your solution here
    return {ret_val}
}}

int main() {{
{read_block}
{print_stmt}
    return 0;
}}
"""
    _assert_safe_code(code, "cpp")
    return code


# ============================================================================
# JavaScript Scaffold Generator
# ============================================================================


def _generate_javascript(
    input_type: str,
    output_type: str,
    example_input: str,
    concept_tag: str = "",
    is_fallback: bool = False,
) -> str:
    """Generate runnable JavaScript (Node.js) starter scaffold."""
    ex_comment = f"// example stdin: {example_input}" if example_input else "// example stdin:"

    # Default return value
    if output_type in ("python_bool", "json_bool"):
        ret_val = "false;"
    elif output_type == "int":
        ret_val = "0;"
    elif output_type == "float":
        ret_val = "0.0;"
    elif output_type == "array":
        ret_val = "[];"
    elif output_type == "string":
        ret_val = '""' + ";"
    else:
        ret_val = "null;"

    # Output printing
    if output_type == "python_bool":
        print_stmt = '    console.log(result ? "True" : "False");'
    elif output_type == "array":
        print_stmt = "    console.log(JSON.stringify(result));"
    elif output_type == "empty":
        print_stmt = "    if (result !== null && result !== undefined) console.log(result);"
    else:
        print_stmt = "    console.log(result);"

    # Input parsing & function signature
    if is_fallback or input_type == "raw_string":
        func_sig = "function solve(data)"
        read_block = """    const data = fs.readFileSync(0, 'utf8').trim();
    const result = solve(data);"""
    elif input_type == "multiline":
        func_sig = "function solve(lines)"
        read_block = """    const input = fs.readFileSync(0, 'utf8');
    const lines = input.split(/\\r?\\n/).map(l => l.trim()).filter(l => l.length > 0);
    const result = solve(lines);"""
    elif input_type == "json_array":
        func_sig = "function solve(arr)"
        read_block = """    const input = fs.readFileSync(0, 'utf8').trim();
    let data = [];
    try {
        data = JSON.parse(input);
    } catch (e) {
        data = [];
    }
    const result = solve(data);"""
    elif input_type == "bool":
        func_sig = "function solve(flag)"
        read_block = """    const input = fs.readFileSync(0, 'utf8').trim().toLowerCase();
    const flag = input === 'true';
    const result = solve(flag);"""
    elif input_type == "single_int":
        func_sig = "function solve(n)"
        read_block = """    const input = fs.readFileSync(0, 'utf8').trim();
    const nums = input.replace(/,/g, ' ').split(/\\s+/).filter(Boolean).map(Number);
    const n = nums.length > 0 ? nums[0] : 0;
    const result = solve(n);"""
    elif input_type == "int_list":
        func_sig = "function solve(nums)"
        read_block = """    const input = fs.readFileSync(0, 'utf8').trim();
    const nums = input.replace(/,/g, ' ').split(/\\s+/).filter(Boolean).map(Number);
    const result = solve(nums);"""
    elif input_type == "string":
        func_sig = "function solve(s)"
        read_block = """    let input = fs.readFileSync(0, 'utf8').trim();
    if ((input.startsWith('"') && input.endsWith('"')) || (input.startsWith("'") && input.endsWith("'"))) {
        input = input.slice(1, -1);
    }
    const result = solve(input);"""
    else:
        func_sig = "function solve(data)"
        read_block = """    const data = fs.readFileSync(0, 'utf8').trim();
    const result = solve(data);"""

    code = f"""{ex_comment}
const fs = require('fs');

{func_sig} {{
    // TODO: implement your solution here
    return {ret_val}
}}

function main() {{
{read_block}
{print_stmt}
}}

main();
"""
    _assert_safe_code(code, "javascript")
    return code


# ============================================================================
# Main Entry Point
# ============================================================================


def generate_starter_code(
    test_cases: list,
    concept_tag: str = "",
    title: str = "",
    languages: Optional[List[str]] = None,
) -> Dict[str, str]:
    """Generate starter code scaffolds for requested languages.

    Args:
        test_cases: List of test case dicts with 'input' and 'expected_output'.
        concept_tag: Optional concept tag (e.g. 'recursion', 'dynamic_programming').
        title: Optional title of the problem.
        languages: Optional list of language names to generate. Defaults to
                   ['python', 'java', 'cpp', 'javascript'].

    Returns:
        Dict mapping language name to runnable starter code scaffold.
    """
    target_langs = languages if languages is not None else list(SUPPORTED_LANGUAGES)

    # Heuristic inference from test_cases[0]
    first_tc: Optional[Dict[str, Any]] = None
    if isinstance(test_cases, list) and len(test_cases) > 0 and isinstance(test_cases[0], dict):
        first_tc = test_cases[0]

    raw_input = first_tc.get("input") if first_tc else None
    raw_output = first_tc.get("expected_output") if first_tc else None

    input_type, is_fallback = infer_input_type(raw_input)
    output_type = infer_output_type(raw_output)

    if is_fallback:
        logger.info("Falling back to generic scaffold for problem '%s' (concept: '%s')", title, concept_tag)

    example_input = _format_example_comment(raw_input)

    starters: Dict[str, str] = {}
    for lang in target_langs:
        norm_lang = lang.lower().strip()
        if norm_lang in ("python", "python3", "py"):
            starters["python"] = _generate_python(
                input_type, output_type, example_input, concept_tag, is_fallback
            )
        elif norm_lang in ("java",):
            starters["java"] = _generate_java(
                input_type, output_type, example_input, concept_tag, is_fallback
            )
        elif norm_lang in ("cpp", "c++", "cplusplus"):
            starters["cpp"] = _generate_cpp(
                input_type, output_type, example_input, concept_tag, is_fallback
            )
        elif norm_lang in ("javascript", "js", "node"):
            starters["javascript"] = _generate_javascript(
                input_type, output_type, example_input, concept_tag, is_fallback
            )
        else:
            logger.warning("Unsupported language requested: %s", lang)

    return starters
