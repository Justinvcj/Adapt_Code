import tempfile
import subprocess
import os

def run_code_locally(code: str, language_id: int, stdin: str):
    """
    Executes Python or Java code in a temporary directory securely.
    Returns: (stdout, stderr, returncode)
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        if language_id == 71:
            file_path = os.path.join(temp_dir, "main.py")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            
            try:
                # Use python on Windows, python3 on Linux (Docker)
                py_cmd = "python3" if os.name != "nt" else "python"
                proc = subprocess.run(
                    [py_cmd, file_path],
                    input=stdin,
                    text=True,
                    capture_output=True,
                    timeout=3
                )
                return proc.stdout, proc.stderr, proc.returncode
            except subprocess.TimeoutExpired:
                return "", "Time Limit Exceeded", 124
                
        elif language_id == 62:
            # Java expects public class Main
            file_path = os.path.join(temp_dir, "Main.java")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            
            # Compile
            compile_proc = subprocess.run(
                ["javac", file_path],
                capture_output=True,
                text=True
            )
            if compile_proc.returncode != 0:
                return "", compile_proc.stderr, compile_proc.returncode
                
            # Run
            try:
                proc = subprocess.run(
                    ["java", "-cp", temp_dir, "Main"],
                    input=stdin,
                    text=True,
                    capture_output=True,
                    timeout=3
                )
                return proc.stdout, proc.stderr, proc.returncode
            except subprocess.TimeoutExpired:
                return "", "Time Limit Exceeded", 124
        elif language_id == 63:
            # JavaScript expects node main.js
            file_path = os.path.join(temp_dir, "main.js")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            
            try:
                proc = subprocess.run(
                    ["node", file_path],
                    input=stdin,
                    text=True,
                    capture_output=True,
                    timeout=3
                )
                return proc.stdout, proc.stderr, proc.returncode
            except subprocess.TimeoutExpired:
                return "", "Time Limit Exceeded", 124

        elif language_id == 54:
            # C++ expects g++ compilation
            file_path = os.path.join(temp_dir, "main.cpp")
            out_path = os.path.join(temp_dir, "main")
            if os.name == "nt":
                out_path += ".exe"
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            
            # Compile
            compile_proc = subprocess.run(
                ["g++", "-o", out_path, file_path],
                capture_output=True,
                text=True
            )
            if compile_proc.returncode != 0:
                return "", compile_proc.stderr, compile_proc.returncode
                
            # Run
            try:
                proc = subprocess.run(
                    [out_path],
                    input=stdin,
                    text=True,
                    capture_output=True,
                    timeout=3
                )
                return proc.stdout, proc.stderr, proc.returncode
            except subprocess.TimeoutExpired:
                return "", "Time Limit Exceeded", 124

        else:
            return "", "Unsupported Language", 1
