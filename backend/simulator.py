import os
import random
import numpy as np
from supabase import create_client, Client
from dotenv import load_dotenv
from linucb import LinUCBAgent
from bkt import BKTDoctor
import uuid
import time

load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def simulate_students(num_students=50, sessions_per_student=10):
    print(f"Starting simulation for {num_students} synthetic students...")
    
    agent = LinUCBAgent(n_actions=5, context_dim=16)
    bkt = BKTDoctor()
    
    # 3 target difficulties
    difficulties = ['easy', 'medium', 'hard']
    valid_mask = [True, True, True, False, False]
    
    for s in range(num_students):
        student_id = f"sim_student_{uuid.uuid4().hex[:8]}"
        
        # Random initial masteries
        masteries = {
            'arrays': random.uniform(0.1, 0.4),
            'strings': random.uniform(0.1, 0.4)
        }
        
        for sess in range(sessions_per_student):
            # Construct mock 16D vector
            ctx = np.zeros(16)
            ctx[2] = masteries.get('arrays', bkt.p_prior)
            ctx[3] = masteries.get('strings', bkt.p_prior)
            ctx[12] = random.uniform(0, 1) # duration
            ctx[13] = random.uniform(0, 1) # hint usage
            
            # Agent picks difficulty
            action = agent.select_action(ctx, valid_mask)
            
            # Simulate environment reward based on Vygotsky's ZPD
            # If student mastery is low, easy is best reward. If high, hard is best.
            avg_mastery = (masteries['arrays'] + masteries['strings']) / 2.0
            
            if avg_mastery < 0.4:
                optimal_action = 0 # easy
            elif avg_mastery < 0.7:
                optimal_action = 1 # medium
            else:
                optimal_action = 2 # hard
                
            # Calculate reward
            reward = 1.0 if action == optimal_action else 0.0
            
            # Agent updates weights
            agent.update(action, ctx, reward)
            
            # Student improves slightly
            masteries['arrays'] = min(0.99, masteries['arrays'] + 0.05)
            masteries['strings'] = min(0.99, masteries['strings'] + 0.05)
            
    # Save pretrained weights to Supabase
    print("Pretraining complete. Saving weights to Supabase...")
    for a in range(agent.n_actions):
        A_flat = agent.A[a].flatten().tolist()
        b_flat = agent.b[a].flatten().tolist()
        
        try:
            supabase.table("agent_state").upsert({
                "action_id": a,
                "A_matrix": A_flat,
                "b_vector": b_flat,
                "updated_at": "now()"
            }).execute()
        except Exception as e:
            print(f"Error saving state for action {a}: {e}")
            
    print("Successfully bootstrapped LinUCB agent in database.")

if __name__ == "__main__":
    simulate_students(num_students=100, sessions_per_student=20)
