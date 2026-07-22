# Plano detalhado da Fase 5 — Recovery Engine (sem execução)

## Estado e gate

Planejamento e execução em 17 de julho de 2026, sob a autorização de avanço contínuo. Os gates de banco das Fases 1–4 (Docker/CI, 100 assertions pgTAP) seguem pendentes; a Fase 5 adota o mesmo regime: código, testes puros e build verdes localmente, validação PostgreSQL adiada e documentada em `docs/releases/phase-5.md`.

Feature flag: `recovery.engine.v1`, global-off, habilitada apenas no seed sintético.

## Objetivo e fronteira dura

Entregar o motor de recuperação **sem executar nenhum contato**: regras determinísticas e versionadas identificam oportunidades administrativas a partir de dados sintéticos do `MockCrmProvider`, com governança completa de consentimento, supressão, frequência, aprovação humana e idempotência.

Fronteiras invioláveis nesta fase:

- nenhuma mensagem, e-mail, WhatsApp ou chamada é enviada ou agendada;
- nenhuma API Helena real ou fictícia; fonte de leads é exclusivamente o mock determinístico;
- ações terminam em `approved`/`rejected`; o estado `executed` não existe no schema desta fase;
- nenhum dado clínico; motivos e notas são taxonomias administrativas fechadas;
- cancelamento/falta/horário vago/paciente inativo dependem de dados de agenda, operados externamente por cliente (sistema próprio, Google Agenda etc.) e integrados via Helena → **fora do escopo desta fase** até a integração de dados opcional ser ligada; apenas os cenários 1 e 2 do roadmap entram (lead sem resposta; atendido sem agendamento), ambos sintéticos.

## Política de recuperação v1 (provisória, versionada)

`RECOVERY_POLICY_VERSION = '1.0.0-provisional'` no domínio, exibida na UI.

### Regras determinísticas

| Regra                    | Código                | Condição (sobre leads do mock)                                        | Ação recomendada                 |
| ------------------------ | --------------------- | --------------------------------------------------------------------- | -------------------------------- |
| Lead sem resposta        | `lead_no_response`    | lead com último contato de entrada sem resposta há > 24 h e ≤ 30 dias | recomendar retomada de contato   |
| Atendido sem agendamento | `attended_no_booking` | lead atendido/qualificado sem agendamento há > 72 h e ≤ 60 dias       | recomendar oferta de agendamento |

Parâmetros (janelas, limites) ficam em `packages/domain/src/recovery/policy.ts`; qualquer mudança exige nova versão.

### Governança

- **Consentimento:** oportunidade só é elegível se o lead sintético tiver `consent = granted` no mock; `denied`/`unknown` geram exclusão explicada (`excluded_no_consent`), nunca contato.
- **Supressão:** lista por tenant (`recovery_suppressions`) por referência externa do lead; motivos `opt_out | complaint | manual_review | other`; supressão ativa exclui a oportunidade com razão `excluded_suppressed`.
- **Frequência:** máx. 1 ação aprovada por lead a cada 7 dias e 3 por 30 dias (provisório); violação gera exclusão `excluded_frequency`.
- **Aprovação:** toda ação nasce `recommended` e exige decisão humana (`approved`/`rejected` com `reason_code`); expiração automática em 14 dias (`expired`) sem decisão.
- **Idempotência:** simulação e decisões usam o mecanismo `app_private.claim_portal_idempotency`; reexecutar uma simulação com o mesmo snapshot não duplica oportunidades (unicidade por run + regra + referência do lead).
- **Explicabilidade:** cada oportunidade grava regra, versão, janela avaliada, evidência (timestamps do lead) e cada exclusão grava a razão.

### Máquinas de estado

```text
simulation (run): draft → completed | failed          (sem retomada; nova run para reexecutar)
opportunity:      identified → approved | discarded | expired
action:           recommended → approved | rejected | expired
```

## Modelo de dados

