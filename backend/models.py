from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# ── User schemas ────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[str] = None


class UserCreate(UserBase):
    google_id: str


class UserResponse(UserBase):
    id: int
    google_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── ChatMessage schemas ─────────────────────────────────

class ChatMessageCreate(BaseModel):
    role: str  # 'user' or 'assistant'
    content: Optional[str] = None
    data: Optional[Any] = None


class ChatMessageResponse(BaseModel):
    id: int
    session_id: str
    role: str
    content: Optional[str] = None
    data: Optional[Any] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── ChatSession schemas ─────────────────────────────────

class ChatSessionCreate(BaseModel):
    id: Optional[str] = None  # allow frontend to provide the UUID
    title: Optional[str] = "New Chat"


class ChatSessionResponse(BaseModel):
    id: str
    user_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ChatSessionDetail(ChatSessionResponse):
    """Session with all messages included"""
    messages: List[ChatMessageResponse] = []
