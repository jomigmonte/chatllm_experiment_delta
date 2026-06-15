#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

PYTHON_BIN=""
if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "Python nao encontrado. Instale Python 3.10+ e tente novamente."
  exit 1
fi

if [ ! -d ".venv" ]; then
  echo "Criando ambiente virtual em .venv"
  "$PYTHON_BIN" -m venv .venv
fi

VENV_PYTHON=".venv/bin/python"
if [ ! -x "$VENV_PYTHON" ]; then
  echo "Falha ao localizar Python do ambiente virtual em $VENV_PYTHON"
  exit 1
fi

echo "Atualizando pip no .venv"
"$VENV_PYTHON" -m pip install --upgrade pip

echo "Instalando dependencias do backend"
"$VENV_PYTHON" -m pip install -r backend/requirements.txt

if [ ! -f ".env" ]; then
  echo "Copie o arquivo .env recebido via e-mail para a raiz do projeto"
fi

if [ "${1:-}" = "run" ]; then
  exec "$VENV_PYTHON" -m uvicorn backend.main:app --reload
fi

echo "Setup concluido."
echo "Para ativar o ambiente: source .venv/bin/activate"
echo "Para rodar a API: .venv/bin/python -m uvicorn backend.main:app --reload"