Todas as tabelas com FK composta para `clinics(organization_id, id)`, uniques `(organization_id, id)` e `(organization_id, clinic_id, id)`, RLS deny-by-default.

- `recovery_simulations`: id, org, clinic, policy_version, provider (`mock`), status (`completed|failed`), window_start, window_end, leads_evaluated, opportunities_identified, excluded_no_consent, excluded_suppressed, excluded_frequency, created_by_profile_id, created_at. Append-only (sem update além do fluxo do RPC).
- `recovery_opportunities`: id, org, clinic, simulation_id (FK composta), rule_code, rule_version, external_lead_ref (texto, id sintético do mock), lead_label (rótulo sintético limitado, sem PII real), evidence jsonb (timestamps/valores usados), status, decided_by_profile_id?, decided_at?, reason_code?, expires_at, created_at, updated_at; unique (org, clinic, simulation_id, rule_code, external_lead_ref).
- `recovery_actions`: id, org, clinic, opportunity_id (FK composta), action_type (`contact_lead | offer_booking`), status, decided_by_profile_id?, decided_at?, reason_code?, expires_at, created_at, updated_at.
- `recovery_suppressions`: id, org, clinic, external_lead_ref, reason (`opt_out|complaint|manual_review|other`), created_by_profile_id, expires_at?, created_at; unique parcial ativa por (org, clinic, external_lead_ref).
- históricos append-only: `recovery_opportunity_status_history`, `recovery_action_status_history`.

RPCs `security definer` (padrão da Fase 3/4, com idempotência e auditoria sem texto livre): `run_recovery_simulation` (recebe o snapshot sintético já avaliado pela API — o Postgres não chama o mock), `decide_recovery_opportunity`, `decide_recovery_action`, `create_recovery_suppression`, `revoke_recovery_suppression`.

A avaliação das regras acontece no domínio TypeScript (determinística e testável); o RPC persiste o resultado de forma transacional e idempotente, revalidando invariantes (janelas coerentes, contadores = linhas inseridas, consentimento/supressão/frequência reavaliados no banco para as exclusões declaradas — defesa em profundidade contra API adulterada).

## Permissões

Novas capabilities: `recovery:read`, `recovery:simulate`, `recovery:decide`, `suppression:read`, `suppression:manage`.

| Perfil                                       | Ler | Simular | Decidir | Supressão                                 |
| -------------------------------------------- | --- | ------- | ------- | ----------------------------------------- |
| `platform_admin`                             | ✔   | ✔       | ✔       | ✔                                         |
| `relationship_specialist` (assignment ativo) | ✔   | ✔       | ✔       | ✔                                         |
| `organization_owner` / `clinic_manager`      | ✔   | —       | ✔       | lê; cria opt-out **[decisão provisória]** |
| `doctor` / `viewer`                          | —   | —       | —       | —                                         |
| `operator`                                   | —   | —       | —       | —                                         |

Decisão provisória: Recovery é operado pelo Especialista com aprovação também disponível a owner/manager (são quem conhece o cliente final); doctor/viewer não veem dados de leads. Revalidar antes do piloto.

## Rotas e API

Web (flag + capability + RLS):

| Rota                              | Entrega                                                              |
| --------------------------------- | -------------------------------------------------------------------- |
| `/cockpit/recovery`               | simulações da carteira, execução de nova simulação e visão por conta |
| `/cockpit/recovery/oportunidades` | fila de oportunidades/ações por conta com decisão e supressões       |

API:

```text
GET  /api/v1/organizations/:orgId/clinics/:clinicId/recovery/simulations           recovery:read
POST /api/v1/organizations/:orgId/clinics/:clinicId/recovery/simulations           recovery:simulate
GET  /api/v1/organizations/:orgId/clinics/:clinicId/recovery/opportunities         recovery:read
POST /api/v1/organizations/:orgId/clinics/:clinicId/recovery/opportunities/:id/decisions  recovery:decide
POST /api/v1/organizations/:orgId/clinics/:clinicId/recovery/actions/:id/decisions        recovery:decide
GET  /api/v1/organizations/:orgId/clinics/:clinicId/recovery/suppressions          suppression:read
POST /api/v1/organizations/:orgId/clinics/:clinicId/recovery/suppressions          suppression:manage
POST /api/v1/organizations/:orgId/clinics/:clinicId/recovery/suppressions/:id/revoke      suppression:manage
```

