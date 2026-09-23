import numpy as np
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.linucb import LinUCBAgent, PREREQUISITE_GRAPH, get_weakest_unlocked
from app.services.bkt import compute_effective_weight, update_mastery

CONCEPTS = list(PREREQUISITE_GRAPH.keys())

def simulate(n_students=100, problems_per_student=50, strategy="linucb", seed=42):
    np.random.seed(seed)
    agent = LinUCBAgent(d=16, alpha=1.0)
    
    results = []
    
    for s_idx in range(n_students):
        student_id = f"student_{s_idx}"
        # Everyone starts with low mastery
        mastery = {c: float(np.random.beta(1, 9)) for c in CONCEPTS}
        
        recent_hints, recent_attempts, recent_times = [], [], []
        
        for step in range(problems_per_student):
            # Context
            ctx = np.zeros(16)
            for i, c in enumerate(CONCEPTS):
                ctx[i] = mastery.get(c, 0.1)
            
            prereq = get_weakest_unlocked(mastery)
            ctx[12] = mastery.get(prereq, 1.0) if prereq else 1.0
            ctx[13] = np.mean(recent_hints[-5:]) if recent_hints else 0.2
            ctx[14] = np.mean(recent_attempts[-5:]) / 10.0 if recent_attempts else 0.1
            ctx[15] = np.mean(recent_times[-5:]) / 1200.0 if recent_times else 0.5
            
            allowed_actions = list(range(agent.n_actions))
            
            if strategy == "linucb":
                action = agent.select_action(student_id, ctx, allowed_actions)
            else:
                action = np.random.choice(allowed_actions)
                
            focus_concept = prereq if prereq else np.random.choice(CONCEPTS)
            
            p_correct = mastery.get(focus_concept, 0.1)
            # Action impact: harder problem => lower p_correct, easier => higher p_correct
            # action mapping: 0=easier, 1=same, 2=harder, 3=redirect_prereq, 4=revisit
            if action == 0:
                p_correct = min(1.0, p_correct * 1.5)
            elif action == 2:
                p_correct = max(0.01, p_correct * 0.5)
                
            correct = np.random.random() < p_correct
            hint_used = np.random.random() < (1 - p_correct) * 0.4
            attempts = max(1, int(np.random.exponential(3 * (1 - p_correct))))
            time_secs = max(30, np.random.normal(300 * (1 - p_correct), 120))
            compile_errs = max(0, int(np.random.poisson(3 * (1 - p_correct))))
            
            # Reward
            reward = (0.5 if hint_used else 1.0) if correct else -0.3
            
            if strategy == "linucb":
                agent.update(student_id, action, ctx, reward)
                
            w = compute_effective_weight(1 if correct else 0, hint_used, attempts, compile_errs, time_secs)
            mastery[focus_concept] = update_mastery(mastery[focus_concept], w)
            
            recent_hints.append(1.0 if hint_used else 0.0)
            recent_attempts.append(attempts)
            recent_times.append(time_secs)
            
            avg_mastery = np.mean(list(mastery.values()))
            results.append({
                "Strategy": strategy,
                "Student": student_id,
                "Step": step + 1,
                "AvgMastery": avg_mastery
            })
            
    return results

if __name__ == "__main__":
    import csv
    print("Simulating LinUCB Agent...")
    res_linucb = simulate(n_students=50, problems_per_student=40, strategy="linucb", seed=42)
    
    print("Simulating Random Agent...")
    res_random = simulate(n_students=50, problems_per_student=40, strategy="random", seed=42)
    
    all_res = res_linucb + res_random
    output_path = os.path.join(os.path.dirname(__file__), "performance_comparison.csv")
    
    with open(output_path, "w", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["Strategy", "Student", "Step", "AvgMastery"])
        writer.writeheader()
        writer.writerows(all_res)
        
    print(f"Simulation complete. Data saved to {output_path}")
    
    # Print quick summary
    final_linucb = np.mean([r["AvgMastery"] for r in res_linucb if r["Step"] == 40])
    final_random = np.mean([r["AvgMastery"] for r in res_random if r["Step"] == 40])
    print("\nFinal Average Mastery (Step 40):")
    print(f"LinUCB: {final_linucb:.4f}")
    print(f"Random: {final_random:.4f}")
