FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Ganti URL ini dengan URL backend Railway kamu setelah deploy
ARG VITE_API_URL=https://phishguard-backend.up.railway.app
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
