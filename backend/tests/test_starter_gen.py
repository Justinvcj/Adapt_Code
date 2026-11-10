"""Unit tests for starter code heuristics service (backend/app/services/starter_gen.py).

Covers:
- JSON array input to JSON array output
- CSV ints input to single int output
- Two strings input to string output
- Boolean output formatting (True/False in Python vs true/false in JSON/JS)
- Empty expected_output handling without crashes
- Multi-line input handling (sys.stdin.read, scanner delimiter, getline, readFileSync)
- Fallback handling when test_cases is empty or input is empty
- Unsafe module absence assertion (no subprocess, ProcessBuilder, etc.)
- AST verification that generated Python parses with ast.parse
- Verification that generated JavaScript parses cleanly (balanced braces and node --check)
- Spot-check compilation for Java (javac) and C++ (g++/wsl) when available
"""

import ast
import os
import re
import shutil
import subprocess
import sys
import tempfile
from typing import Dict, List
import pytest

from app.services.starter_gen import (
    generate_starter_code,
    infer_input_type,
    infer_output_type,
    UNSAFE_MODULE_PATTERNS,
)


# ----------------------------------------------------------------------------
# Helper fixtures / utilities
# ----------------------------------------------------------------------------

def _verify_python_ast(code: str) -> None:
    """Verify that Python code parses without syntax errors using ast.parse."""
    try:
        tree = ast.parse(code)
        assert tree is not None
    except SyntaxError as e:
        pytest.fail(f"Python code failed ast.parse: {e}\nCode:\n{code}")


def _verify_js_syntax(code: str) -> None:
    """Verify JS code syntax via balanced braces and node --check if node exists."""
    # Basic syntactic check: balanced braces, parentheses, and brackets
    open_curly = code.count("{")
    close_curly = code.count("}")
    assert open_curly == close_curly, f"Mismatched curly braces: {open_curly} != {close_curly}"

    open_paren = code.count("(")
    close_paren = code.count(")")
    assert open_paren == close_paren, f"Mismatched parentheses: {open_paren} != {close_paren}"

    # If node CLI is available, run node --check
    node_path = shutil.which("node")
    if node_path:
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
            f.write(code)
            temp_path = f.name
        try:
            res = subprocess.run([node_path, "--check", temp_path], capture_output=True, text=True)
            assert res.returncode == 0, f"node --check failed: {res.stderr}\nCode:\n{code}"
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)


def _assert_no_unsafe_modules(starters: Dict[str, str]) -> None:
    """Ensure no generated scaffold contains any unsafe module references."""
    for lang, code in starters.items():
        for pattern in UNSAFE_MODULE_PATTERNS:
            match = re.search(pattern, code)
            assert match is None, f"Found unsafe pattern '{pattern}' in generated {lang} code:\n{code}"


# ----------------------------------------------------------------------------
# Requirement 3 & 1 Test Cases
# ----------------------------------------------------------------------------


def test_json_array_to_json_array():
    """Verify JSON array input to JSON array output."""
    tc = [{"input": "[1, 2, 3]", "expected_output": "[3, 2, 1]"}]
    starters = generate_starter_code(tc, title="Reverse Array", concept_tag="arrays")

    assert set(starters.keys()) == {"python", "java", "cpp", "javascript"}
    _assert_no_unsafe_modules(starters)

    # Python assertions
    py = starters["python"]
    assert "def solve(arr: list) -> list:" in py
    assert "json.loads" in py
    assert "json.dumps" in py
    _verify_python_ast(py)

    # Java assertions
    java = starters["java"]
    assert "public class Main" in java
    assert "List<Integer>" in java
    assert "System.out.println(result);" in java

    # C++ assertions
    cpp = starters["cpp"]
    assert "std::vector<int>" in cpp
    assert "std::stringstream" in cpp

    # JavaScript assertions
    js = starters["javascript"]
    assert "function solve(arr)" in js
    assert "JSON.parse" in js
    assert "JSON.stringify" in js
    _verify_js_syntax(js)


