import numpy as np
from typing import List, Dict, Any
from app.core.database import get_supabase

class LinUCBAgent:
    """
    Component 6: The Coach - LinUCB Contextual Bandit.
    Takes context (16 features) and selects next problem action.
    """
    def __init__(self, n_actions: int = 5, context_dim: int = 16, alpha: float = 1.0):
        self.n_actions = n_actions
        self.context_dim = context_dim
        self.alpha = alpha
        self.supabase = get_supabase()

    def _get_student_state(self, student_id: str):
        res = self.supabase.table("agent_state").select("*").eq("student_id", student_id).execute()
        if res.data:
            state = res.data[0]
            A = [np.array(a) for a in state['a_matrices']]
            b = [np.array(vec) for vec in state['b_vectors']]
            return A, b
        else:
            A = [np.identity(self.context_dim) for _ in range(self.n_actions)]
            b = [np.zeros(self.context_dim) for _ in range(self.n_actions)]
            return A, b

    def _save_student_state(self, student_id: str, A: List[np.ndarray], b: List[np.ndarray]):
        state = {
            'A': [a.tolist() for a in A],
            'b': [vec.tolist() for vec in b]
        }
        self.supabase.table("agent_state").upsert({
            "student_id": student_id,
            "a_matrices": state['A'],
            "b_vectors": state['b'],
            "last_updated": "now()"
        }).execute()
        
    def select_action(self, student_id: str, context_vector: np.ndarray, valid_actions_mask: List[bool], session_duration: float = 0.5, hint_rate: float = 0.2, error_rate: float = 0.1, idle_time: float = 0.0) -> int:
        """
        Selects the best valid action using the UCB formula.
        """
        context_vector[12] = session_duration
        context_vector[13] = hint_rate
        context_vector[14] = error_rate
        context_vector[15] = idle_time

        A, b = self._get_student_state(student_id)
        p_t = np.zeros(self.n_actions)
        
        for a in range(self.n_actions):
            if not valid_actions_mask[a]:
                p_t[a] = -float('inf') # Mask out invalid actions (e.g. graph constraints)
                continue
                
            A_inv = np.linalg.inv(A[a])
            theta_a = A_inv.dot(b[a])
            
            # Expected reward
            expected_reward = theta_a.dot(context_vector)
            
            # Exploration bonus
            exploration_bonus = self.alpha * np.sqrt(context_vector.dot(A_inv).dot(context_vector))
            
            p_t[a] = expected_reward + exploration_bonus
            
        return int(np.argmax(p_t))
        
    def update(self, student_id: str, action: int, context_vector: np.ndarray, reward: float, session_duration: float = 0.5, hint_rate: float = 0.2, error_rate: float = 0.1, idle_time: float = 0.0):
        """
        Updates the model parameters based on the observed reward.
        """
        context_vector[12] = session_duration
        context_vector[13] = hint_rate
        context_vector[14] = error_rate
        context_vector[15] = idle_time

        A, b = self._get_student_state(student_id)
        
        A[action] += np.outer(context_vector, context_vector)
        b[action] += reward * context_vector
        
        self._save_student_state(student_id, A, b)
