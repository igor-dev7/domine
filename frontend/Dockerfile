# --- Stage dev (usado pelo docker-compose.override.yml e como default em desenvolvimento) ---
FROM node:22-alpine AS dev
WORKDIR /app

# Install deps na camada de build (cached enquanto package*.json não muda).
COPY package*.json ./
RUN npm ci || npm install

# Copy source (substituído por volume em dev, mas serve de fallback se rodar sem override).
COPY . .

EXPOSE 5173

# Em dev o /app/node_modules é um volume anônimo persistente entre rebuilds.
# Se alguém faz `git pull` com novas dependências, o cache da layer 4 não é
# invalidado para o volume — então rodamos `npm install` aqui também: ele é
# idempotente (no-op quando node_modules já casa com package-lock) e sincroniza
# as deps que faltarem sem precisar de um `compose down -v`.
CMD ["sh", "-c", "npm install --no-audit --no-fund --prefer-offline && npm run dev -- --host 0.0.0.0"]
