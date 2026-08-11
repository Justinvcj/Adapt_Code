import pytest
import numpy as np
from linucb import LinUCBAgent

def test_select_action():
    agent = LinUCBAgent(n_actions=3, context_dim=4)
    context = np.array([1.0, 0.5, 0.2, 0.1])
    valid_mask = [True, True, True]
    
    action = agent.select_action(context, valid_mask)
    assert action in [0, 1, 2]
    
    # Masking test
    action_masked = agent.select_action(context, [False, True, False])
    assert action_masked == 1

def test_update_state():
    agent = LinUCBAgent(n_actions=3, context_dim=4)
    context = np.array([1.0, 0.5, 0.2, 0.1])
    
    initial_A = np.copy(agent.A[0])
    initial_b = np.copy(agent.b[0])
    
    agent.update(0, context, 1.0)
    
    assert not np.array_equal(agent.A[0], initial_A)
    assert not np.array_equal(agent.b[0], initial_b)

def test_serialization():
    agent = LinUCBAgent(n_actions=3, context_dim=4)
    agent.update(0, np.array([1.0, 0.5, 0.2, 0.1]), 1.0)
    
    state = agent.serialize_state()
    assert 'A' in state
    assert 'b' in state
    
    new_agent = LinUCBAgent(n_actions=3, context_dim=4)
    new_agent.load_state(state)
    
    assert np.array_equal(new_agent.A[0], agent.A[0])
    assert np.array_equal(new_agent.b[0], agent.b[0])

def test_context_dim_mismatch():
    agent = LinUCBAgent(n_actions=3, context_dim=4)
    with pytest.raises(ValueError):
        agent.select_action(np.array([1.0, 0.5]), [True, True, True])
