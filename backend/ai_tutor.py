import os
from zhipuai import ZhipuAI
from dotenv import load_dotenv

load_dotenv()

# Initialize ZhipuAI client
ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY")
client = ZhipuAI(api_key=ZHIPU_API_KEY)

def generate_explanation(code: str, problem_description: str, error_verdict: str, expected_output: str = "", actual_output: str = "") -> str:
    """
    Component 7: AI Explanation Engine.
    Uses Zhipu AI GLM-4-Flash to generate a 3-part targeted explanation for a failed submission.
    """
    
    prompt = f"""
You are an expert programming tutor helping a student prepare for interviews. The student has submitted code that failed.
Do NOT just give them the correct answer. You must help them learn.

Problem Description:
{problem_description}

Student's Code:
```
{code}
```

Execution Result: {error_verdict}
"""
    if expected_output or actual_output:
        prompt += f"""
Expected Output: {expected_output}
Actual Output: {actual_output}
"""
        
    prompt += """
Respond in EXACTLY three parts, separated by newlines:
1. What went wrong: (Identify the specific logic or syntax error in their code)
2. Why it fails: (The conceptual reason their approach doesn't work for this problem)
3. What to review: (Name the programming concept they need to study, e.g., 'Two Pointers', and explain it in 2 sentences)
"""

    try:
        response = client.chat.completions.create(
            model="glm-4-flash",
            messages=[
                {"role": "system", "content": "You are a highly intelligent, empathetic programming tutor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error calling Zhipu API: {e}")
        return "1. What went wrong: We couldn't analyze your code at this time.\n2. Why it fails: The AI explanation service is currently unavailable.\n3. What to review: Please review the problem constraints manually."
