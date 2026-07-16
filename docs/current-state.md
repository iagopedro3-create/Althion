# Estado atual do repositório

## Resumo executivo

Atualizado em 16 de julho de 2026 após a implementação da Fase 2. O repositório contém a Fundação executável e o primeiro módulo de produto da Althion: Radar manual, Althion Score v1 provisório, recomendações determinísticas, histórico, comparação, relatório e exportação CSV.

A integração Helena permanece intencionalmente bloqueada. Portal amplo, Recovery, Cockpit, Quality, Capacity e Google Ads não foram iniciados. A Fase 2 está em validação porque as migrations e os testes pgTAP ainda dependem de Docker/CI.

## Stack atual

| Camada    | Implementação                                                                   |
| --------- | ------------------------------------------------------------------------------- |
| Workspace | pnpm 11, Node.js 24 e TypeScript 5.9 strict                                     |
| Web       | Next.js 16 App Router, React 19, Tailwind CSS 4, React Hook Form e Supabase SSR |
| API       | NestJS 11 REST, JWT/JWKS, Zod, throttling, Helmet e Pino                        |
| Domínio   | Calculadora determinística e recomendações sem dependência de framework         |
| Dados     | PostgreSQL 17/Supabase, SQL migrations, RPCs transacionais e RLS                |
| Testes    | Vitest, Testing Library, Supertest, Playwright, axe e pgTAP                     |
| CI        | GitHub Actions com secret scan, audit, qualidade, build, E2E e banco            |

## Funcionalidades implementadas

### Fundação

- autenticação, sessão, principal, RBAC, capabilities e RLS deny-by-default;
- Organization → Clinic → Unit, memberships, scopes e assignments;
- auditoria, idempotência, feature flags, health, logs e erros sanitizados;
- `CrmProvider`, mock determinístico e Helena bloqueada sem endpoint inventado.

### Radar e Score

- questionário manual de 7 a 92 dias em três etapas;
- oito razões administrativas com numerador, denominador, fonte e qualidade;
- criação/edição de rascunho e imutabilidade após envio;
- pesos provisórios `15/20/15/15/15/10/5/5` e cobertura mínima de 75%;
- dimensões obrigatórias de velocidade, conversão, continuidade, ocupação e comparecimento;
- `insufficient_data` com nota nula, sem imputar zero ou redistribuir pesos silenciosamente;
- prévia calculada no domínio e snapshot autoritativo calculado no PostgreSQL;
- evidências por componente, input hash, versão da fórmula e snapshots imutáveis;
- recomendações determinísticas priorizadas por contribuição perdida;
- histórico e comparação dos dois períodos mais recentes com alerta de incompatibilidade;
- relatório responsivo/imprimível e CSV auditado com proteção contra formula injection;
- acesso restrito por organização, clínica, papel e assignment;
- nenhum campo clínico, IA, estimativa financeira ou dado real.

## Rotas implementadas

### Web

- `/`, `/entrar`, `/recuperar-acesso`, `/definir-senha`, `/auth/callback`, `/app`;
- `/app/radar`, `/app/radar/novo`;
- `/app/radar/[assessmentId]`, `/editar`, `/relatorio`, `/export.csv`;
- `/app/score`, `/app/score/[scoreId]`.

### API Radar/Score

- `GET|POST /api/v1/organizations/:organizationId/clinics/:clinicId/radar-assessments`;
- `GET|PATCH /api/v1/organizations/:organizationId/clinics/:clinicId/radar-assessments/:assessmentId`;
- `POST .../radar-assessments/:assessmentId/calculate`;
- `POST .../radar-assessments/:assessmentId/submit`;
- `GET .../radar-assessments/:assessmentId/export.csv`;
- `GET .../scores`, `GET .../scores/:scoreId`;
- `GET .../score-comparisons?currentScoreId=&previousScoreId=`.

As rotas fundacionais permanecem documentadas em `docs/architecture/route-map.md`.

## Banco da Fase 2

- `radar_assessments`, `radar_metric_inputs`, `radar_recommendations`;
- `althion_score_formulas`, `althion_score_formula_components`;
- `althion_scores`, `althion_score_components`, `althion_score_evidence`;
- RPCs `create_radar_assessment`, `replace_radar_assessment`, `submit_radar_assessment` e `record_radar_export`;
- policies de leitura de rascunho/concluído, escrita e isolamento;
- triggers de imutabilidade de assessment enviado, snapshots e fórmula publicada.

## Evidências executadas

| Verificação                    | Resultado                                                            |
| ------------------------------ | -------------------------------------------------------------------- |
| Prettier                       | passou em todo o repositório                                         |
| ESLint                         | passou sem warnings                                                  |
| Typecheck                      | passou em todos os workspaces                                        |
| Unit/component/API integration | 25 testes em 9 arquivos passaram                                     |
| Build                          | Next.js e NestJS passaram; 14 rotas Next listadas                    |
| Playwright + axe               | 2 testes Chromium passaram                                           |
| Revisão visual                 | Score verificado em 1440×1366 com dados sintéticos                   |
| pgTAP                          | 15 assertions da Fundação + 22 da Fase 2 versionadas; não executadas |

## Limitações atuais

1. Docker não está disponível; migrations, RPCs, RLS e 37 assertions pgTAP ainda não foram executados.
2. `database.types.ts` continua sendo baseline manual e deve ser regenerado após `db:reset` verde.
3. A fórmula `1.0.0-provisional` está em estado `draft`: pesos e suficiência foram autorizados, mas thresholds de calibração e owner nominal continuam pendentes.
4. Não existe Supabase remoto, staging, domínio ou deployment autorizado.
5. O E2E autenticado completo do Radar depende de um usuário sintético provisionado no Supabase local/CI.
6. A fonte oficial de agenda permanece indefinida; inputs de agenda são manuais e declarados.
7. Helena não possui documentação/sandbox e não realiza chamada alguma.

## Git

Branch atual: `codex/phase-2-radar-score`. Commits anteriores: `43d8b9a` (Fundação) e `c575294` (plano da Fase 2). Nenhum remoto está configurado.
