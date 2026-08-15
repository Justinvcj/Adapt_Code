import pytest
from app.services.bkt import BKTDoctor

def test_effective_correctness():
    doctor = BKTDoctor()
    
    eff1 = doctor.calculate_effective_correctness(is_correct=True, compile_errors=0, time_on_task_sec=30, hint_used=False, attempts=1)
    assert eff1 == 1.0
    
    eff2 = doctor.calculate_effective_correctness(is_correct=True, compile_errors=0, time_on_task_sec=600, hint_used=True, attempts=3)
    assert eff2 < 1.0

def test_update_mastery():
    doctor = BKTDoctor()
    
    # Test increase
    new_mastery = doctor.update_mastery(0.5, 1.0, "basic_syntax")
    assert new_mastery > 0.5
    
    # Test decrease
    new_mastery = doctor.update_mastery(0.5, 0.0, "dynamic_programming")
    assert new_mastery < 0.5
