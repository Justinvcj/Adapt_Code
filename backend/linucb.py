import numpy as np
from typing import List

class LinUCBAgent:
    """
    Component 6: The Coach - LinUCB Contextual Bandit.
    Takes context (16 features) and selects next problem action.
    """
    def __init__(self, n_actions: int = 5, context_dim: int = 16, alpha: float = 1.0):
        self.n_actions = n_actions
        self.context_dim = context_dim
        self.alpha = alpha
        
        # Initialize A matrices (d x d identity matrix) and b vectors (d x 1 zeros) for each action
        self.A = [np.identity(self.context_dim) for _ in range(self.n_actions)]
        self.b = [np.zeros(self.context_dim) for _ in range(self.n_actions)]
        
    def select_action(self, context_vector: np.ndarray, valid_actions_mask: List[bool]) -> int:
        """
        Selects the best valid action using the UCB formula.
        """
        p_t = np.zeros(self.n_actions)
        
        for a in range(self.n_actions):
            if not valid_actions_mask[a]:
                p_t[a] = -float('inf') # Mask out invalid actions (e.g. graph constraints)
                continue
                
            A_inv = np.linalg.inv(self.A[a])
            theta_a = A_inv.dot(self.b[a])
            
            # Expected reward
            expected_reward = theta_a.dot(context_vector)
            
            # Exploration bonus
            exploration_bonus = self.alpha * np.sqrt(context_vector.dot(A_inv).dot(context_vector))
            
            p_t[a] = expected_reward + exploration_bonus
            
        return int(np.argmax(p_t))
        
    def update(self, action: int, context_vector: np.ndarray, reward: float):
        """
        Updates the model parameters based on the observed reward.
        """
        self.A[action] += np.outer(context_vector, context_vector)
        self.b[action] += reward * context_vector
        
    def serialize_state(self):
        """Returns parameters as JSON-serializable structure for Supabase storage"""
        return {
            'A': [a.tolist() for a in self.A],
            'b': [vec.tolist() for vec in self.b]
        }
        
    def load_state(self, state_dict: dict):
        """Loads parameters from Supabase storage"""
        self.A = [np.array(a) for a in state_dict['A']]
        self.b = [np.array(vec) for vec in state_dict['b']]
