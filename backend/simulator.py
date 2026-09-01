import numpy as np
import os
from app.services.linucb import LinUCBAgent, PREREQUISITE_GRAPH, get_weakest_unlocked
from app.services.bkt import compute_effective_weight, update_mastery

CONCEPTS = list(PREREQUISITE_GRAPH.keys())

def pretrain_agent(n_students=2000, problems_per_student=10, seed=42):
    np.random.seed(seed)
    agent = LinUCBAgent(d=16, alpha=1.0)

    for s in range(n_students):
        mastery = {c: float(np.random.beta(2, 5)) for c in CONCEPTS}
        recent_hints, recent_attempts, recent_times = [], [], []

        for p in range(problems_per_student):
            ctx = np.zeros(16)
            for i, c in enumerate(CONCEPTS):
                ctx[i] = mastery.get(c, 0.3)

            focus_concept = min(CONCEPTS, key=lambda c: mastery[c])
            prereq = get_weakest_unlocked(mastery)
            ctx[12] = mastery.get(prereq, 1.0) if prereq else 1.0
            ctx[13] = np.mean(recent_hints[-5:]) if recent_hints else 0.2
            ctx[14] = np.mean(recent_attempts[-5:]) / 10.0 if recent_attempts else 0.1
            ctx[15] = np.mean(recent_times[-5:]) / 1200.0 if recent_times else 0.5

            allowed_actions = list(range(agent.n_actions))
            action = agent.select_action(ctx, allowed_actions)

            concept = focus_concept
            p_correct = mastery.get(concept, 0.3)
            correct = np.random.random() < (p_correct * 0.9 + 0.1)
            hint_used = np.random.random() < (1 - p_correct) * 0.4
            attempts = max(1, int(np.random.exponential(3 * (1 - p_correct))))
            time_secs = max(30, np.random.normal(300 * (1 - p_correct), 120))
            compile_errs = max(0, int(np.random.poisson(3 * (1 - p_correct))))

            reward = (0.5 if hint_used else 1.0) if correct else -0.3
            agent.update(action, ctx, reward)

            w = compute_effective_weight(1 if correct else 0, hint_used, attempts, compile_errs, time_secs)
            mastery[concept] = update_mastery(mastery[concept], w)

            recent_hints.append(1.0 if hint_used else 0.0)
            recent_attempts.append(attempts)
            recent_times.append(time_secs)

    total = n_students * problems_per_student
    print(f"Pretrained on {n_students} students x {problems_per_student} problems = {total} interactions")
    return agent

def save_pretrained_policy(agent):
    """Persist pretrained_policy A/b matrices to Supabase so new real students can copy them."""
    import psycopg2
    import json
    db_url = os.environ.get("SUPABASE_URL_DB", "postgresql://postgres:Justin12345Don54321@db.mnsuaqcrvnocvgbfreei.supabase.co:5432/postgres")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cursor = conn.cursor()
    
    for i, action_name in enumerate(agent.ACTIONS):
        cursor.execute("""
            INSERT INTO agent_params (student_id, action_name, a_matrix, b_vector)
            VALUES ('pretrained_policy', %s, %s, %s)
            ON CONFLICT (student_id, action_name) DO UPDATE SET
            a_matrix = EXCLUDED.a_matrix,
            b_vector = EXCLUDED.b_vector
        """, (
            action_name,
            json.dumps(agent.A[i].tolist()),
            json.dumps(agent.b[i].tolist())
        ))
    cursor.close()
    conn.close()

if __name__ == "__main__":
    agent = pretrain_agent(n_students=2000, problems_per_student=10, seed=42)
    save_pretrained_policy(agent)
    print("Pretrained policy saved. New students should copy this on registration.")
