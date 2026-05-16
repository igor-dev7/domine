# --- Stage dev (usado pelo docker-compose.override.yml e como default em desenvolvimento) ---
FROM node:22-alpine AS dev
WORKDIR /app

# Install deps: a layer só revalida quando package.json ou package-lock.json muda.
# Usamos `npm install` (em vez de `npm ci`) pra que ele atualize o lock se algum
# colaborador commitou só o package.json — comum quando se adiciona deps via
# `npm i <pkg>` mas o lock não foi commitado direito.
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy source (substituído por volume em dev, mas serve de fallback se rodar sem override).
COPY . .

EXPOSE 5173

# CMD com safety net: roda npm install antes do Vite. Quando o node_modules já
# casa com o package-lock (caso comum, vindo da layer acima), é praticamente
# instantâneo. Quando o colaborador puxou novas deps mas a cache do Podman/
# Docker reaproveitou layers antigas, o `npm install` cobre o gap e instala
# o que faltar — sem precisar `compose down -v` ou `--no-cache`.
CMD ["sh", "-c", "npm install --no-audit --no-fund --prefer-offline && npm run dev -- --host 0.0.0.0"]
