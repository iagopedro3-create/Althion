# syntax=docker/dockerfile:1
#
# Container portável para a API NestJS (@althion/api) em um monorepo pnpm.
# SCAFFOLD — validar com `docker build` antes de publicar (ver docs/operations/deploy-staging.md).
# Build a partir da RAIZ do repositório:
#   docker build -f apps/api/Dockerfile -t althion-api:staging .

# ---- Base comum ----
FROM node:24.18.0-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /repo

# ---- Builder: instala o subconjunto da API, compila pacotes e API, e "deploya" ----
FROM base AS builder
# Copia o monorepo (o .dockerignore exclui node_modules, dist, .next, etc.)
COPY . .
# Instala apenas a API e suas dependências de workspace (evita next/sharp do web)
RUN pnpm install --frozen-lockfile --filter=@althion/api...
# Compila os pacotes compartilhados e depois a API
RUN pnpm --filter=@althion/domain --filter=@althion/config --filter=@althion/contracts build
RUN pnpm --filter=@althion/api build
# Gera um diretório autocontido com as dependências de PRODUÇÃO + o dist da API
RUN pnpm --filter=@althion/api deploy --prod /app

# ---- Runner: imagem final mínima, sem toolchain de build ----
FROM node:24.18.0-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app
# Usuário não-root
RUN useradd --system --uid 1001 --create-home nodeapp
COPY --from=builder --chown=nodeapp:nodeapp /app ./
USER nodeapp
# API_PORT/API_HOST são injetados por variável de ambiente em runtime (default 4000/0.0.0.0)
EXPOSE 4000
CMD ["node", "dist/main.js"]
