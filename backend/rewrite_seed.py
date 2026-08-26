import json
import asyncio
import os
import sys
import google.generativeai as genai
from dotenv import load_dotenv

# load backend/.env
load_dotenv(".env")
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("GEMINI_API_KEY not set")
    sys.exit(1)
genai.configure(api_key=api_key)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from seed_db import PROBLEMS

model = genai.GenerativeModel('gemini-3.6-flash', generation_config={"response_mime_type": "application/json"})

prompt_template = """
You are an expert programming instructor. I will give you a programming problem dictionary in JSON.
The problem currently expects a function to be written (e.g. `def solve(a, b):`).
You must rewrite it to read from `stdin` and print to `stdout`.

RULES:
1. `description`: Append or modify the description to explicitly say: "Read from input (one value per line or space-separated based on standard convention) and print the result."
2. `solution_code`: Write the python solution using `input()` and `print()`. Do NOT define a function unless you call it at the end.
3. `test_cases`: Convert the `input` field from a comma-separated function argument string into raw stdin string (e.g. "1, 2" -> "1\\n2"). Convert `expected_output` from python repr to raw printed string (e.g. "'Hello'" -> "Hello").
4. Return ONLY a JSON object with keys: `description`, `solution_code`, `test_cases`, `solution_explanation`, `hint_text`

Input Problem:
{problem_json}
"""

async def process_problem(idx, p):
    try:
        prompt = prompt_template.format(problem_json=json.dumps(p, indent=2))
        response = await model.generate_content_async(prompt)
        res = json.loads(response.text)
        
        p["description"] = res["description"]
        p["solution_code"] = res["solution_code"]
        p["test_cases"] = res["test_cases"]
        p["solution_explanation"] = res.get("solution_explanation", p["solution_explanation"])
        p["hint_text"] = res.get("hint_text", p["hint_text"])
        print(f"[{idx+1}/{len(PROBLEMS)}] Processed: {p['title']}")
    except Exception as e:
        print(f"[{idx+1}/{len(PROBLEMS)}] ERROR on {p['title']}: {e}")

async def main():
    print(f"Processing {len(PROBLEMS)} problems...")
    tasks = []
    # Process in batches of 10 to avoid rate limits
    batch_size = 5
    for i in range(0, len(PROBLEMS), batch_size):
        batch = PROBLEMS[i:i+batch_size]
        await asyncio.gather(*(process_problem(i+j, p) for j, p in enumerate(batch)))
        await asyncio.sleep(2) # rate limit mitigation

    with open("seed_db_new.py", "w", encoding="utf-8") as f:
        f.write("import os\nfrom supabase import create_client, Client\nfrom dotenv import load_dotenv\n\nload_dotenv()\n\n")
        f.write("url: str = os.environ.get('SUPABASE_URL')\n")
        f.write("key: str = os.environ.get('SUPABASE_KEY')\n")
        f.write("supabase: Client = create_client(url, key)\n\n")
        f.write("PROBLEMS = [\n")
        for p in PROBLEMS:
            f.write("    " + json.dumps(p, indent=4).replace("\n", "\n    ") + ",\n")
        f.write("]\n\n")
        f.write("def seed():\n")
        f.write("    # clear existing\n")
        f.write("    supabase.table('problems').delete().neq('problem_id', '00000000-0000-0000-0000-000000000000').execute()\n")
        f.write("    res = supabase.table('problems').insert(PROBLEMS).execute()\n")
        f.write("    print(f'Seeded {len(res.data)} problems.')\n\n")
        f.write("if __name__ == '__main__':\n")
        f.write("    seed()\n")
    print("Done writing to seed_db_new.py")

if __name__ == "__main__":
    asyncio.run(main())
