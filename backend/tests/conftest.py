import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
import os
import sys

# Add backend directory to sys.path so we can import from it
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app

@pytest.fixture
def client():
    # Mocking the Supabase client inside main.py for API tests
    # is complex, so we will use TestClient and mock specific parts in test_api.py
    return TestClient(app)

@pytest.fixture
def mock_supabase():
    mock = MagicMock()
    return mock
