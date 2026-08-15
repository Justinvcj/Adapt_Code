import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from app.services.linucb import LinUCBAgent

@patch('app.services.linucb.get_supabase')
def test_select_action(mock_supabase):
    mock_db = MagicMock()
    mock_supabase.return_value = mock_db
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    
    agent = LinUCBAgent(n_actions=3, context_dim=16)
    context = np.zeros(16)
    valid_mask = [True, True, True]
    
    action = agent.select_action("test_student", context, valid_mask, 0.5, 0.2, 0.1, 0.0)
    assert 0 <= action < 3

@patch('app.services.linucb.get_supabase')
def test_context_dim_mismatch(mock_supabase):
    agent = LinUCBAgent(n_actions=3, context_dim=16)
    with pytest.raises(IndexError):
        agent.select_action("test_student", np.array([1.0, 0.5]), [True, True, True], 0.5, 0.2, 0.1, 0.0)
