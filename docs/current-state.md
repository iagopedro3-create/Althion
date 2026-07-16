# Estado atual do repositório

## Resumo executivo

Atualizado em 16 de julho de 2026 após a implementação da Fase 1. O repositório começou vazio, sem commits ou remoto, e agora contém a Fundação executável da Althion: monorepo TypeScript, web Next.js, API NestJS, schema Supabase/PostgreSQL, autenticação, autorização em profundidade, auditoria, feature flags e camada CRM substituível.

A integração Helena permanece intencionalmente bloqueada. O planejamento detalhado de Radar e Score foi criado, mas nenhum código de produto da Fase 2 foi iniciado. Portal funcional, Recovery, Quality, Capacity e Google Ads não foram iniciados.

## Stack atual

| Camada    | Implementação                                                        |
| --------- | -------------------------------------------------------------------- |
| Workspace | pnpm 11 workspaces, Node.js 24, TypeScript 5.9 strict                |
| Web       | Next.js 16 App Router, React 19, Tailwind CSS 4, Supabase SSR        |
| API       | NestJS 11 REST, JWT/JWKS, Zod, throttling, Helmet e Pino             |
| Dados     | PostgreSQL 17 via Supabase CLI, migrations SQL e RLS                 |
| Testes    | Vitest, Testing Library, Supertest, Playwright e pgTAP               |
| CI        | GitHub Actions com secret scan, audit, qualidade, build, E2E e banco |

Versões ficam fixadas no `pnpm-lock.yaml`. Um override de PostCSS 8.5.19 corrige o advisory transitivo detectado na auditoria.

## Arquitetura implementada

```text
apps/
  web/          Next.js, autenticação SSR e shell fundacional
  api/          NestJS modular monolith
packages/
  config/       validação compartilhada de configuração
  contracts/    DTOs Zod e tipos do banco
  domain/       autorização e contrato CRM canônico
  testing/      builders e IDs sintéticos
supabase/
  migrations/   schema fundacional e RLS/RPCs
  tests/        pgTAP de isolamento
  seed.sql      apenas dados sintéticos
```

## Funcionalidades implementadas

- login por e-mail/senha, callback PKCE, recuperação, redefinição e logout;
- cadastro público desabilitado e política local de senha com 12 caracteres;
- Proxy do Next.js para refresh/redirect otimista, sem tratar isso como autorização final;
- JWT Supabase validado na API por JWKS, issuer e audience;
- principal resolvido a partir de profile, memberships, scopes, papéis de plataforma e assignments;
- capabilities na API e RLS deny-by-default no banco;
- hierarchy Organization → Clinic → Unit e vínculos profissionais;
- RPCs atômicas de concessão/revogação de membership com idempotência e auditoria;
- proteção do último `organization_owner`;
- feature flags globais com overrides por tenant;
- listagem autorizada de organizações, clínicas, memberships, flags, auditoria e integrações;
- health endpoints, correlation ID, erros sanitizados, rate limiting, headers e logs com redaction;
- `CrmProvider`, `MockCrmProvider`, `HelenaCrmProvider` bloqueado e `FutureCrmProvider`;
- home e shell autenticado com loading, vazio, indisponibilidade e acesso negado;
- CI versionado e ações de terceiros fixadas por commit SHA.

## Rotas implementadas

### Web

- `/`
- `/entrar`
- `/recuperar-acesso`
- `/definir-senha`
- `/auth/callback`
- `/app`

### API

- `GET /health/live`
- `GET /health/ready`
- `GET /api/v1/me`
- `GET /api/v1/organizations/:organizationId`
- `GET /api/v1/organizations/:organizationId/clinics`
- `GET|POST /api/v1/organizations/:organizationId/memberships`
- `PATCH /api/v1/organizations/:organizationId/memberships/:membershipId/revoke`
- `GET /api/v1/organizations/:organizationId/feature-flags`
- `GET /api/v1/organizations/:organizationId/audit-logs`
- `GET /api/v1/organizations/:organizationId/integrations`

## Banco implementado na Fase 1

- `organizations`, `clinics`, `units`;
- `profiles`, `memberships`, `membership_scopes`, `platform_roles`;
- `professionals`, `professional_units`, `services`;
- `relationship_specialists`, `relationship_assignments`;
- `feature_flags`, `feature_flag_overrides`;
- `integrations`, `audit_logs`, `idempotency_records`.

As tabelas de Radar, Score e engines continuam apenas no modelo lógico e serão criadas por migrations das fases correspondentes.

## Evidências executadas

| Verificação                    | Resultado                                       |
| ------------------------------ | ----------------------------------------------- |
| Formatação                     | Passou                                          |
| ESLint                         | Passou sem warnings                             |
| Typecheck                      | Passou em todos os workspaces                   |
| Unit/component/API integration | 11 testes passaram                              |
| Build                          | Next.js e NestJS passaram                       |
| Playwright                     | 2 testes Chromium passaram                      |
| Auditoria de dependências      | Nenhuma vulnerabilidade conhecida após override |
| Revisão visual                 | Home verificada em 1440×1000                    |
| Supabase CLI                   | Instalada no projeto, versão 2.109.1            |
| Migrations/pgTAP local         | Não executado: daemon Docker ausente            |

## Limitações atuais

1. O runtime Docker não está disponível; migrations e 15 testes pgTAP estão versionados, mas dependem do job CI ou de máquina com Docker.
2. `database.types.ts` é um baseline manual tipado e deve ser regenerado pela CLI após a primeira execução local do schema.
3. Não existe projeto Supabase remoto, staging, domínio ou deployment autorizado.
4. Provisionamento do primeiro owner/platform admin ainda é administrativo; não há cadastro público.
5. MFA TOTP está habilitado localmente, mas a UX/política obrigatória precisa ser concluída antes de produção.
6. Helena não possui documentação/sandbox e não realiza qualquer chamada.
7. A fonte oficial de agenda permanece indefinida.

## Riscos remanescentes

| Risco                                        | Estado/mitigação                                |
| -------------------------------------------- | ----------------------------------------------- |
| Policies SQL ainda não executadas neste host | CI database obrigatório antes de merge/staging  |
| Tipos manuais divergirem do schema           | regenerar e revisar após `db reset` verde       |
| Provisionamento privilegiado                 | criar runbook/command separado antes de staging |
| Service role                                 | não usada em request comum e ausente do web     |
| Helena                                       | adapter bloqueado sem URL ou payload fictício   |
| Conteúdo clínico                             | sem campos, corpo de mensagem, OCR, anexo ou IA |
| Agenda                                       | módulos dependentes continuam bloqueados        |

## Git

O repositório está na branch `codex/phase-1-foundation`. A Fundação foi registrada no commit `43d8b9a`; nenhum remoto está configurado. O planejamento da Fase 2 é mantido em commit documental separado da implementação.
