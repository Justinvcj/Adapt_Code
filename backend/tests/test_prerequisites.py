import pytest
from app.services.prerequisites import can_access_concept, get_weakest_unmastered_prerequisite

def test_can_access_concept():
    # Root concept
    assert can_access_concept('basic_syntax', {}) == True
    
    # Missing prereq
    assert can_access_concept('loops', {'basic_syntax': 0.5}) == False
    
    # Mastered prereq
    assert can_access_concept('loops', {'basic_syntax': 0.9}) == True
    
    # Complex DAG: dynamic_programming requires recursion which requires loops
    assert can_access_concept('dynamic_programming', {
        'basic_syntax': 0.9,
        'loops': 0.9,
        'recursion': 0.9
    }) == True
    
    assert can_access_concept('dynamic_programming', {
        'basic_syntax': 0.9,
        'loops': 0.9,
        'recursion': 0.5
    }) == False

def test_get_weakest_unmastered_prerequisite():
    assert get_weakest_unmastered_prerequisite('basic_syntax', {}) is None
    
    # Basic failure
    assert get_weakest_unmastered_prerequisite('loops', {'basic_syntax': 0.5}) == 'basic_syntax'
    
    # Two prereqs, one weaker
    # 'arrays' requires 'loops' and 'basic_syntax'
    assert get_weakest_unmastered_prerequisite('arrays', {
        'basic_syntax': 0.6,
        'loops': 0.4
    }) == 'loops'
    
    # All met
    assert get_weakest_unmastered_prerequisite('loops', {'basic_syntax': 0.9}) is None
