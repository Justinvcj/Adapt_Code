import numpy as np

# BKT Parameters (fixed, not learned)
L0 = 0.30     # Prior probability of mastery
P_T = 0.12    # Probability of learning (transition)
P_G = 0.20    # Probability of guessing correctly
P_S = 0.10    # Probability of slipping (knowing but failing)

# Behavioral penalty weights
LAMBDA_H = 0.15   # Hint usage — strongest indicator
LAMBDA_TAU = 0.10  # Time-on-task
LAMBDA_K = 0.05    # Attempt count
LAMBDA_C = 0.03    # Compile errors — weakest

# Penalty caps
K_MAX = 5          # Cap attempt penalty at 5 extra attempts
C_MAX = 10         # Cap compile error penalty at 10
TAU_MAX = 1200     # 20 minutes — beyond this, time penalty kicks in

def compute_effective_weight(
    result: int,        # r: 1 if correct, 0 if incorrect
    hint_used: bool,    # h: whether hint was used
    attempt_count: int, # k: total attempts
    compile_errors: int,# c: compile error count
    time_seconds: float # τ: time on task
) -> float:
    """
    Compute effective-correctness weight w = r × (1 - ρ)
    where ρ is the behavioral penalty.
    """
    if result == 0:
        return 0.0
    
    rho = (
        LAMBDA_H * (1 if hint_used else 0) +
        LAMBDA_K * min(max(0, attempt_count - 1), K_MAX) +
        LAMBDA_C * min(compile_errors, C_MAX) +
        LAMBDA_TAU * (1 if time_seconds > TAU_MAX else 0)
    )
    
    rho = min(rho, 1.0)  # Cap at 1.0
    w = result * (1 - rho)
    return w

def update_mastery(
    prior_mastery: float,  # P(L) before this observation
    w: float               # effective-correctness weight
) -> float:
    """
    Update mastery probability using BKT with graded evidence.
    """
    L = prior_mastery
    
    # Blend between correct-update and incorrect-update using w
    p_correct_given_L = (1 - P_S)
    p_correct_given_not_L = P_G
    
    p_incorrect_given_L = P_S
    p_incorrect_given_not_L = (1 - P_G)
    
    # Weighted observation likelihood
    p_obs_given_L = w * p_correct_given_L + (1 - w) * p_incorrect_given_L
    p_obs_given_not_L = w * p_correct_given_not_L + (1 - w) * p_incorrect_given_not_L
    
    # Posterior via Bayes
    denominator = (p_obs_given_L * L + p_obs_given_not_L * (1 - L))
    if denominator == 0:
        p_L_given_obs = L
    else:
        p_L_given_obs = (p_obs_given_L * L) / denominator
    
    # Apply learning transition
    updated = p_L_given_obs + (1 - p_L_given_obs) * P_T
    
    return float(np.clip(updated, 0.0, 1.0))
