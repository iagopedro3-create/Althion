# Plano detalhado da Fase 4 — Cockpit do Especialista

## Estado e gate

Planejamento e execução iniciados em 17 de julho de 2026 sob a autorização de avanço contínuo concedida pelo usuário. Os gates de banco das Fases 1–3 (Docker/CI, 73 assertions pgTAP, regeneração de tipos) permanecem pendentes por indisponibilidade de Docker neste host; a Fase 4 segue o mesmo regime das anteriores: código, testes puros, build e evidências locais verdes, com validação PostgreSQL adiada para Docker/CI e listada como limitação em `docs/releases/phase-4.md`.

A feature flag da fase é `cockpit.specialist.v1`, desativada por padrão e habilitada apenas no seed sintético local.

## Objetivo

Dar ao Especialista de Relacionamento uma visão operacional da própria carteira que responda, nesta ordem:

1. quais contas precisam de atenção agora e por quê;
2. qual é a próxima melhor ação de cada conta, com regra explicável;
3. quais prazos operacionais (SLA) estão em risco ou estourados;
4. quais incidentes e reuniões estão abertos ou pendentes;
5. quanto da capacidade da carteira está em uso.

O Cockpit não é um CRM, não antecipa Recovery/Helena e não expõe nenhum dado clínico. Ele agrega somente fontes próprias já confiáveis (Score, solicitações, planos/tarefas, integrações, assignments) e os novos registros operacionais internos (incidentes e reuniões).

## Público e decisões provisórias

- audiência primária: `relationship_specialist` com assignment ativo;
- `platform_admin`: acesso total auditável, inclusive contas sem assignment próprio;
- papéis tenant (`organization_owner`, `clinic_manager`, `doctor`, `viewer`, `operator`): **sem acesso ao Cockpit**. Incidentes e reuniões são registros operacionais internos; a comunicação com o cliente permanece via solicitações do Portal. Decisão provisória a revalidar antes do piloto;
- idioma `pt-BR`; horas de SLA em horas corridas (horário comercial adiado e documentado como limitação);
- dados exclusivamente sintéticos.

## Definições operacionais v1 (provisórias, versionadas)

Todas as regras abaixo são publicadas no domínio como `COCKPIT_POLICY_VERSION = '1.0.0-provisional'` e aparecem na interface com essa marcação. Nenhum valor é promessa contratual; calibração exige owner nominal e dados de piloto.

### SLA de solicitações (horas corridas)

| Prioridade | Primeira resposta (ack) | Resolução |
| ---------- | ----------------------- | --------- |
| `urgent`   | 4 h                     | 24 h      |
| `high`     | 8 h                     | 72 h      |
| `normal`   | 24 h                    | 168 h     |
| `low`      | 72 h                    | 336 h     |

Estados: `on_track` (< 75% do prazo), `at_risk` (≥ 75%), `breached` (estourado); para etapas concluídas, `met` ou `breached`. Solicitações `waiting_customer` pausam o relógio de resolução a partir da última transição para esse estado (aproximação v1: o tempo em espera não é descontado retroativamente; limitação documentada).

### Incidentes de conta

Registro operacional interno (não clínico, não visível ao cliente nesta fase).

```text
category: integration_failure | data_quality | sla_breach | engagement_risk | operational | other
severity: low | medium | high | critical
status:   open | investigating | mitigated | resolved | closed
```

Transições permitidas:

```text
open          → investigating | resolved | closed
investigating → mitigated | resolved | closed
mitigated     → investigating | resolved | closed
resolved      → closed | investigating
closed        → (terminal)
```

SLA por severidade (ack = sair de `open`; resolução = `resolved`/`closed`):

| Severidade | Ack  | Resolução |
| ---------- | ---- | --------- |
| `critical` | 2 h  | 24 h      |
| `high`     | 4 h  | 72 h      |
| `medium`   | 24 h | 168 h     |
| `low`      | 72 h | 336 h     |

`severity` significa impacto operacional da conta; nunca urgência ou risco clínico. A interface explicita essa distinção.

### Reuniões de conta

```text
purpose: onboarding | checkin | review | escalation | other
status:  scheduled | completed | cancelled | no_show
```

Transições: `scheduled → completed | cancelled | no_show`; demais estados terminais. Sem integração de agenda externa; a reunião é um registro operacional com data/hora declarada. Resumo é opcional, limitado e com aviso de não inserir dados de pacientes.

### Complexidade e capacidade da carteira

- `relationship_assignments.complexity`: `low` (peso 1), `standard` (peso 2, default), `high` (peso 3);
- capacidade usada = soma dos pesos dos assignments ativos do Especialista;
- limite = `relationship_specialists.capacity_limit` (pontos); quando nulo, aplica-se o default provisório de 12 pontos, exibido como "limite padrão provisório";
- estados: `available` (< 80%), `near_limit` (80–100%), `over_limit` (> 100%).

