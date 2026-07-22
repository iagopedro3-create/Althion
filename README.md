# Althion

Fundação técnica da plataforma de Recuperação e Performance da Agenda para clínicas. A Althion atua exclusivamente na jornada administrativa e não oferece diagnóstico, prescrição, prontuário, triagem ou orientação clínica.

## Estado

Fundação, Radar/Score, Portal, Cockpit e Recovery implementados com dados sintéticos; Recovery permanece **sem execução de contato**. Quality está implementado em modo assistido e Google Ads em sandbox sintético, com segredos isolados do schema público e credenciais reais rejeitadas. A landing pública foi redesenhada, mas os canais de contato continuam desligados até a definição jurídica e operacional. A Helena opera **em paralelo** como motor operacional (WhatsApp, Instagram, webhooks, agentes e supervisor de IA); a Althion funciona ao lado dela e a integração de dados Althion↔Helena é **opcional**, desligada por padrão e não bloqueia o roadmap. A validação PostgreSQL/pgTAP (153 assertions) depende de Docker/CI.

## Requisitos

- Node.js 24.x
- Corepack e pnpm 11.x
- Docker Desktop ou runtime compatível para Supabase local

## Início rápido

```bash
corepack enable
pnpm install --frozen-lockfile
copy .env.example .env.local
pnpm db:start
pnpm db:reset
pnpm dev:api
pnpm dev:web
```

No Windows com ExecutionPolicy restritiva, use `pnpm` em vez do wrapper PowerShell do npm.

## Qualidade

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:db
pnpm test:e2e
```

Consulte [a configuração local](./docs/development/local-setup.md) e o [plano de implementação](./IMPLEMENTATION_PLAN.md).
