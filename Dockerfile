# NOVA RESCUE - Minimal Production Container for Google Cloud Run
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies for building frontend
COPY package*.json ./
RUN npm install

# Build static frontend bundle
COPY . .
RUN npm run build

# Production runner stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Native Node.js HTTP server has zero runtime external dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/dist ./dist

EXPOSE 8080

# Google Cloud Run default entrypoint
CMD ["node", "server.js"]
