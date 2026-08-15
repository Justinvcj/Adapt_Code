import os
import sys
import random
import numpy as np
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
import time

# Ensure we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.linucb import LinUCBAgent
from app.services.bkt import BKTDoctor

load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def simulate_students(num_students=50, sessions_per_student=10):
    print(f"Starting simulation for {num_students} synthetic students...")
    
    agent = LinUCBAgent(n_actions=3, context_dim=16)
    bkt = BKTDoctor()
    
    # 3 target difficulties
    difficulties = ['easy', 'medium', 'hard']
    valid_mask = [True, True, True]
    
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
            action = agent.select_action(student_id, ctx, valid_mask)
            
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
            
            # Agent updates weights (this auto-saves to Supabase under student_id)
            agent.update(student_id, action, ctx, reward)
            
            # Student improves slightly
            masteries['arrays'] = min(0.99, masteries['arrays'] + 0.05)
            masteries['strings'] = min(0.99, masteries['strings'] + 0.05)
            
    print("Successfully simulated students and bootstrapped per-student LinUCB agents in database.")

if __name__ == "__main__":
    simulate_students(num_students=20, sessions_per_student=5)
