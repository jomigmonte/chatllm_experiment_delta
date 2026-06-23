from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session as DBSession

from backend.database import get_db
from backend.models import User
from backend.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from backend.services.auth import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


router = APIRouter()


def get_current_user(
    authorization: str = Header(...), db: DBSession = Depends(get_db)
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token invalido.")
    token = authorization[7:]
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Token invalido ou expirado.")
    user_id = int(payload.get("sub", "0"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario nao encontrado.")
    return user


@router.post("/api/auth/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest, db: DBSession = Depends(get_db)) -> AuthResponse:
    if len(payload.email) < 5 or "@" not in payload.email:
        raise HTTPException(status_code=422, detail="Email invalido.")
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email ja cadastrado.")
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.email)
    return AuthResponse(token=token, user_id=user.id, email=user.email)


@router.post("/api/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: DBSession = Depends(get_db)) -> AuthResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos.")
    token = create_access_token(user.id, user.email)
    return AuthResponse(token=token, user_id=user.id, email=user.email)


@router.post("/api/auth/logout", status_code=204, response_model=None)
def logout(current_user: User = Depends(get_current_user)):
    return


@router.get("/api/auth/me", response_model=AuthResponse)
def me(current_user: User = Depends(get_current_user)) -> AuthResponse:
    return AuthResponse(
        token="", user_id=current_user.id, email=current_user.email
    )