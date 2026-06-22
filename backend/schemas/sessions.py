from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class SessionOut(BaseModel):
    id: int
    title: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SessionList(BaseModel):
    sessions: list[SessionOut]


class SessionCreate(BaseModel):
    title: str | None = None


class SessionMessagesRequest(BaseModel):
    session_id: int


class SessionMessagesOut(BaseModel):
    role: str
    content: str


class SessionMessagesList(BaseModel):
    messages: list[SessionMessagesOut]