import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.models.schemas import RegisterRequest, LoginRequest, CodeSubmission
from app.core.dependencies import get_current_user
from pydantic import ValidationError

@pytest.fixture
def override_auth():
    from app.main import app
    async def mock_auth():
        return "mocked-user-id"
    app.dependency_overrides[get_current_user] = mock_auth
    yield
    app.dependency_overrides.clear()

def test_unauthenticated(client):
    res = client.get("/api/problem/next")
    assert res.status_code == 401

@patch("app.routers.problems.supabase")
@patch("app.routers.problems.linucb_agent")
def test_get_next_problem(mock_linucb, mock_supabase, client, override_auth):
    mock_supabase.table.return_value.select.return_value.execute.return_value.data = [
        {"problem_id": "p1", "concept_tag": "basic_syntax", "difficulty_level": "easy"}
    ]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    
    mock_linucb.select_action.return_value = 0
    
    res = client.get("/api/problem/next", headers={"Authorization": "Bearer token"})
    assert res.status_code == 200
    data = res.json()
    assert "problem" in data
    assert data["problem"]["problem_id"] == "p1"
