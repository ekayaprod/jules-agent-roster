# 📯 THE SECURE DISPATCH: Optimized Multi-Stage Transit
FROM node:20-alpine AS builder

WORKDIR /opt/payload

# 1. Inject source logic and build
COPY scripts/ ./scripts/
COPY prompts/ ./prompts/
RUN node scripts/build-roster.js

# 2. Production Serving Layer
FROM node:20-alpine AS production

WORKDIR /opt/payload

# Create a non-root user for execution
RUN addgroup -S dispatch && adduser -S warden -G dispatch

# Install serving dependency globally to prevent runtime npx downloads
RUN npm install -g http-server@14.1.1

# Transfer only the compiled artifacts and required runtime files
COPY --from=builder --chown=warden:dispatch /opt/payload/roster-payload.json ./
COPY --chown=warden:dispatch index.html ./
COPY --chown=warden:dispatch js ./js
COPY --chown=warden:dispatch css ./css
COPY --chown=warden:dispatch fusion_matrix.json ./
COPY --chown=warden:dispatch prompts/ ./prompts/

USER warden
EXPOSE 8080

CMD ["http-server", ".", "-p", "8080"]
