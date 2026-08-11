import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

@pytest.fixture
def override_auth():
    from main import app, get_current_user
    async def mock_auth():
        return "mocked-user-id"
    app.dependency_overrides[get_current_user] = mock_auth
    yield
    app.dependency_overrides.clear()

def test_unauthenticated(client):
    res = client.get("/api/problem/next")
    assert res.status_code == 401

def test_get_next_problem(client, override_auth):
    with patch("main.supabase.table") as mock_table:
        mock_table.return_value.select.return_value.execute.return_value.data = [
            {"problem_id": "p1", "concept_tag": "basic_syntax", "difficulty_level": "easy"}
        ]
        mock_table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        
        res = client.get("/api/problem/next", headers={"Authorization": "Bearer token"})
        assert res.status_code == 200
        data = res.json()
        assert "problem" in data
        assert data["problem"]["problem_id"] == "p1"

def test_mastery(client, override_auth):
    with patch("main.supabase.table") as mock_table:
        mock_table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        
        res = client.get("/api/mastery", headers={"Authorization": "Bearer token"})
        assert res.status_code == 200
        data = res.json()
        assert "data" in data
        assert len(data["data"]) == 12

def test_history(client, override_auth):
    with patch("main.supabase.table") as mock_table:
        mock_table.return_value.select.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value.data = []
        
        res = client.get("/api/history", headers={"Authorization": "Bearer token"})
        assert res.status_code == 200
        data = res.json()
        assert "data" in data
        assert isinstance(data["data"], list)

def test_stats(client, override_auth):
    with patch("main.supabase.table") as mock_table:
        mock_table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        mock_table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
        mock_table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = []
        
        res = client.get("/api/stats", headers={"Authorization": "Bearer token"})
        assert res.status_code == 200
        data = res.json()
        assert "data" in data
        assert "total_problems_solved" in data["data"]
