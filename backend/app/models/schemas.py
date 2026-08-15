from pydantic import BaseModel
from typing import Optional

class RegisterRequest(BaseModel):
    email: str
    password: str
    display_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CodeSubmission(BaseModel):
    code: str
    language_id: int 
    problem_id: str
    concept_tag: str
    difficulty_level: str
    session_id: str
    time_on_task_seconds: int
    hint_used: bool
    attempt_count: int

class SessionStart(BaseModel):
    session_number: int = 1

class SessionEnd(BaseModel):
    session_id: str
