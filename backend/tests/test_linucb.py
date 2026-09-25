import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from app.services.linucb import LinUCBAgent

def test_select_action():
    agent = LinUCBAgent(d=16, alpha=1.0)
    context = np.zeros(16)
    
    # Allowed actions: 0, 1, 2, 3, 4
    action = agent.select_action(context, [0, 1, 2])
    assert action in [0, 1, 2]

def test_context_dim_mismatch():
    agent = LinUCBAgent(d=16, alpha=1.0)
    with pytest.raises(ValueError): # numpy raises ValueError on mismatch
        agent.select_action(np.array([1.0, 0.5]), [0, 1, 2])
