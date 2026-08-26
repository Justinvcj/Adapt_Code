import ast
from seed_db import PROBLEMS

def process():
    for i, p in enumerate(PROBLEMS):
        for tc in p["test_cases"]:
            try:
                # evaluate the arguments string into a tuple
                inp = tc["input"]
                if not inp.strip():
                    args = ()
                else:
                    # ensure it is evaluated as a tuple
                    args = ast.literal_eval(f"({inp},)" if "," not in inp and not inp.startswith("(") else f"({inp})")
                
                # convert args to a string representation for stdin
                stdin_lines = []
                for a in args:
                    if isinstance(a, list):
                        stdin_lines.append(str(len(a)))
                        stdin_lines.append(" ".join(map(str, a)))
                    else:
                        stdin_lines.append(str(a))
                
                new_input = "\n".join(stdin_lines)
                
                # evaluate expected output
                outp = tc["expected_output"]
                val = ast.literal_eval(outp)
                if isinstance(val, list):
                    new_output = " ".join(map(str, val))
                elif isinstance(val, bool):
                    new_output = str(val).lower()
                else:
                    new_output = str(val)
                
            except Exception as e:
                print(f"Failed on {p['title']} tc: {tc['input']} - {e}")
                return False
    print("All inputs and outputs can be parsed!")
    return True

if __name__ == "__main__":
    process()