Commands exigem `Idempotency-Key`. A simulação usa o `MockCrmProvider` (isolado por tenant, determinístico) via camada de integração existente; UI e DTOs identificam `provider: mock` e "ambiente sintético" em todas as superfícies.

## Arquivos previstos

Novos: `docs/plans/phase-5-recovery.md`, `docs/releases/phase-5.md`; `packages/domain/src/recovery/{policy,types,rules,governance,transitions,index}.ts` + testes; `packages/contracts/src/recovery.ts` + teste; `supabase/migrations/<ts>_recovery.sql`; `supabase/tests/recovery_rls.test.sql`; `apps/api/src/modules/recovery/*` (module, feature service reutilizando padrão, repository, service + teste, controllers); `apps/web/src/app/cockpit/recovery/*`, `apps/web/src/components/recovery/*`, `apps/web/src/lib/api/recovery.ts`.

Alterados: índices de contracts/domain, authorization(+teste), app.module, seed, database.types, globals.css, docs de arquitetura/dados/segurança/runbook, roadmap, current-state, IMPLEMENTATION_PLAN, README.

## Commits propostos

1. `docs: plan phase 5 recovery`
2. `feat(recovery): add versioned deterministic rules and governance domain`
3. `feat(database): add recovery engine schema with governance RLS`
4. `feat(api): expose recovery simulations and decisions`
5. `feat(web): add recovery queue to specialist cockpit`
6. `docs: record phase 5 implementation evidence`

## Riscos e mitigação

| Risco                                       | Mitigação                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| parecer que contatos foram feitos           | estado `executed` inexistente; copy "nenhum contato é enviado nesta fase" em todas as telas |
| lead sintético ser confundido com dado real | `provider: mock` explícito, rótulos "sintético", nenhuma importação externa                 |
| burlar consentimento/supressão via API      | RPC revalida consentimento/supressão/frequência no banco antes de persistir                 |
| duplicação de oportunidades                 | unicidade por run+regra+lead e idempotência de comandos                                     |
| regra opaca                                 | evidência e versão gravadas por oportunidade; testes de cada janela                         |
| fila virar CRM                              | sem edição de lead, sem conversa, sem pipeline; apenas decisão administrativa               |
| decisões sem dono                           | `decided_by` obrigatório na transição; expiração automática em 14 dias                      |

## Testes

- Domínio: cada regra com casos dentro/fora das janelas; consentimento/supressão/frequência; expiração; transições inválidas; determinismo (mesmo snapshot ⇒ mesmas oportunidades).
- pgTAP (novas assertions): specialist simula/decide; owner decide mas não simula; doctor/viewer/operator negados; tenant B negado; unicidade de oportunidade; histórico append-only; supressão bloqueia; idempotência; auditoria sem payload de lead.
- API: 401/403/404, Zod, Idempotency-Key, conflito tipado, contadores reconciliam com linhas.
- Web/E2E: estados (flag off, negado, vazio, fila com decisões), aviso de não-execução, teclado/axe nas rotas públicas.

## Critérios de aceite

- nenhuma superfície permite ou simula envio de contato;
- toda oportunidade exibe regra, versão, evidência e razão de exclusão quando aplicável;
- consentimento, supressão e frequência são aplicados no domínio e revalidados no banco;
- decisões são humanas, auditadas, idempotentes e expiram;
- papéis sem capability não veem dados de leads sintéticos;
- lint, typecheck, unit, build e E2E público verdes; pgTAP versionado;
- documentação e limitações atualizadas.
