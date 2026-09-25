# 📯 THE SECURE DISPATCH: Optimized Multi-Stage Transit
FROM node:26-alpine AS builder

WORKDIR /opt/payload

COPY scripts/ ./scripts/
COPY prompts/ ./prompts/
RUN node scripts/build-roster.js

FROM node:26-alpine AS production

WORKDIR /opt/payload

# ⚙️ COLLAPSE: Centrifuged environment setup into a highly dense chained command.
RUN addgroup -S dispatch && adduser -S warden -G dispatch && \
    npm install -g http-server@14.1.1

COPY --chown=warden:dispatch index.html fusion_matrix.json ./
COPY --chown=warden:dispatch js/ ./js/
COPY --chown=warden:dispatch css/ ./css/
COPY --chown=warden:dispatch prompts/ ./prompts/
COPY --from=builder --chown=warden:dispatch /opt/payload/roster-payload.json ./

USER warden
EXPOSE 8080

CMD ["http-server", ".", "-p", "8080"]
