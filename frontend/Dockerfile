# --- Stage dev (usado pelo docker-compose.override.yml e como default em desenvolvimento) ---
FROM node:22-alpine AS dev
WORKDIR /app

# Install deps na layer de build — acelera o primeiro start.
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy source (substituído por volume em dev, mas serve de fallback se rodar sem override).
COPY . .

EXPOSE 5173

# Em dev o command é sobrescrito pelo docker-compose.override.yml com um
# `sh -c "npm install … && npm run dev"` que sincroniza deps no startup.
# Sem override (produção), apenas roda o Vite com o que já foi instalado.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
