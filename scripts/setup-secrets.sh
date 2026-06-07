#!/usr/bin/env bash
# Setup de segredos via 1Password CLI
# Uso: ./scripts/setup-secrets.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v op >/dev/null 2>&1; then
  echo "1Password CLI não encontrado."
  echo "Instale: https://developer.1password.com/docs/cli/get-started/"
  exit 1
fi

echo "Verificando sessão 1Password..."
if ! op whoami >/dev/null 2>&1; then
  echo "Faça login: op signin"
  op signin
fi

if [[ ! -f config.local.op.tpl.js ]]; then
  echo "Arquivo config.local.op.tpl.js não encontrado."
  exit 1
fi

echo "Gerando config.local.js..."
op inject -i config.local.op.tpl.js -o config.local.js -f

echo "config.local.js gerado. Nunca commite este arquivo."
