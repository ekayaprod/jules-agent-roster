FROM node:26-alpine AS builder

WORKDIR /opt/payload

COPY scripts/ ./scripts/
COPY prompts/ ./prompts/
RUN node scripts/build-roster.js && rm -rf scripts/

COPY index.html fusion_matrix.json ./
COPY js/ ./js/
COPY css/ ./css/

FROM node:26-alpine AS production

WORKDIR /opt/payload

RUN addgroup -S dispatch && adduser -S warden -G dispatch && \
    npm install -g http-server@14.1.1

COPY --from=builder --chown=warden:dispatch /opt/payload ./

USER warden
EXPOSE 8080

CMD ["http-server", ".", "-p", "8080"]
