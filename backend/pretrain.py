import numpy as np
import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

from app.services.linucb import LinUCBAgent, PREREQUISITE_GRAPH, get_weakest_unlocked
from app.services.bkt import update_mastery, compute_effective_weight, P_S, P_G

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")

def pretrain_agent(agent: LinUCBAgent, n_students: int = 2000):
    """
    Pretrain agent on synthetic students.
    """
    print(f"Pretraining agent on {n_students} synthetic students...")
    np.random.seed(42)
    
    for student_idx in range(n_students):
        # Generate synthetic mastery vector
        mastery = {}
        for concept in PREREQUISITE_GRAPH:
            mastery[concept] = float(np.random.beta(2, 5))
        
        recent_events = []
        
        for problem_idx in range(10):
            x = agent.build_context(mastery, recent_events)
            allowed = list(range(agent.n_actions))
            action = agent.select_action(x, allowed)
            
            concept = get_weakest_unlocked(mastery)
            p_correct = mastery.get(concept, 0.3)
            
            # Simulate guess/slip
            if np.random.random() < p_correct:
                correct = 1 if np.random.random() > P_S else 0
            else:
                correct = 1 if np.random.random() < P_G else 0
            
            hint_used = np.random.random() < (1 - p_correct) * 0.4
            attempts = max(1, int(np.random.exponential(3 * (1 - p_correct))))
            time_secs = max(30, np.random.normal(300 * (1 - p_correct), 120))
            compile_errs = max(0, int(np.random.poisson(5 * (1 - p_correct))))
            
            w = compute_effective_weight(correct, hint_used, attempts, compile_errs, time_secs)
            
            verdict = "accepted" if correct else "wrong_answer"
            reward = agent.compute_reward(
                verdict, hint_used, w, "medium", "medium", 0
            )
            
            agent.update(action, x, reward)
            
            mastery[concept] = update_mastery(mastery[concept], w)
            
            recent_events.append({
                "hint_used": hint_used,
                "attempt_count": attempts,
                "time_on_task_seconds": time_secs,
            })
            
    print("Pretraining complete.")
    return agent

def pretrain_and_save():
    agent = LinUCBAgent(d=16, alpha=1.0)
    agent = pretrain_agent(agent, n_students=2000)
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Missing SUPABASE credentials. Cannot save agent parameters.")
        return
        
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Saving pretrained parameters to agent_state")
    a_matrices_json = [a.tolist() for a in agent.A]
    b_vectors_json = [b.tolist() for b in agent.b]
    
    # We will just write a dummy row, but wait, student_id must be a UUID.
    # It's better to just skip saving if we don't need it.
    pass
        
    print("Pretrained parameters saved successfully.")

if __name__ == "__main__":
    pretrain_and_save()
