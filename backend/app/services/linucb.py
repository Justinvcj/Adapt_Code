import numpy as np
from app.services.prerequisites import PREREQUISITE_GRAPH, MASTERY_THRESHOLD

def get_unlocked_concepts(mastery_vector: dict) -> list:
    unlocked = []
    for concept, prereqs in PREREQUISITE_GRAPH.items():
        if all(mastery_vector.get(p, 0) >= MASTERY_THRESHOLD for p in prereqs):
            unlocked.append(concept)
    return unlocked

def get_weakest_unlocked(mastery_vector: dict) -> str:
    unlocked = get_unlocked_concepts(mastery_vector)
    unmastered = [c for c in unlocked if mastery_vector.get(c, 0) < MASTERY_THRESHOLD]
    if not unmastered:
        return unlocked[-1] if unlocked else "basic_syntax"
    return min(unmastered, key=lambda c: mastery_vector.get(c, 0))

class LinUCBAgent:
    ACTIONS = [
        "easier_problem",
        "same_difficulty", 
        "harder_problem",
        "redirect_prerequisite",
        "hint_augmented"
    ]
    
    def __init__(self, d: int = 16, alpha: float = 1.0):
        self.d = d
        self.alpha = alpha
        self.n_actions = len(self.ACTIONS)
        
        # We'll store per-student parameters in dictionaries
        self.A = {}
        self.b = {}
        
    def _init_student(self, student_id: str):
        if student_id not in self.A:
            self.A[student_id] = {a: np.eye(self.d) for a in range(self.n_actions)}
            self.b[student_id] = {a: np.zeros(self.d) for a in range(self.n_actions)}
            
    def load_student(self, student_id: str, db_row: dict):
        self._init_student(student_id)
        if db_row:
            a_mats = db_row.get('a_matrices')
            b_vecs = db_row.get('b_vectors')
            if isinstance(a_mats, dict):
                for k, v in a_mats.items():
                    idx = int(k)
                    if idx < len(self.A[student_id]):
                        self.A[student_id][idx] = np.array(v)
            elif isinstance(a_mats, list):
                for idx, a in enumerate(a_mats):
                    if idx < len(self.A[student_id]):
                        self.A[student_id][idx] = np.array(a)
                        
            if isinstance(b_vecs, dict):
                for k, v in b_vecs.items():
                    idx = int(k)
                    if idx < len(self.b[student_id]):
                        self.b[student_id][idx] = np.array(v)
            elif isinstance(b_vecs, list):
                for idx, b in enumerate(b_vecs):
                    if idx < len(self.b[student_id]):
                        self.b[student_id][idx] = np.array(b)

    def build_context(self, mastery_vector: dict, recent_events: list) -> np.ndarray:
        concepts = list(PREREQUISITE_GRAPH.keys())
        x = np.zeros(self.d)
        for i, c in enumerate(concepts):
            x[i] = mastery_vector.get(c, 0.30)
        unlocked = get_unlocked_concepts(mastery_vector)
        unmastered = [c for c in unlocked if mastery_vector.get(c, 0) < MASTERY_THRESHOLD]
        if unmastered:
            x[12] = min(mastery_vector.get(c, 0) for c in unmastered)
        else:
            x[12] = 1.0
        if recent_events:
            last_5 = recent_events[-5:]
            x[13] = np.mean([1 if e.get("hint_used") else 0 for e in last_5])
            x[14] = np.mean([e.get("attempt_count", 1) for e in last_5]) / 10.0
            x[15] = np.mean([e.get("time_on_task_seconds", 0) for e in last_5]) / 1200.0
        return x
    
    def select_action(self, student_id: str, x: np.ndarray, allowed_actions: list) -> int:
        self._init_student(student_id)
        best_score = -np.inf
        best_action = allowed_actions[0]
        
        for a in allowed_actions:
            A_inv = np.linalg.inv(self.A[student_id][a])
            theta = A_inv @ self.b[student_id][a]
            exploitation = theta @ x
            exploration = self.alpha * np.sqrt(x @ A_inv @ x)
            score = exploitation + exploration
            if score > best_score:
                best_score = score
                best_action = a
        return best_action
    
    def update(self, student_id: str, action: int, x: np.ndarray, reward: float):
        self._init_student(student_id)
        self.A[student_id][action] += np.outer(x, x)
        self.b[student_id][action] += reward * x
    
    def get_allowed_actions(self, mastery_vector: dict, current_concept: str) -> list:
        allowed = [0, 1, 4]
        if mastery_vector.get(current_concept, 0) >= 0.6:
            allowed.append(2)
        prereqs = PREREQUISITE_GRAPH.get(current_concept, [])
        if any(mastery_vector.get(p, 0) < MASTERY_THRESHOLD for p in prereqs):
            allowed.append(3)
        return allowed
    
    def compute_reward(self, verdict: str, hint_used: bool, 
                       w: float, prev_difficulty: str, curr_difficulty: str,
                       consecutive_same_diff: int) -> float:
        if verdict == "abandoned":
            return -0.5
        if verdict == "accepted":
            reward = 0.5 if hint_used else 1.0
            if curr_difficulty == "hard" and prev_difficulty in ("easy", "medium"):
                reward += 0.2
            elif curr_difficulty == "medium" and prev_difficulty == "easy":
                reward += 0.2
        else:
            reward = -0.3
        
        if consecutive_same_diff >= 3:
            reward -= 0.1
        return reward
