from pydantic import BaseModel, Field
from typing import Optional

class RegisterRequest(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., max_length=128)
    display_name: str = Field(..., max_length=50)

class LoginRequest(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., max_length=128)

class CodeSubmission(BaseModel):
    code: str = Field(..., max_length=50000)
    language_id: int 
    problem_id: str
    concept_tag: str
    difficulty_level: str
    session_id: str
    time_on_task_seconds: int
    hint_used: bool
    attempt_count: int

class CodeCustomSubmission(BaseModel):
    code: str = Field(..., max_length=50000)
    language_id: int
    problem_id: str
    custom_input: str = Field(..., max_length=50000)

class SessionStart(BaseModel):
    session_number: int = 1

class SessionEnd(BaseModel):
    session_id: str
