# Estado atual do repositório

## Resumo executivo

Atualizado em 19 de julho de 2026. O repositório contém Fundação, Radar/Score, Portal do Cliente, Cockpit, Recovery sem execução, Quality assistido, Google Ads em sandbox sintético e o site institucional redesenhado.

A Helena opera em paralelo como motor operacional; a integração de dados Althion↔Helena é opcional, desligada por padrão e não bloqueia o roadmap. A agenda é operada externamente por cliente (sistema próprio, Google Agenda etc.) e integrada via Helena; a Althion não mantém fonte de agenda própria. Capacity não foi implementado como engine real; suas visualizações públicas são apenas demonstrações identificadas. Google Ads ainda não chama a API do Google e rejeita credenciais reais; os segredos sintéticos foram isolados em schema privado. Todos os módulos de banco continuam condicionados à execução das migrations e dos 153 testes pgTAP em Docker/CI.

## Stack atual

| Camada    | Implementação                                                                             |
| --------- | ----------------------------------------------------------------------------------------- |
| Workspace | pnpm 11, Node.js 24 e TypeScript 5.9 strict                                               |
| Web       | Next.js 16 App Router, React 19, Tailwind CSS 4, React Hook Form, Recharts e Supabase SSR |
| API       | NestJS 11 REST, JWT/JWKS, Zod, throttling, Helmet e Pino                                  |
| Domínio   | Calculadora determinística e recomendações sem dependência de framework                   |
| Dados     | PostgreSQL 17/Supabase, SQL migrations, RPCs transacionais e RLS                          |
| Testes    | Vitest, Testing Library, Supertest, Playwright, axe e pgTAP                               |
| CI        | GitHub Actions com secret scan, audit, qualidade, build, E2E e banco                      |

## Funcionalidades implementadas

### Fundação

- autenticação, sessão, principal, RBAC, capabilities e RLS deny-by-default;
- Organization → Clinic → Unit, memberships, scopes e assignments;
- auditoria, idempotência, feature flags, health, logs e erros sanitizados;
- `CrmProvider`, mock determinístico e `HelenaCrmProvider` como integração de dados opcional/desligada, sem endpoint inventado.

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

### Portal do Cliente

- dashboard orientado a problemas, oportunidades e próximas ações por clínica;
- Score com suficiência, cobertura, fórmula, histórico e tabela equivalente ao gráfico;
- recomendações priorizadas somente a partir do Radar, sem antecipar Recovery;
- solicitações e planos/tarefas com estados determinísticos, idempotência e histórico;
- Especialista exibido somente com assignment ativo;
- relatórios, integrações e configurações com fonte/freshness explícitas;
- feature flag `portal.client.v1` desabilitada por padrão;
- RBAC e RLS específicos para owner, manager, doctor, viewer, operator e Especialista;
- nenhum dado clínico, contato automatizado, agenda recuperada ou impacto financeiro fictício.

## Rotas implementadas

### Web

- `/`, `/entrar`, `/recuperar-acesso`, `/definir-senha`, `/auth/callback`, `/app`;
- `/app/radar`, `/app/radar/novo`;
- `/app/radar/[assessmentId]`, `/editar`, `/relatorio`, `/export.csv`;
- `/app/score`, `/app/score/[scoreId]`.
- `/app/indicadores`, `/app/oportunidades`, `/app/relatorios`;
- `/app/solicitacoes`, `/app/solicitacoes/[requestId]`;
- `/app/plano-de-melhoria`, `/app/especialista`;
- `/app/integracoes`, `/app/configuracoes`.

### API Radar/Score

- `GET|POST /api/v1/organizations/:organizationId/clinics/:clinicId/radar-assessments`;
- `GET|PATCH /api/v1/organizations/:organizationId/clinics/:clinicId/radar-assessments/:assessmentId`;
- `POST .../radar-assessments/:assessmentId/calculate`;
- `POST .../radar-assessments/:assessmentId/submit`;
- `GET .../radar-assessments/:assessmentId/export.csv`;
- `GET .../scores`, `GET .../scores/:scoreId`;
- `GET .../score-comparisons?currentScoreId=&previousScoreId=`.

As rotas fundacionais permanecem documentadas em `docs/architecture/route-map.md`.

### API Portal

- `GET .../portal/dashboard|indicators|opportunities|specialist|people`;
- `GET|POST .../requests`, `GET .../requests/:requestId`;
- `POST .../requests/:requestId/transitions`;
- `GET .../improvement-plans/current`, `POST .../improvement-plans`;
- `POST .../improvement-plans/:planId/transitions|tasks`;
- `POST .../tasks/:taskId/transitions`.

## Banco da Fase 2

