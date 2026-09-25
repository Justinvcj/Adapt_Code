import pytest
from app.services.bkt import compute_effective_weight, update_mastery, get_bkt_params

def test_effective_correctness():
    eff1 = compute_effective_weight(result=1, hint_used=False, attempt_count=1, compile_errors=0, time_seconds=30)
    assert eff1 == 1.0
    
    eff2 = compute_effective_weight(result=1, hint_used=True, attempt_count=3, compile_errors=0, time_seconds=600)
    assert eff2 < 1.0

def test_update_mastery():
    # Test increase
    new_mastery = update_mastery(0.5, 1.0, "basic_syntax")
    assert new_mastery > 0.5
    
    # Test decrease
    new_mastery = update_mastery(0.5, 0.0, "dynamic_programming")
    assert new_mastery < 0.5
