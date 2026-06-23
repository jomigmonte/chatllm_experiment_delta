from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from backend.database import get_db
from backend.models import ChatMessage, Session
from backend.routers.auth import get_current_user
from backend.schemas.sessions import SessionList, SessionMessagesList, SessionOut
from backend.services.titler import TitleGenerationError, generate_title
from backend.models import User


router = APIRouter()


@router.get("/api/sessions", response_model=SessionList)
def list_sessions(
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SessionList:
    sessions = (
        db.query(Session)
        .filter(Session.user_id == current_user.id)
        .order_by(Session.updated_at.desc())
        .all()
    )
    return SessionList(sessions=sessions)


@router.post("/api/sessions", response_model=SessionOut, status_code=201)
def create_session(
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SessionOut:
    session = Session(user_id=current_user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return SessionOut.model_validate(session)


@router.get("/api/sessions/{session_id}", response_model=SessionOut)
def get_session(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SessionOut:
    session = (
        db.query(Session)
        .filter(Session.id == session_id, Session.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada.")
    return SessionOut.model_validate(session)


@router.get("/api/sessions/{session_id}/messages", response_model=SessionMessagesList)
def get_session_messages(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SessionMessagesList:
    session = (
        db.query(Session)
        .filter(Session.id == session_id, Session.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada.")
    msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return SessionMessagesList(
        messages=[{"role": m.role, "content": m.content} for m in msgs]
    )


@router.delete("/api/sessions/{session_id}", status_code=204, response_model=None)
def delete_session(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(Session)
        .filter(Session.id == session_id, Session.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada.")
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.delete(session)
    db.commit()


@router.patch("/api/sessions/{session_id}/title", response_model=SessionOut)
async def auto_title_session(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SessionOut:
    session = (
        db.query(Session)
        .filter(Session.id == session_id, Session.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada.")
    first_user_msg = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id, ChatMessage.role == "user")
        .order_by(ChatMessage.created_at.asc())
        .first()
    )
    if not first_user_msg:
        raise HTTPException(status_code=400, detail="Nenhuma mensagem do usuario para gerar titulo.")
    try:
        title = await generate_title(first_user_msg.content)
    except TitleGenerationError:
        title = first_user_msg.content[:50]
    session.title = title
    db.commit()
    db.refresh(session)
    return SessionOut.model_validate(session)