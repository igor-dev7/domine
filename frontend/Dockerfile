# --- Stage dev (usado pelo docker-compose.override.yml e como default em desenvolvimento) ---
FROM node:22-alpine AS dev
WORKDIR /app

# Install deps (cached layer)
COPY package*.json ./
RUN npm ci || npm install

# Copy source (substituído por volume em dev, mas serve de fallback se rodar sem override)
COPY . .

EXPOSE 5173
# Vite dev server precisa de --host para escutar fora do container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
