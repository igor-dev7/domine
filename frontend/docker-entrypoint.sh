#!/bin/sh
# Entrypoint do frontend em dev.
# Roda toda vez que o container sobe — não passa por cache de layer do build.
# Mantém o node_modules em sincronia com o package.json/package-lock.json
# que vem do bind mount (host).
set -e

cd /app
echo "[entrypoint] Sincronizando dependências (npm install)…"
npm install --no-audit --no-fund --prefer-offline

echo "[entrypoint] Iniciando $*"
exec "$@"
