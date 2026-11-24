# Multi-stage Monolith: React (Vite) frontend + Node.js Express API for AARADHYA SETU
# Build from repository root: docker build -t aaradhya-setu .

# --- Stage 1: Build Frontend (Vite) ---
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm install --no-audit --no-fund

COPY client/ ./
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Stage 2: Runtime Production Image ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY server/package.json server/package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy server application source
COPY server/src ./src

# Copy built frontend client assets to public/ (served by Express in production)
COPY --from=frontend-build /app/client/dist ./public

EXPOSE 5000
USER node

CMD ["node", "src/server.js"]
