import json
import ast
import os
from seed_db import PROBLEMS

def process():
    for p in PROBLEMS:
        p["description"] += "\n\n**Note**: Read from standard input and print the result. The input will be exactly the same format as the test cases. You can use `ast.literal_eval` or parse it manually."
        
        sol = p["solution_code"]
        func_name = "solve"
        for line in sol.split('\n'):
            if line.startswith("def "):
                func_name = line.split("def ")[1].split("(")[0]
                break
        
        new_sol = sol + f"\n\nif __name__ == '__main__':\n    import ast, sys\n    input_data = sys.stdin.read().strip()\n    if input_data:\n        args = ast.literal_eval(f'({{input_data}},)' if ',' not in input_data and not input_data.startswith('(') else f'({{input_data}})')\n        res = {func_name}(*args) if isinstance(args, tuple) else {func_name}(args)\n        if isinstance(res, list):\n            print(res)\n        elif isinstance(res, bool):\n            print(str(res).lower())\n        else:\n            print(res)"
        p["solution_code"] = new_sol

        for tc in p["test_cases"]:
            tc["input"] = tc["input"] # leave as is so literal_eval works
            val = ast.literal_eval(tc["expected_output"])
            if isinstance(val, bool):
                tc["expected_output"] = str(val).lower()
            else:
                tc["expected_output"] = str(val)

    with open("seed_db.py", "w", encoding="utf-8") as f:
        f.write("import os\nfrom supabase import create_client, Client\nfrom dotenv import load_dotenv\n\nload_dotenv()\n\n")
        f.write("url: str = os.environ.get('SUPABASE_URL', '')\n")
        f.write("key: str = os.environ.get('SUPABASE_KEY', '')\n")
        f.write("if not url or not key:\n")
        f.write("    print('No supabase URL/KEY. Exiting.')\n")
        f.write("    exit(1)\n")
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

if __name__ == "__main__":
    process()