- `radar_assessments`, `radar_metric_inputs`, `radar_recommendations`;
- `althion_score_formulas`, `althion_score_formula_components`;
- `althion_scores`, `althion_score_components`, `althion_score_evidence`;
- RPCs `create_radar_assessment`, `replace_radar_assessment`, `submit_radar_assessment` e `record_radar_export`;
- policies de leitura de rascunho/concluído, escrita e isolamento;
- triggers de imutabilidade de assessment enviado, snapshots e fórmula publicada.

## Banco da Fase 3

- `requests`, `request_status_history`;
- `improvement_plans`, `improvement_plan_status_history`;
- `tasks`, `task_status_history`;
- RPCs de criação/transição idempotentes e auditadas;
- FKs compostas, históricos append-only e um plano ativo por clínica;
- policies de leitura por papel/assignment; mutations somente por RPC.

## Evidências executadas

| Verificação                    | Resultado                                                 |
| ------------------------------ | --------------------------------------------------------- |
| Prettier                       | passou em todo o repositório                              |
| ESLint                         | passou sem warnings                                       |
| Typecheck                      | passou em todos os workspaces                             |
| Unit/component/API integration | 105 testes em 27 arquivos passaram                        |
| Build                          | Next.js e NestJS passaram; 37 rotas compiladas            |
| Playwright + axe               | 15 testes Chromium passaram                               |
| Acessibilidade pública         | zero violações críticas/sérias nas seis rotas verificadas |
| pgTAP                          | 153 assertions versionadas; não executadas                |

## Limitações atuais

1. Docker não está disponível; migrations, RPCs, RLS e 153 assertions pgTAP ainda não foram executados.
2. `database.types.ts` continua sendo baseline manual e deve ser regenerado após `db:reset` verde.
3. A fórmula `1.0.0-provisional` está em estado `draft`: pesos e suficiência foram autorizados, mas thresholds de calibração e owner nominal continuam pendentes.
4. O projeto Supabase remoto `yzbmmkyhsjkrdjknspnv` existe, mas ainda não recebeu as migrations; staging, domínio e deployment continuam pendentes.
5. O E2E autenticado completo do Radar e Portal depende de usuários sintéticos provisionados no Supabase local/CI.
6. A agenda é operada externamente por cliente (sistema próprio, Google Agenda etc.) e integrada via Helena; enquanto a integração de dados opcional não é ligada, os inputs de agenda na Althion são manuais/sintéticos e declarados.
7. A integração de dados Helena não possui documentação/sandbox oficiais e não realiza chamada alguma; a Helena opera em paralelo por conta própria.
8. Google Ads usa campanhas, métricas e atribuição sintéticas; tokens ficam fora do schema público e somente valores `mock_` são aceitos. OAuth/API e um cofre de produção ainda não existem.
9. Os formulários públicos não encaminham leads: destino, antiabuso, base legal e retenção seguem pendentes.

## Git

Branch atual: `codex/landing-redesign`. O remoto `origin` aponta para `iagopedro3-create/althion`.

## Atualização — Fase 4 (17/07/2026)

Cockpit do Especialista implementado no branch `codex/phase-4-cockpit`: domínio explicável em `packages/domain/src/cockpit` (SLA, saúde, capacidade, próxima ação, política `1.0.0-provisional`), tabelas `account_incidents`/`account_meetings` com históricos append-only e RLS exclusivo de Especialista/platform_admin, API em `/api/v1/cockpit/*` e `/incidents`/`/meetings`, e web em `/cockpit`. Papéis do cliente não acessam o Cockpit. Validação PostgreSQL/pgTAP (100 assertions das Fases 1–4) segue pendente de Docker/CI. Detalhes: `docs/releases/phase-4.md`.

## Atualização — Fase 5 (17/07/2026)

Recovery Engine implementado no branch `codex/phase-5-recovery`, **sem execução de contato**: domínio em `packages/domain/src/recovery` (política `1.0.0-provisional`, regras `lead_no_response` e `attended_no_booking`, governança de consentimento/supressão/frequência), tabelas `recovery_*` com históricos append-only e RLS por papel, RPCs que revalidam a governança no banco, API em `/api/v1/.../recovery/*` e web em `/cockpit/recovery`. Fonte de leads exclusivamente o `MockCrmProvider`; a Helena opera em paralelo e sua integração de dados é opcional. Validação pgTAP (128 assertions das Fases 1–5) pendente de Docker/CI. Detalhes: `docs/releases/phase-5.md`.

## Atualização — Quality, Google Ads e site (19/07/2026)

Quality assistido foi implementado com rubricas versionadas, revisão humana e handoff clínico. Google Ads possui schema, API, telas e atribuição apenas para sandbox sintético; tokens foram removidos da tabela pública, isolados em `app_private` e limitados a valores `mock_`. OAuth/API real e um cofre de produção continuam obrigatórios antes de qualquer uso real. O site institucional e `/diagnostico` foram redesenhados; o E2E público passa com verificações axe, e o formulário não persiste PII nem encaminha dados enquanto destino e base legal não forem aprovados.
