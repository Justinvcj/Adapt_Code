import numpy as np

class BKTDoctor:
    """
    Component 5: The Doctor - Bayesian Knowledge Tracing.
    Updates mastery probability based on execution signals.
    """
    def __init__(self, p_prior=0.3, p_learn=0.1, p_guess=0.2, p_slip=0.1):
        # Default BKT parameters
        self.p_prior = p_prior
        self.p_learn = p_learn
        self.p_guess = p_guess
        self.p_slip = p_slip

    def calculate_effective_correctness(self, is_correct: bool, compile_errors: int, time_on_task_sec: int, hint_used: bool, attempts: int) -> float:
        """
        Calculates a soft continuous 'correctness' score (0.0 to 1.0) incorporating all 5 Observer signals.
        """
        base = 1.0 if is_correct else 0.0
        
        # Penalties that reduce the weight of a correct answer
        hint_penalty = 0.2 if hint_used else 0.0
        
        # Non-linear decay for attempts
        attempt_penalty = min(((attempts - 1) ** 1.5) * 0.03, 0.4)
        
        # Non-linear decay for time (starts penalizing heavily after 10 mins)
        time_penalty = 0.0
        if time_on_task_sec > 600:
            time_penalty = min(0.3, ((time_on_task_sec - 600) / 3600.0) ** 1.5)
            
        compile_penalty = min(0.05 * compile_errors, 0.2)
        
        effective = base - hint_penalty - attempt_penalty - compile_penalty - time_penalty
        return max(effective, 0.0)

    def update_mastery(self, current_mastery: float, effective_correctness: float, concept_tag: str) -> float:
        """
        Updates the mastery probability using the BKT formulas modified for continuous evidence.
        """
        from app.core.config import BKT_PARAMS_BY_TIER
        from app.services.prerequisites import CONCEPT_TIERS
        
        tier = CONCEPT_TIERS.get(concept_tag, 1)
        params = BKT_PARAMS_BY_TIER.get(tier)
        p_learn = params["p_learn"]
        p_guess = params["p_guess"]
        p_slip = params["p_slip"]
        
        # Calculate P(L | evidence) using a weighted combination of the correct and incorrect updates
        
        # Standard update if fully correct (effective == 1.0)
        p_l_given_correct = (current_mastery * (1 - p_slip)) / \
                            (current_mastery * (1 - p_slip) + (1 - current_mastery) * p_guess)
                            
        # Standard update if fully incorrect (effective == 0.0)
        p_l_given_incorrect = (current_mastery * p_slip) / \
                              (current_mastery * p_slip + (1 - current_mastery) * (1 - p_guess))
                              
        # Interpolate based on effective correctness
        p_l_given_evidence = (effective_correctness * p_l_given_correct) + ((1.0 - effective_correctness) * p_l_given_incorrect)
        
        # Apply learning step (transition probability)
        new_mastery = p_l_given_evidence + (1 - p_l_given_evidence) * p_learn
        
        return new_mastery
