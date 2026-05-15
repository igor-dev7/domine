FROM node:22-alpine
WORKDIR /app

# Install deps (cached layer)
COPY package*.json ./
RUN npm ci || npm install

# Copy source
COPY . .

EXPOSE 5173
# Vite dev server precisa de --host para escutar fora do container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