### Saúde da conta

`healthy | attention | critical`, sempre acompanhada das razões que dispararam, cada uma com categoria de risco:

```text
risk_category: performance | responsiveness | data_freshness | engagement | operational
```

Regras críticas (qualquer uma ⇒ `critical`):

- Score calculado < 40 (performance);
- SLA de solicitação `breached` (responsiveness);
- incidente `critical` aberto (operational).

Regras de atenção (qualquer uma, sem crítica ⇒ `attention`):

- Score calculado entre 40 e 59 (performance);
- Score ausente, `insufficient_data` ou calculado há mais de 35 dias (data_freshness);
- SLA de solicitação `at_risk` (responsiveness);
- incidente `high`/`medium` aberto (operational);
- 1+ tarefas do plano vencidas (operational);
- nenhuma reunião concluída nos últimos 30 dias (engagement).

Sem nenhuma regra disparada ⇒ `healthy`. Ausência de dado nunca vira zero: cada razão carrega a evidência (valores, datas e fonte) usada na decisão.

### Próxima melhor ação

Lista ordenada e determinística de regras explicáveis; cada ação expõe `code`, título, racional com evidência e alvo. Ordem v1:

1. `respond_breached_request` — solicitação com SLA estourado;
2. `handle_critical_incident` — incidente crítico aberto;
3. `respond_at_risk_request` — solicitação com SLA em risco;
4. `acknowledge_incident` — incidente aberto sem ack dentro do prazo;
5. `review_low_score` — Score < 40: agendar reunião de revisão;
6. `propose_improvement_plan` — Score < 60 sem plano ativo;
7. `unblock_overdue_tasks` — tarefas vencidas no plano ativo;
8. `refresh_assessment` — Score ausente/estale (> 35 dias): solicitar novo Radar;
9. `schedule_checkin` — sem reunião concluída há mais de 30 dias.

Nenhum modelo opaco de churn; nenhuma ação automática. O Cockpit recomenda; o Especialista decide e executa pelos fluxos existentes.

## Fora de escopo

- visibilidade de incidentes/reuniões para papéis do cliente;
- notificações (e-mail, push, WhatsApp) e escalonamento automático;
- Recovery Engine, execução de contato ou "valor recuperado";
- Helena, agenda externa, disponibilidade e comparecimento;
- SLA em horário comercial/feriados e pausa retroativa de relógio;
- modelo estatístico de risco/churn;
- edição de assignments, specialists e capacity pela interface (permanece administrativa);
- qualquer dado ou campo clínico.

## Fontes e disponibilidade

| Informação                         | Fonte                              | Estado quando ausente                   |
| ---------------------------------- | ---------------------------------- | --------------------------------------- |
| carteira, complexidade, capacidade | Fundação (assignments/specialists) | `not_assigned`                          |
| Score, cobertura, staleness        | Althion Score                      | `insufficient_data`                     |
| solicitações e SLA                 | Portal (Fase 3)                    | `available` (lista vazia)               |
| plano e tarefas vencidas           | Portal (Fase 3)                    | `available` (sem plano)                 |
| incidentes e reuniões              | módulo próprio da Fase 4           | disponível após migration               |
| integrações                        | Fundação                           | `blocked`/`disabled`                    |
| leads, conversas, agenda, Recovery | Helena/fases futuras               | `source_blocked`/`module_not_available` |

## Modelo de dados

### Alterações aditivas

- `relationship_assignments.complexity public.account_complexity not null default 'standard'`.

### `account_incidents`

- `id`, `organization_id`, `clinic_id` (FK composta para clinics);
- `opened_by_profile_id`, `assignee_profile_id?`;
- `category`, `severity`, `status`, `subject` (5–160), `details` (10–1000);
- `acknowledged_at?`, `mitigated_at?`, `resolved_at?`, `closed_at?`;
- `created_at`, `updated_at`; unique `(organization_id, id)` e `(organization_id, clinic_id, id)`;
- texto nunca em logs/auditoria; sem anexos; sem soft delete.

### `account_incident_status_history`

- append-only, FK composta para o incidente, `from_status?`, `to_status`, `reason_code?`, `changed_by_profile_id`, `changed_at`.

### `account_meetings`

- `id`, `organization_id`, `clinic_id`;
- `specialist_profile_id` (criador/registrante), `purpose`, `status`;
- `scheduled_at`, `completed_at?`, `cancelled_at?`, `summary?` (0–500, aviso não clínico);
- `created_at`, `updated_at`; uniques compostos como acima.

### `account_meeting_status_history`

- append-only, mesma estrutura dos demais históricos.

### Projeções sem tabela nova

