# Fase 4 — Cockpit do Especialista

## Resultado

Implementada em 17 de julho de 2026 no branch `codex/phase-4-cockpit`. O Cockpit dá ao Especialista de Relacionamento uma visão operacional da própria carteira: saúde por conta com razões explicáveis, SLA de solicitações e incidentes, registros internos de incidentes e reuniões, capacidade por complexidade e próxima melhor ação determinística.

A feature flag `cockpit.specialist.v1` é `false` por padrão (flag global, sem override por organização) e é habilitada apenas no seed sintético local. Toda a política operacional é versionada como `1.0.0-provisional` e exibida com essa marcação.

## Escopo entregue

### Domínio explicável (`packages/domain/src/cockpit`)

- SLA de solicitações por prioridade (ack 4/8/24/72 h; resolução 24/72/168/336 h) e de incidentes por severidade (ack 2/4/24/72 h), com estados `on_track | at_risk (≥75%) | breached | met` e relógio congelado em `waiting_customer` (aproximação v1);
- saúde da conta `healthy | attention | critical` com razões que carregam regra, evidência e categoria de risco (`performance | responsiveness | data_freshness | engagement | operational`); ausência de dado vira razão, nunca zero;
- próxima melhor ação: nove regras ordenadas e determinísticas (SLA estourado → incidente crítico → SLA em risco → ack pendente → Score crítico → plano ausente → tarefas vencidas → diagnóstico desatualizado → check-in);
- capacidade da carteira por pesos de complexidade (low 1 / standard 2 / high 3) contra `capacity_limit` (default provisório de 12 pontos com origem explícita);
- máquinas de estado de incidente e reunião.

### Banco e isolamento

A migration `20260717090000_cockpit.sql` adiciona:

- `relationship_assignments.complexity` (enum, default `standard`);
- `account_incidents` + `account_incident_status_history` (append-only);
- `account_meetings` + `account_meeting_status_history` (append-only);
- FKs compostas por organização/clínica, checks de timestamps por estado;
- `app_private.can_access_cockpit` = platform_admin ou Especialista com assignment ativo na janela temporal;
- RLS deny-by-default: **nenhum papel tenant (owner, manager, doctor, viewer, operator) lê ou escreve** — incidentes e reuniões são registros internos;
- RPCs `security definer` com idempotência por tenant/escopo/chave/hash, histórico e auditoria sem texto livre: `create_account_incident`, `transition_account_incident`, `create_account_meeting`, `transition_account_meeting`;
- flag `cockpit.specialist.v1` (default false).

Seed sintético: capacity_limit 10, segundo assignment (org B, complexidade alta), um incidente aberto, uma reunião concluída há 10 dias e uma flag ligada localmente.

### API

```text
GET  /api/v1/cockpit/portfolio
GET  /api/v1/organizations/:organizationId/clinics/:clinicId/cockpit/account
GET/POST /api/v1/organizations/:organizationId/clinics/:clinicId/incidents[/:id/transitions]
GET/POST /api/v1/organizations/:organizationId/clinics/:clinicId/meetings[/:id/transitions]
```

`/cockpit/portfolio` autoriza pelo principal (Especialista com assignment ativo ou platform_admin) e delega cada linha ao RLS; as demais rotas usam as novas capabilities `cockpit:read`, `incident:read/manage`, `meeting:read/manage`. `organization_owner` deixou de receber capabilities automaticamente: o conjunto agora é explícito e exclui o Cockpit. Commands exigem `Idempotency-Key`; conflitos e transições inválidas retornam erros tipados.

### Web

- `/cockpit` — carteira ordenada por criticidade com saúde, Score, SLAs, incidentes abertos, complexidade, próxima ação e capacidade;
- `/cockpit/conta` — razões da saúde com regra e evidência, próximas ações, SLA por solicitação, incidentes e reuniões com criação e transições idempotentes;
- estados: negado (papel de cliente), flag desligada, indisponível, carteira vazia, conta saudável;
- Server Components para leitura; Client Components apenas nos formulários e transições; avisos de não inserir dado clínico nos textos livres.

## Evidências

| Gate             | Resultado                                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Prettier         | passou nos arquivos alterados                                                                                          |
| ESLint           | passou sem warnings                                                                                                    |
| Typecheck        | passou em todos os workspaces                                                                                          |
| Unit/contract    | 65 testes verdes (17 arquivos), incluindo SLA, saúde, capacidade, próxima ação, transições, contratos e serviço da API |
| Build            | NestJS e Next.js verdes; rotas `/cockpit` e `/cockpit/conta` compiladas                                                |
| Playwright + axe | 2 testes públicos passaram em Chromium                                                                                 |
| pgTAP            | 27 assertions da Fase 4 versionadas; execução bloqueada sem Docker                                                     |

## Limitações e bloqueios

1. Docker permanece indisponível neste host: migration, RPCs e as 27 assertions pgTAP da Fase 4 não foram executadas (total pendente: 100 assertions das Fases 1–4). `database.types.ts` segue provisório até `pnpm db:types` em banco real.
2. Sem usuário sintético autenticado no host, não há E2E autenticado nem captura visual das telas do Cockpit; a inspeção visual fica pendente de `db:start`/seed.
3. O relógio de SLA usa horas corridas e congela `waiting_customer` em `updated_at` (aproximação); horário comercial e pausa retroativa ficam para calibração com owner nominal.
4. Todos os thresholds (SLA, saúde, capacidade, 35 dias de staleness, 30 dias de reunião) são `1.0.0-provisional` e precisam de validação com a operação real antes de qualquer promessa a cliente.
5. Incidentes e reuniões são invisíveis para papéis do cliente por decisão provisória documentada no plano; revalidar antes do piloto.
6. Helena, Recovery, Quality, Capacity e agenda permanecem bloqueados/fora de escopo.

## Gate antes da Fase 5

- executar `pnpm db:start`, `db:reset`, `db:lint` e `pnpm test:db` (100 assertions) em Docker/CI;
- regenerar e revisar tipos do banco; repetir gates;
- E2E autenticado por papel, incluindo Especialista com assignment ativo/encerrado;
- validar a rotina real do Especialista (definições de SLA, saúde, capacidade e ações) com usuários representativos;
- definir consentimento, supressão, frequência e fontes de Recovery antes de qualquer regra da Fase 5.
