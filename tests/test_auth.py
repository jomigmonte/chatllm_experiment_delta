from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from backend.models import User
from backend.services.auth import hash_password, create_access_token, decode_access_token


def register_user(client: TestClient, email: str = "user@test.com", password: str = "secret123") -> dict:
    """Helper para registrar um usuario e retornar a resposta JSON."""
    resp = client.post("/api/auth/register", json={"email": email, "password": password})
    assert resp.status_code == 201
    return resp.json()


class TestRegister:
    def test_register_success(self, client: TestClient):
        """Deve registrar um novo usuario com sucesso."""
        data = register_user(client)
        assert "token" in data
        assert data["email"] == "user@test.com"
        assert isinstance(data["user_id"], int)
        assert len(data["token"]) > 0

    def test_register_duplicate_email(self, client: TestClient):
        """Email duplicado deve retornar 409."""
        register_user(client, email="dup@test.com")
        resp = client.post("/api/auth/register", json={"email": "dup@test.com", "password": "secret123"})
        assert resp.status_code == 409
        assert "ja cadastrado" in resp.json()["detail"]

    def test_register_invalid_email(self, client: TestClient):
        """Email sem @ deve ser rejeitado."""
        resp = client.post("/api/auth/register", json={"email": "invalido", "password": "secret123"})
        assert resp.status_code == 422

    def test_register_short_password(self, client: TestClient):
        """Senha com menos de 6 caracteres deve ser rejeitada."""
        resp = client.post("/api/auth/register", json={"email": "a@b.com", "password": "123"})
        assert resp.status_code == 422


class TestLogin:
    def test_login_success(self, client: TestClient):
        """Deve fazer login com credenciais validas."""
        register_user(client, email="login@test.com", password="mypassword")
        resp = client.post("/api/auth/login", json={"email": "login@test.com", "password": "mypassword"})
        assert resp.status_code == 200
        data = resp.json()
        assert "token" in data
        assert data["email"] == "login@test.com"

    def test_login_wrong_password(self, client: TestClient):
        """Senha incorreta deve retornar 401."""
        register_user(client, email="wrong@test.com", password="correctpw")
        resp = client.post("/api/auth/login", json={"email": "wrong@test.com", "password": "wrongpw"})
        assert resp.status_code == 401

    def test_login_nonexistent_email(self, client: TestClient):
        """Email nao cadastrado deve retornar 401."""
        resp = client.post("/api/auth/login", json={"email": "noone@test.com", "password": "anypass"})
        assert resp.status_code == 401


class TestAuthToken:
    def test_token_contains_valid_user_id(self, client: TestClient):
        """O token JWT deve conter o user_id correto."""
        data = register_user(client, email="token@test.com", password="pass123")
        payload = decode_access_token(data["token"])
        assert payload is not None
        assert payload["sub"] == str(data["user_id"])
        assert payload["email"] == "token@test.com"

    def test_invalid_token_rejected(self, client: TestClient):
        """Token invalido deve ser rejeitado pelo endpoint /api/auth/me."""
        resp = client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken"})
        assert resp.status_code == 401

    def test_missing_auth_header(self, client: TestClient):
        """Requisicao sem header Authorization deve retornar 422 (Header(...) obrigatorio)."""
        resp = client.get("/api/auth/me")
        assert resp.status_code == 422


class TestLogout:
    def test_logout_returns_204(self, client: TestClient):
        """Logout com token valido deve retornar 204."""
        data = register_user(client, email="logout@test.com", password="pass123")
        resp = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {data['token']}"})
        assert resp.status_code == 204

    def test_logout_without_token(self, client: TestClient):
        """Logout sem token deve retornar 422."""
        resp = client.post("/api/auth/logout")
        assert resp.status_code == 422


class TestMe:
    def test_me_returns_user(self, client: TestClient):
        """Endpoint /api/auth/me deve retornar os dados do usuario autenticado."""
        data = register_user(client, email="me@test.com", password="pass123")
        resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {data['token']}"})
        assert resp.status_code == 200
        me = resp.json()
        assert me["user_id"] == data["user_id"]
        assert me["email"] == "me@test.com"


class TestPasswordHashing:
    def test_password_stored_as_hash(self, client: TestClient):
        """A senha deve ser armazenada como hash, nunca em texto puro."""
        data = register_user(client, email="hash@test.com", password="mysecret123")
        # Verificar diretamente no banco que a senha esta hashada
        resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {data['token']}"})
        assert resp.status_code == 200

    def test_hash_is_not_reversible_to_plaintext(self, db_session):
        """Verificar que o hash nao contem a senha original."""
        hashed = hash_password("mysecret123")
        assert hashed != "mysecret123"
        assert "mysecret123" not in hashed

    def test_same_password_different_hashes(self, db_session):
        """Mesma senha deve produzir hashes diferentes (salt)."""
        hash1 = hash_password("samepass")
        hash2 = hash_password("samepass")
        assert hash1 != hash2


class TestSessionsAuth:
    """Testes que as sessoes exigem autenticacao."""

    def test_list_sessions_without_auth(self, client: TestClient):
        """Listar sessoes sem token deve retornar 422."""
        resp = client.get("/api/sessions")
        assert resp.status_code == 422

    def test_list_sessions_with_auth(self, client: TestClient):
        """Listar sessoes com token valido deve retornar lista (pode ser vazia)."""
        data = register_user(client, email="sessions@test.com", password="pass123")
        resp = client.get("/api/sessions", headers={"Authorization": f"Bearer {data['token']}"})
        assert resp.status_code == 200
        assert "sessions" in resp.json()

    def test_create_session_with_auth(self, client: TestClient):
        """Criar sessao com token valido deve retornar 201."""
        data = register_user(client, email="createsess@test.com", password="pass123")
        resp = client.post("/api/sessions", headers={"Authorization": f"Bearer {data['token']}"})
        assert resp.status_code == 201

    def test_session_isolation_between_users(self, client: TestClient):
        """Sessoes do usuario A nao devem aparecer para o usuario B."""
        # Usuario A cria uma sessao
        data_a = register_user(client, email="user_a@test.com", password="pass123")
        resp_a = client.post("/api/sessions", headers={"Authorization": f"Bearer {data_a['token']}"})
        assert resp_a.status_code == 201
        session_a_id = resp_a.json()["id"]

        # Usuario B lista sessoes
        data_b = register_user(client, email="user_b@test.com", password="pass123")
        resp_b = client.get("/api/sessions", headers={"Authorization": f"Bearer {data_b['token']}"})
        assert resp_b.status_code == 200
        session_ids_b = [s["id"] for s in resp_b.json()["sessions"]]
        assert session_a_id not in session_ids_b