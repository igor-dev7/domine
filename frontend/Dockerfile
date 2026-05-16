# --- Stage dev (usado pelo docker-compose.override.yml e como default em desenvolvimento) ---
FROM node:22-alpine AS dev
WORKDIR /app

# Install deps na layer de build — acelera o primeiro start.
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy source (substituído por volume em dev, mas serve de fallback se rodar sem override).
COPY . .

# Entrypoint que SEMPRE roda `npm install` antes do CMD — independe de qualquer
# cache do Docker/Podman. Garante que `node_modules` está em sincronia com
# `package.json` / `package-lock.json` (que vêm do bind mount em dev).
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
