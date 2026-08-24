from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
import uuid as uuid_module

class RegisterRequest(BaseModel):
    email: EmailStr = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    display_name: str = Field(..., max_length=50)

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=128)

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

    @field_validator("problem_id", "session_id")
    @classmethod
    def validate_uuid(cls, v: str) -> str:
        try:
            uuid_module.UUID(v, version=4)
        except ValueError:
            if "temp-session" not in v:
                raise ValueError("Must be a valid UUID")
        return v
        
    @field_validator("difficulty_level")
    @classmethod
    def validate_difficulty(cls, v: str) -> str:
        if v not in ("easy", "medium", "hard"):
            raise ValueError("Must be easy, medium, or hard")
        return v

    @field_validator("concept_tag")
    @classmethod
    def validate_concept(cls, v: str) -> str:
        valid = ['basic_syntax', 'loops', 'arrays', 'strings', 'hashing', 
                 'two_pointers', 'sliding_window', 'recursion', 'backtracking', 
                 'binary_search', 'trees', 'dynamic_programming']
        if v not in valid:
            raise ValueError(f"Must be one of {valid}")
        return v

class CodeCustomSubmission(BaseModel):
    code: str = Field(..., max_length=50000)
    language_id: int
    problem_id: str
    custom_input: str = Field(..., max_length=50000)

    @field_validator("problem_id")
    @classmethod
    def validate_uuid(cls, v: str) -> str:
        try:
            uuid_module.UUID(v, version=4)
        except ValueError:
            raise ValueError("Must be a valid UUID")
        return v

class SessionStart(BaseModel):
    session_number: int = 1

class SessionEnd(BaseModel):
    session_id: str

    @field_validator("session_id")
    @classmethod
    def validate_uuid(cls, v: str) -> str:
        try:
            uuid_module.UUID(v, version=4)
        except ValueError:
            if "temp-session" not in v:
                raise ValueError("Must be a valid UUID")
        return v
