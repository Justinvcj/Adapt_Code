import os
import ast
import google.generativeai as genai
from dotenv import load_dotenv
from app.core.config import logger

load_dotenv()

from app.core.config import settings

def _get_model():
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set. LLM tutoring will fail gracefully.")
        return None
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel('gemini-3.6-flash')

def _get_ast_info(code: str) -> str:
    try:
        tree = ast.parse(code)
        loops = sum(1 for node in ast.walk(tree) if isinstance(node, (ast.For, ast.While)))
        nested_loops = 0
        for node in ast.walk(tree):
            if isinstance(node, (ast.For, ast.While)):
                for child in ast.walk(node):
                    if child != node and isinstance(child, (ast.For, ast.While)):
                        nested_loops += 1
        return f"Structural Info: {loops} loops total. {nested_loops} nested loops."
    except Exception:
        return "Structural Info: Contains syntax errors, unable to parse AST."

def generate_explanation(code: str, problem_description: str, error_verdict: str, expected_output: str = "", actual_output: str = "", input_case: str = "") -> str:
    """
    Component 7: AI Explanation Engine.
    Uses Zhipu AI GLM-4-Flash to generate a 3-part targeted explanation for a failed submission.
    """
    
    prompt = f"""
You are an expert programming tutor employing the Socratic method. The student's code failed.
STRICT RULE: YOU MUST NEVER GENERATE CODE BLOCKS containing the solution. You must only ask leading questions or point out structural flaws.

Problem Description:
{problem_description}

Student's Code:
```python
{code}
```
{_get_ast_info(code)}

Failed Test Case Info:
Input: {input_case}
Expected Output: {expected_output}
Actual Output (or error): {actual_output or error_verdict}

Respond in EXACTLY three parts, separated by newlines:
1. The Bug: (Point out the specific line or logic causing the mismatch, without giving the code to fix it)
2. Socratic Question: (Ask a leading question to make them realize why their approach fails on this specific input)
3. Concept Review: (Name the concept they need to study, e.g., 'Array Bounds')
"""

    try:
        model = _get_model()
        if not model:
            return "AI Tutor Error: API Key not configured."
        
        system_instruction = "You are a highly intelligent, empathetic programming tutor."
        response = model.generate_content(
            f"{system_instruction}\n\n{prompt}",
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                max_output_tokens=500,
            )
        )
        return response.text
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Error calling Gemini API: {e}")
        return "Unable to generate explanation at this time. Please check your logic and try again."

def analyze_complexity(code: str) -> str:
    """
    Component 8: Post-Submission Analysis.
    Analyzes Big-O Time and Space complexity of successful code.
    """
    prompt = f"""
Analyze the Time and Space complexity of the following successful code submission.

Code:
```python
{code}
```

{_get_ast_info(code)}

Respond in exactly this format:
Time Complexity: O(...) - (1 sentence explaining why)
Space Complexity: O(...) - (1 sentence explaining why)
Optimization: (1 sentence on whether a better approach exists, or 'This is optimal.')
"""
    try:
        model = _get_model()
        if not model:
            return "Analysis Error: API Key not configured."
            
        system_instruction = "You are an algorithmic complexity analyzer."
        response = model.generate_content(
            f"{system_instruction}\n\n{prompt}",
            generation_config=genai.GenerationConfig(
                temperature=0.2,
                max_output_tokens=200,
            )
        )
        return response.text
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Error calling Gemini API for complexity: {e}")
        return "Complexity analysis unavailable."
