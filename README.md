# Althion

Fundação técnica da plataforma de Recuperação e Performance da Agenda para clínicas. A Althion atua exclusivamente na jornada administrativa e não oferece diagnóstico, prescrição, prontuário, triagem ou orientação clínica.

## Estado

Fase 5 — Recovery Engine implementado **sem execução de contato**: regras determinísticas versionadas sobre dados sintéticos do mock, com consentimento, supressão, frequência e decisão humana obrigatória. Fases 1–4 (Fundação, Radar/Score, Portal, Cockpit) implementadas com dados exclusivamente sintéticos. A integração Helena está bloqueada até a entrega da documentação oficial. A validação PostgreSQL/pgTAP (128 assertions) depende de Docker/CI.

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