- carteira com saúde, capacidade e próxima ação;
- detalhe da conta (saúde, razões, SLA, próximas ações);
- SLA calculado on-the-fly a partir de `requests` e `account_incidents` (nenhum snapshot persistido nesta fase).

## Permissões

Novas capabilities:

```text
cockpit:read
incident:read
incident:manage
meeting:read
meeting:manage
```

| Perfil                    | Cockpit                                | Incidentes                  | Reuniões                    |
| ------------------------- | -------------------------------------- | --------------------------- | --------------------------- |
| `platform_admin`          | total e auditado                       | gerencia                    | gerencia                    |
| `relationship_specialist` | lê carteira própria (assignment ativo) | lê e gerencia no assignment | lê e gerencia no assignment |
| demais papéis tenant      | sem capability                         | sem capability              | sem capability              |

`organization_owner` deixa de receber automaticamente "todas" as capabilities: o conjunto passa a ser explícito e não inclui as do Cockpit. O Especialista perde acesso imediatamente quando o assignment termina (`ends_at`/status), inclusive nas policies SQL.

## Rotas web

| Rota             | Entrega                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `/cockpit`       | carteira: contas com saúde, próxima ação, SLA em risco e capacidade                                       |
| `/cockpit/conta` | detalhe por `organizationId`+`clinicId`: razões, ações, SLA, incidentes e reuniões com criação/transições |

Contexto por query string revalidado na API/RLS, como no Portal. Sessão, feature flag e autorização verificadas no servidor; acesso negado explícito para papéis sem capability.

## API

```text
GET  /api/v1/cockpit/portfolio
GET  /api/v1/organizations/:organizationId/clinics/:clinicId/cockpit/account

GET  /api/v1/organizations/:organizationId/clinics/:clinicId/incidents
POST /api/v1/organizations/:organizationId/clinics/:clinicId/incidents
POST /api/v1/organizations/:organizationId/clinics/:clinicId/incidents/:incidentId/transitions

GET  /api/v1/organizations/:organizationId/clinics/:clinicId/meetings
POST /api/v1/organizations/:organizationId/clinics/:clinicId/meetings
POST /api/v1/organizations/:organizationId/clinics/:clinicId/meetings/:meetingId/transitions
```

`/cockpit/portfolio` não tem `organizationId` na rota; a autorização é feita pelo principal (Especialista ativo ou `platform_admin`) e cada linha da carteira é filtrada pelo RLS. Commands exigem `Idempotency-Key`; transições inválidas retornam conflito tipado; RPCs `security definer` seguem o padrão da Fase 3 (idempotência por tenant/escopo/chave/hash, histórico append-only e auditoria sem texto livre).

## Arquivos previstos

### Novos

```text
docs/plans/phase-4-cockpit.md
docs/releases/phase-4.md

packages/contracts/src/cockpit.ts
packages/contracts/src/cockpit.test.ts

packages/domain/src/cockpit/index.ts
packages/domain/src/cockpit/types.ts
packages/domain/src/cockpit/policy.ts
packages/domain/src/cockpit/sla.ts
packages/domain/src/cockpit/sla.test.ts
packages/domain/src/cockpit/health.ts
packages/domain/src/cockpit/health.test.ts
packages/domain/src/cockpit/capacity.ts
packages/domain/src/cockpit/capacity.test.ts
packages/domain/src/cockpit/next-best-action.ts
packages/domain/src/cockpit/next-best-action.test.ts
packages/domain/src/cockpit/transitions.ts
packages/domain/src/cockpit/transitions.test.ts

supabase/migrations/<timestamp>_cockpit.sql
supabase/tests/cockpit_rls.test.sql

apps/api/src/modules/cockpit/cockpit.module.ts
apps/api/src/modules/cockpit/cockpit-feature.service.ts
apps/api/src/modules/cockpit/cockpit.controller.ts
apps/api/src/modules/cockpit/cockpit.service.ts
apps/api/src/modules/cockpit/cockpit.service.test.ts
apps/api/src/modules/cockpit/cockpit.repository.ts
apps/api/src/modules/cockpit/incidents.controller.ts
apps/api/src/modules/cockpit/meetings.controller.ts

apps/web/src/app/cockpit/layout.tsx
apps/web/src/app/cockpit/page.tsx
apps/web/src/app/cockpit/loading.tsx
apps/web/src/app/cockpit/error.tsx
apps/web/src/app/cockpit/conta/page.tsx
apps/web/src/app/cockpit/conta/actions.ts
apps/web/src/components/cockpit/*
apps/web/src/lib/api/cockpit.ts
```

### Alterados