def test_csv_ints_to_single_int():
    """Verify CSV integers input to single integer output."""
    tc = [{"input": "1, 2", "expected_output": "3"}]
    starters = generate_starter_code(tc, title="Add Two Numbers", concept_tag="basic_syntax")

    _assert_no_unsafe_modules(starters)

    # Python assertions
    py = starters["python"]
    assert "def solve(nums: list[int]) -> int:" in py
    assert "nums = [int(x) for x in raw_input.replace(',', ' ').split() if x]" in py
    _verify_python_ast(py)

    # Java assertions
    java = starters["java"]
    assert "public class Main" in java
    assert "public static int solve(List<Integer> nums)" in java

    # C++ assertions
    cpp = starters["cpp"]
    assert "int solve(const std::vector<int>& nums)" in cpp

    # JS assertions
    js = starters["javascript"]
    assert "function solve(nums)" in js
    _verify_js_syntax(js)


def test_single_int_to_single_int():
    """Verify single integer input to single integer output."""
    tc = [{"input": "5", "expected_output": "120"}]
    starters = generate_starter_code(tc, title="Factorial", concept_tag="loops")

    _assert_no_unsafe_modules(starters)
    py = starters["python"]
    assert "def solve(n: int) -> int:" in py
    _verify_python_ast(py)

    java = starters["java"]
    assert "public static int solve(int n)" in java

    cpp = starters["cpp"]
    assert "int solve(int n)" in cpp

    js = starters["javascript"]
    assert "function solve(n)" in js
    _verify_js_syntax(js)


def test_two_strings_to_string():
    """Verify two strings input to string output."""
    # When two strings are passed on separate lines (standard LeetCode format)
    tc = [{"input": '"foo"\n"bar"', "expected_output": '"foobar"'}]
    starters = generate_starter_code(tc, title="Concatenate Strings", concept_tag="strings")

    _assert_no_unsafe_modules(starters)

    # Multi-line input parsing
    py = starters["python"]
    assert "def solve(lines: list[str]) -> str:" in py
    assert "sys.stdin.read().splitlines()" in py
    _verify_python_ast(py)

    java = starters["java"]
    assert "public static String solve(List<String> lines)" in java
    assert 'scanner.useDelimiter("\\\\A");' in java

    cpp = starters["cpp"]
    assert "std::string solve(const std::vector<std::string>& lines)" in cpp
    assert "std::getline(std::cin, line)" in cpp

    js = starters["javascript"]
    assert "function solve(lines)" in js
    assert "fs.readFileSync(0, 'utf8')" in js
    _verify_js_syntax(js)


def test_boolean_output_formatting_python_bool():
    """Verify boolean output formatting when expected_output is 'True' / 'False'."""
    tc = [{"input": "2", "expected_output": "True"}]
    starters = generate_starter_code(tc, title="Is Even", concept_tag="basic_syntax")

    _assert_no_unsafe_modules(starters)

    # Python prints True directly
    py = starters["python"]
    assert "def solve(n: int) -> bool:" in py
    assert "print(result)" in py
    _verify_python_ast(py)

    # JS prints True formatted
    js = starters["javascript"]
    assert 'console.log(result ? "True" : "False");' in js
    _verify_js_syntax(js)

    # Java prints True
    java = starters["java"]
    assert 'System.out.println(result ? "True" : "False");' in java

    # C++ prints True
    cpp = starters["cpp"]
    assert 'std::cout << (result ? "True" : "False") << std::endl;' in cpp


def test_boolean_output_formatting_json_bool():
    """Verify boolean output formatting when expected_output is 'true' / 'false'."""
    tc = [{"input": "[[1,2],[2,1]]", "expected_output": "true"}]
    starters = generate_starter_code(tc, title="Toeplitz Matrix", concept_tag="arrays")

    _assert_no_unsafe_modules(starters)

    # Python dumps json to ensure lowercase 'true'
    py = starters["python"]
    assert "print(json.dumps(result))" in py
    _verify_python_ast(py)

    # JS prints result directly (lowercase true in JS)
    js = starters["javascript"]
    assert "console.log(result);" in js
    _verify_js_syntax(js)

    # Java prints result directly (lowercase true in Java)
    java = starters["java"]
    assert "System.out.println(result);" in java

    # C++ prints lowercase true
    cpp = starters["cpp"]
    assert 'std::cout << (result ? "true" : "false") << std::endl;' in cpp


def test_empty_expected_output_handling():
    """Verify generator handles empty expected_output without crashing."""
    for empty_val in ("", None, "   "):
        tc = [{"input": "42", "expected_output": empty_val}]
        starters = generate_starter_code(tc, title="No Output Problem")

        assert len(starters) == 4
        _assert_no_unsafe_modules(starters)
        _verify_python_ast(starters["python"])
        _verify_js_syntax(starters["javascript"])


