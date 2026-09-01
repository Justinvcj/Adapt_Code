import re

with open("seed_db.py", "r") as f:
    text = f.read()

# "expected_output": "'Hello'" -> "expected_output": "Hello"
text = re.sub(r'("expected_output":\s*)"\'(.*?)\'"', r'\1"\2"', text)
text = re.sub(r"('expected_output':\s*)'\"(.*?)\"'", r"\1'\2'", text)

with open("seed_db.py", "w") as f:
    f.write(text)