```text
packages/contracts/src/index.ts
packages/contracts/src/database.types.ts
packages/domain/src/index.ts
packages/domain/src/authorization.ts
packages/domain/src/authorization.test.ts
supabase/seed.sql
apps/api/src/app.module.ts
apps/web/src/app/globals.css
docs/architecture/architecture.md
docs/architecture/data-model.md
docs/architecture/route-map.md
docs/data/data-dictionary.md
docs/security/security-model.md
docs/security/rls-test-evidence.md
docs/operations/runbook.md
docs/current-state.md
docs/roadmap.md
IMPLEMENTATION_PLAN.md
README.md
```

## Incrementos e commits propostos

1. `docs: plan phase 4 cockpit`
2. `feat(cockpit): add explainable policy domain and capabilities`
3. `feat(database): add incidents meetings and cockpit RLS`
4. `feat(api): expose specialist cockpit projections and workflows`
5. `feat(web): add specialist cockpit portfolio and account views`
6. `docs: record phase 4 implementation evidence`

## Riscos e mitigação

| Risco                                                    | Mitigação e evidência exigida                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| SLA provisório ser lido como compromisso contratual      | rótulo "política provisória 1.0.0" na UI e nos DTOs; sem exibição ao cliente  |
| saúde/ação parecerem modelo opaco                        | toda razão e ação carrega regra, evidência e versão da política               |
| Especialista ver conta após fim do assignment            | policies com janela temporal + testes pgTAP de expiração + teste de domínio   |
| cliente ver incidentes internos                          | nenhuma capability tenant; policies negam; teste negativo por papel           |
| relógio de SLA impreciso (waiting_customer, comercial)   | aproximação documentada; recálculo sempre derivado, nunca snapshot persistido |
| capacidade sem limite configurado virar número inventado | default provisório explícito na UI e no DTO (`limitSource: default`)          |
| duplicar conceitos de Recovery/Quality                   | incidentes/reuniões são operacionais; nenhuma oportunidade/contato criado     |
| texto de incidente/resumo conter dado sensível           | limites, aviso não clínico, logs por ID, sem anexos/IA                        |
| cross-tenant via carteira agregada                       | RLS por linha + FKs compostas + testes negativos tenant B                     |
| OneDrive/Docker atrasarem validação de banco             | mesma limitação das fases anteriores, registrada no release                   |

## Estratégia de testes

### Domínio e contratos

- SLA: limites exatos (74%/75%/100%), etapas concluídas, waiting_customer, entradas inválidas;
- saúde: cada regra isolada, combinação crítica+atenção, ausência de dados;
- capacidade: pesos, limite nulo (default provisório), estados de fronteira 80%/100%;
- próxima ação: ordenação determinística, uma ação por regra, evidência presente;
- transições de incidente/reunião válidas e inválidas;
- DTOs rejeitam UUID, enum, datas e textos inválidos.

### Banco/RLS (pgTAP, execução pendente de Docker)

- Especialista com assignment ativo lê/cria/transiciona incidentes e reuniões da sua carteira;
- Especialista com assignment expirado ou encerrado é negado;
- owner, manager, doctor, viewer e operator negados em leitura e escrita;
- tenant B negado; FKs compostas impedem referência cruzada;
- históricos append-only; transição inválida rejeitada; idempotência reusa/conflita;
- auditoria sem subject/details/summary.

### API

- 401 sem bearer; 403 por papel sem capability; 404 fora do tenant;
- portfolio nega usuário sem assignment e sem platform_admin;
- validação Zod, Idempotency-Key obrigatório, conflito tipado em transição inválida;
- projeção da conta reconcilia com Score/requests/tasks persistidos.

### Web/E2E

- carteira e conta com estados: saudável, atenção, crítico, vazio, negado, flag off;
- criação de incidente/reunião e transições por papel autorizado;
- navegação por teclado, foco, contraste e axe nas rotas públicas testáveis;
- viewport desktop e móvel; nenhum token/service role no bundle.

## Critérios de aceite da Fase 4

- a carteira responde "qual conta precisa de mim agora" sem interação;
- toda saúde, SLA e ação exibe regra, evidência e versão da política;
- incidentes e reuniões têm validação, idempotência, histórico e auditoria;
- papéis do cliente não acessam nada do Cockpit (API, RLS e UI);
- Especialista perde acesso no fim do assignment (testado em domínio e SQL);
- capacidade explica pesos, limite e origem do limite;
- lint, typecheck, unit, build e E2E disponível passam; pgTAP versionado;
- documentação e evidências atualizadas; limitações listadas;
- nenhuma API Helena fictícia, dado real, campo clínico ou automação de contato.

## Ordem de execução

1. contratos, capabilities e domínio puro com testes;
2. migration aditiva, RLS, RPCs e pgTAP versionado;
3. API (projeções e workflows) com testes;
4. web (carteira e conta) com estados e acessibilidade;
5. gates, evidências visuais e documentação.
