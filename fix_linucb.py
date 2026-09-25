import re
import os

with open("backend/schema.sql", "r") as f:
    schema = f.read()

old_table = """CREATE TABLE agent_state (
    student_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    a_matrices JSONB NOT NULL, -- JSON serialized NumPy arrays
    b_vectors JSONB NOT NULL, -- JSON serialized NumPy arrays
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);"""

new_table = """CREATE TABLE global_agent_state (
    id INT PRIMARY KEY DEFAULT 1,
    a_matrices JSONB NOT NULL,
    b_vectors JSONB NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);"""

schema = schema.replace(old_table, new_table)
schema = schema.replace("idx_agent_state_student_id ON agent_state(student_id)", "idx_global_agent_state_id ON global_agent_state(id)")

with open("backend/schema.sql", "w") as f:
    f.write(schema)


with open("backend/app/services/linucb.py", "r") as f:
    linucb_code = f.read()

linucb_code = linucb_code.replace("self.A = {}", "self.A = {a: np.eye(self.d) for a in range(self.n_actions)}")
linucb_code = linucb_code.replace("self.b = {}", "self.b = {a: np.zeros(self.d) for a in range(self.n_actions)}")

linucb_code = re.sub(r'def _init_student.*?self\.b\[student_id\] = \{a: np\.zeros\(self\.d\) for a in range\(self\.n_actions\)\}', '', linucb_code, flags=re.DOTALL)

linucb_code = linucb_code.replace("def load_student(self, student_id: str, db_row: dict):", "def load_state(self, db_row: dict):")
linucb_code = linucb_code.replace("        self._init_student(student_id)\n", "")
linucb_code = linucb_code.replace("self.A[student_id]", "self.A")
linucb_code = linucb_code.replace("self.b[student_id]", "self.b")

linucb_code = linucb_code.replace("def select_action(self, student_id: str, x: np.ndarray, allowed_actions: list) -> int:", "def select_action(self, x: np.ndarray, allowed_actions: list) -> int:")
linucb_code = linucb_code.replace("def update(self, student_id: str, action: int, x: np.ndarray, reward: float):", "def update(self, action: int, x: np.ndarray, reward: float):")

with open("backend/app/services/linucb.py", "w") as f:
    f.write(linucb_code)


with open("backend/app/routers/problems.py", "r") as f:
    problems_code = f.read()

problems_code = problems_code.replace('supabase.table("agent_state").select("*").eq("student_id", user_id)', 'supabase.table("global_agent_state").select("*").eq("id", 1)')
problems_code = problems_code.replace('agent.load_student(user_id, db_row)', 'agent.load_state(db_row)')
problems_code = problems_code.replace('agent.select_action(user_id, x, allowed)', 'agent.select_action(x, allowed)')
problems_code = problems_code.replace('agent.update(user_id, action_idx, x, reward)', 'agent.update(action_idx, x, reward)')

a_json_old = "a_matrices_json = {str(k): v.tolist() for k, v in agent.A[user_id].items()}"
a_json_new = "a_matrices_json = {str(k): v.tolist() for k, v in agent.A.items()}"
b_json_old = "b_vectors_json = {str(k): v.tolist() for k, v in agent.b[user_id].items()}"
b_json_new = "b_vectors_json = {str(k): v.tolist() for k, v in agent.b.items()}"

problems_code = problems_code.replace(a_json_old, a_json_new)
problems_code = problems_code.replace(b_json_old, b_json_new)

upsert_old = """supabase.table("agent_state").upsert({
        "student_id": user_id,
        "a_matrices": a_matrices_json,
        "b_vectors": b_vectors_json
    }).execute()"""

upsert_new = """supabase.table("global_agent_state").upsert({
        "id": 1,
        "a_matrices": a_matrices_json,
        "b_vectors": b_vectors_json
    }).execute()"""
problems_code = problems_code.replace(upsert_old, upsert_new)

with open("backend/app/routers/problems.py", "w") as f:
    f.write(problems_code)

print("Modified linucb logic.")
