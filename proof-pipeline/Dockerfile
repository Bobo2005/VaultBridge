# Production Dockerfile for VaultBridge Proof Pipeline API (Render Web Service)
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code and demo scripts
COPY src/ ./src/
COPY demo_walkthrough.ts ./

# Compile TypeScript to JavaScript in /app/dist
RUN npm run build

# Production runtime stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 4000

# Health check probing /health
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "dist/src/index.js"]