def test_multiline_input_handling_readers():
    """Verify multiline inputs use the required readers for all 4 languages."""
    tc = [{"input": "2\n[[0,10],[1,5],[2,7],[3,4]]", "expected_output": "0"}]
    starters = generate_starter_code(tc, title="Meeting Rooms III", concept_tag="intervals")

    _assert_no_unsafe_modules(starters)

    # Python: must use sys.stdin.read()
    py = starters["python"]
    assert "sys.stdin.read()" in py
    assert "splitlines()" in py
    _verify_python_ast(py)

    # Java: must use scanner.useDelimiter("\\A")
    java = starters["java"]
    assert 'scanner.useDelimiter("\\\\A");' in java

    # C++: must use getline loop
    cpp = starters["cpp"]
    assert "while (std::getline(std::cin, line))" in cpp

    # JS: must use fs.readFileSync(0, 'utf8')
    js = starters["javascript"]
    assert "fs.readFileSync(0, 'utf8')" in js
    _verify_js_syntax(js)


def test_fallback_empty_test_cases():
    """Verify fallback handling when test_cases is empty or input is empty."""
    empty_cases = [
        [],
        [{}],
        [{"input": ""}],
        [{"input": None}],
        [{"input": "   ", "expected_output": ""}],
    ]

    for tc in empty_cases:
        starters = generate_starter_code(tc, title="Fallback Problem")
        assert len(starters) == 4
        _assert_no_unsafe_modules(starters)

        py = starters["python"]
        assert "def solve(data: str)" in py
        assert "data = sys.stdin.read().strip()" in py
        _verify_python_ast(py)

        java = starters["java"]
        assert "public static String solve(String data)" in java

        cpp = starters["cpp"]
        assert "std::string solve(const std::string& data)" in cpp

        js = starters["javascript"]
        assert "function solve(data)" in js
        _verify_js_syntax(js)


def test_unsafe_module_absence_across_diverse_inputs():
    """Verify absolute absence of unsafe modules across multiple concepts and shapes."""
    diverse_test_cases = [
        [{"input": "[1, 2, 3]", "expected_output": "6"}],
        [{"input": "true", "expected_output": "false"}],
        [{"input": "'hello'", "expected_output": "5"}],
        [{"input": "1.5\n2.5", "expected_output": "4.0"}],
        [{"input": "10\n11", "expected_output": "false"}],
    ]

    for tc in diverse_test_cases:
        starters = generate_starter_code(tc)
        _assert_no_unsafe_modules(starters)


def test_concept_tag_flat_signatures():
    """Verify concept_tag 'recursion' and 'dynamic_programming' produce flat functions."""
    for tag in ("recursion", "dynamic_programming"):
        tc = [{"input": "[1, 2, 3]", "expected_output": "3"}]
        starters = generate_starter_code(tc, concept_tag=tag, title="Fibonacci")

        # Python: no class at all
        py = starters["python"]
        assert "class " not in py
        assert "def solve(" in py

        # Java: class Main only, no nested helper classes
        java = starters["java"]
        assert java.count("class ") == 1
        assert "public class Main" in java

        # C++: flat function solve
        cpp = starters["cpp"]
        assert "class " not in cpp
        assert "solve(" in cpp

        # JS: flat function solve
        js = starters["javascript"]
        assert "class " not in js
        assert "function solve(" in js


def test_example_comment_truncation():
    """Verify example stdin comment truncates to 80 characters without breaking comment."""
    long_input = "a" * 120
    tc = [{"input": long_input, "expected_output": "0"}]
    starters = generate_starter_code(tc)

    py = starters["python"]
    first_line_py = py.splitlines()[0]
    assert first_line_py.startswith("# example stdin: ")
    # The truncated input portion is at most 80 chars
    truncated_part = first_line_py.replace("# example stdin: ", "")
    assert len(truncated_part) <= 80
    assert truncated_part == "a" * 80

    java = starters["java"]
    first_line_java = java.splitlines()[0]
    assert first_line_java.startswith("// example stdin: ")
    truncated_part_java = first_line_java.replace("// example stdin: ", "")
    assert len(truncated_part_java) <= 80


def test_languages_filtering():
    """Verify languages parameter subsets returned dictionary."""
    tc = [{"input": "1, 2", "expected_output": "3"}]

    res_py = generate_starter_code(tc, languages=["python"])
    assert list(res_py.keys()) == ["python"]

    res_sub = generate_starter_code(tc, languages=["java", "cpp"])
    assert set(res_sub.keys()) == {"java", "cpp"}


