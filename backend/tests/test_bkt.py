import pytest
from bkt import BKTDoctor

def test_effective_correctness():
    doctor = BKTDoctor()
    
    # Perfect answer
    eff_corr = doctor.calculate_effective_correctness(
        is_correct=True,
        compile_errors=0,
        time_on_task_sec=60,
        hint_used=False,
        attempts=1
    )
    assert eff_corr == 1.0

    # Incorrect answer
    eff_corr_wrong = doctor.calculate_effective_correctness(
        is_correct=False,
        compile_errors=0,
        time_on_task_sec=60,
        hint_used=False,
        attempts=1
    )
    assert eff_corr_wrong == 0.0

    # Hint used penalty
    eff_corr_hint = doctor.calculate_effective_correctness(
        is_correct=True,
        compile_errors=0,
        time_on_task_sec=60,
        hint_used=True,
        attempts=1
    )
    assert 0.0 < eff_corr_hint < 1.0

def test_update_mastery():
    doctor = BKTDoctor()
    
    # Test increase
    new_mastery = doctor.update_mastery(0.5, 1.0)
    assert new_mastery > 0.5
    
    # Test decrease
    new_mastery_fail = doctor.update_mastery(0.5, 0.0)
    assert new_mastery_fail < 0.5
    
    # Bounds check
    assert 0.0 <= doctor.update_mastery(0.0, 0.0) <= 1.0
    assert 0.0 <= doctor.update_mastery(1.0, 1.0) <= 1.0
    
    # Edge cases
    assert doctor.update_mastery(0.0, 1.0) > 0.0
    
    # Due to BKT math, if mastery is exactly 1.0, it stays 1.0 because the student
    # can only "slip" and is mathematically considered to still have mastery.
    assert doctor.update_mastery(1.0, 0.0) == 1.0
