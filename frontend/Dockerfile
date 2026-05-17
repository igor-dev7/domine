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

# --- Stage build (compila o bundle estático para produção) ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund
COPY . .
# VITE_API_URL é congelada no bundle em build-time. Em prod usamos path relativo
# para que o browser bata no mesmo host (nginx faz proxy para o backend).
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Stage prod (nginx servindo /dist + proxy para o backend) ---
FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