def test_float_output_inference():
    """Verify float output format inference."""
    tc = [{"input": "2.00000\n10", "expected_output": "1024.00000"}]
    starters = generate_starter_code(tc, title="Pow(x, n)")

    assert infer_output_type("1024.00000") == "float"
    assert infer_output_type("-3.14159") == "float"

    _verify_python_ast(starters["python"])
    _verify_js_syntax(starters["javascript"])
    assert "double" in starters["java"]
    assert "double" in starters["cpp"]


def test_quoted_string_input_inference():
    """Verify quoted string input inference."""
    tc = [{"input": "'hello'", "expected_output": "2"}]
    input_type, is_fallback = infer_input_type("'hello'")
    assert input_type == "string"
    assert not is_fallback

    starters = generate_starter_code(tc)
    _verify_python_ast(starters["python"])
    _verify_js_syntax(starters["javascript"])


# ----------------------------------------------------------------------------
# Spot-check Compilation Tests (Java & C++)
# ----------------------------------------------------------------------------


def test_spot_check_java_compilation():
    """Spot-check that generated Java starter compiles with javac."""
    javac_path = shutil.which("javac")
    if not javac_path:
        pytest.skip("javac not available on PATH")

    test_samples = [
        [{"input": "[1, 2, 3]", "expected_output": "[3, 2, 1]"}],
        [{"input": "1, 2", "expected_output": "3"}],
        [{"input": "true", "expected_output": "false"}],
    ]

    with tempfile.TemporaryDirectory() as temp_dir:
        for i, tc in enumerate(test_samples):
            starters = generate_starter_code(tc, languages=["java"])
            java_code = starters["java"]

            java_file = os.path.join(temp_dir, f"Main_{i}.java")
            # For javac compilation test, rename class to match file or compile in separate folder
            sub_dir = os.path.join(temp_dir, f"test_{i}")
            os.makedirs(sub_dir, exist_ok=True)
            main_java = os.path.join(sub_dir, "Main.java")
            with open(main_java, "w", encoding="utf-8") as f:
                f.write(java_code)

            res = subprocess.run([javac_path, main_java], capture_output=True, text=True)
            assert res.returncode == 0, f"javac failed on sample {i}:\n{res.stderr}\nCode:\n{java_code}"


def test_spot_check_cpp_compilation():
    """Spot-check that generated C++ starter compiles with g++ or wsl g++."""
    gpp_cmd = None
    if shutil.which("g++"):
        gpp_cmd = ["g++"]
    elif shutil.which("wsl"):
        wsl_check = subprocess.run(["wsl", "which", "g++"], capture_output=True, text=True)
        if wsl_check.returncode == 0 and wsl_check.stdout.strip():
            gpp_cmd = ["wsl", "g++"]

    if not gpp_cmd:
        pytest.skip("g++ not available on host or WSL")

    test_samples = [
        [{"input": "[1, 2, 3]", "expected_output": "[3, 2, 1]"}],
        [{"input": "1, 2", "expected_output": "3"}],
        [{"input": "2\n[[0,1],[1,0]]", "expected_output": "0"}],
    ]

    with tempfile.TemporaryDirectory() as temp_dir:
        for i, tc in enumerate(test_samples):
            starters = generate_starter_code(tc, languages=["cpp"])
            cpp_code = starters["cpp"]

            cpp_file = os.path.join(temp_dir, f"main_{i}.cpp")
            with open(cpp_file, "w", encoding="utf-8") as f:
                f.write(cpp_code)

            if gpp_cmd[0] == "wsl":
                # Convert Windows path to wsl path
                wsl_path = subprocess.run(["wsl", "wslpath", "-a", cpp_file.replace("\\", "/")], capture_output=True, text=True).stdout.strip()
                out_path = f"{wsl_path}.out"
                res = subprocess.run(["wsl", "g++", "-std=c++17", "-O2", wsl_path, "-o", out_path], capture_output=True, text=True)
            else:
                out_path = os.path.join(temp_dir, f"main_{i}.exe")
                res = subprocess.run([*gpp_cmd, "-std=c++17", "-O2", cpp_file, "-o", out_path], capture_output=True, text=True)

            assert res.returncode == 0, f"g++ failed on sample {i}:\n{res.stderr}\nCode:\n{cpp_code}"
