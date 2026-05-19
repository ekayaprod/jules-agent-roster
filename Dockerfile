# 📯 THE SECURE DISPATCH: Optimized Multi-Stage Transit
FROM node:20-alpine AS builder

WORKDIR /opt/payload

# 1. Cache dependency resolution
COPY package*.json ./
RUN npm ci

# 2. Inject source logic and build
COPY . .
RUN npm run build:roster

# 3. Production Serving Layer
FROM node:20-alpine AS production

WORKDIR /opt/payload

# Create a non-root user for execution
RUN addgroup -S dispatch && adduser -S warden -G dispatch

# Install serving dependency globally to prevent runtime npx downloads
RUN npm install -g http-server@14.1.1

# Transfer only the compiled artifacts and required runtime files
COPY --from=builder --chown=warden:dispatch /opt/payload/roster-payload.json ./
COPY --from=builder --chown=warden:dispatch /opt/payload/index.html ./
COPY --from=builder --chown=warden:dispatch /opt/payload/js ./js
COPY --from=builder --chown=warden:dispatch /opt/payload/telemetry.json ./

USER warden
EXPOSE 8080

CMD ["http-server", ".", "-p", "8080"]
