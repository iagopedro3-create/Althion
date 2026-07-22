# Mapa de rotas

## Estado atual

As rotas da Fundação, Radar/Score e Portal do Cliente estão implementadas. Rotas de Cockpit, engines e integrações externas continuam propostas e não constituem API pronta.

## Convenções

- URLs de interface ficam em português e são orientadas ao usuário.
- API REST usa `/api/v1` e nomes estáveis em inglês.
- `organizationId` explícito melhora rastreabilidade, mas sempre é validado por guardas e RLS.
- IDs externos da Helena nunca aparecem como chave primária pública da Althion.
- Detalhes usam UUID Althion e retornam `404` ou `403` conforme a política de não enumeração aprovada.
- Webhooks têm namespace próprio, rate limit, assinatura, replay protection e idempotência.

## Site e autenticação

| Rota web            | Finalidade                                     | Fase                                |
| ------------------- | ---------------------------------------------- | ----------------------------------- |
| `/`                 | Proposta de valor e funcionamento              | A definir; não há landing existente |
| `/diagnostico`      | Entrada pública do Radar                       | 2                                   |
| `/seguranca`        | Segurança e privacidade em linguagem comercial | A definir                           |
| `/privacidade`      | Aviso de privacidade aprovado                  | Antes do piloto                     |
| `/termos`           | Termos aprovados                               | Antes do piloto                     |
| `/entrar`           | Login                                          | 1                                   |
| `/auth/callback`    | Callback de autenticação                       | 1                                   |
| `/recuperar-acesso` | Recuperação de acesso                          | 1                                   |

As seções comerciais (recuperação, leads, agenda, especialista, IA, indicadores e aquisição futura) podem ser âncoras da home ou páginas próprias após conteúdo e identidade visual aprovados.

## Portal do cliente

| Rota web                               | Finalidade                                             | Fase                                                                                 |
| -------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `/app`                                 | Dashboard orientado a problemas, oportunidades e ações | 3, implementada                                                                      |
| `/app/radar`                           | Histórico de diagnósticos                              | 2, implementada                                                                      |
| `/app/radar/novo`                      | Questionário manual em etapas                          | 2, implementada                                                                      |
| `/app/radar/[assessmentId]`            | Rascunho, prévia, envio e evidências                   | 2, implementada                                                                      |
| `/app/radar/[assessmentId]/editar`     | Edição de rascunho                                     | 2, implementada                                                                      |
| `/app/radar/[assessmentId]/relatorio`  | Relatório imprimível                                   | 2, implementada                                                                      |
| `/app/radar/[assessmentId]/export.csv` | Exportação autorizada e auditada                       | 2, implementada                                                                      |
| `/app/score`                           | Score, componentes, comparação e histórico             | 2, implementada                                                                      |
| `/app/score/[scoreId]`                 | Nota, cobertura, componentes, recomendações e lineage  | 2, implementada                                                                      |
| `/app/leads`                           | Visão normalizada de leads                             | 3/6                                                                                  |
| `/app/agenda`                          | Capacidade e eventos administrativos                   | 3, limitada até ligar a integração de dados (agenda operada externamente via Helena) |
| `/app/recuperacao`                     | Oportunidades priorizadas                              | 3/5                                                                                  |
| `/app/recuperacao/[opportunityId]`     | Evidências, ações e resultado                          | 5                                                                                    |
| `/app/indicadores`                     | Métricas, histórico e evidências                       | 3, implementada                                                                      |
| `/app/oportunidades`                   | Recomendações administrativas do Radar                 | 3, implementada                                                                      |
| `/app/relatorios`                      | Relatórios e exportações existentes                    | 2/3, implementada                                                                    |
| `/app/acoes`                           | Ações executadas e pendentes                           | 3/5                                                                                  |
| `/app/qualidade`                       | Performance de IA, revisões e handoffs                 | 7                                                                                    |
| `/app/solicitacoes`                    | Solicitações do cliente                                | 3, implementada                                                                      |
| `/app/solicitacoes/[requestId]`        | Detalhe, histórico e transições                        | 3, implementada                                                                      |
| `/app/plano-de-melhoria`               | Plano, responsáveis e prazos                           | 3, implementada                                                                      |
| `/app/especialista`                    | Especialista atribuído e contato operacional           | 3, implementada                                                                      |
| `/app/integracoes`                     | Conexões, estado e freshness                           | 3/6, leitura implementada                                                            |
| `/app/configuracoes`                   | Contexto autorizado em leitura                         | 1/3, implementada                                                                    |
| `/app/configuracoes/acessos`           | Memberships e permissões                               | 1                                                                                    |
| `/app/configuracoes/consentimentos`    | Políticas e supressões administrativas                 | 5                                                                                    |

## Cockpit do Especialista

| Rota web                            | Finalidade                                  | Fase |
| ----------------------------------- | ------------------------------------------- | ---- |
| `/especialista`                     | Carteira, saúde, alertas e capacidade       | 4    |
| `/especialista/clinicas/[clinicId]` | Visão 360 administrativa da conta atribuída | 4    |
| `/especialista/alertas`             | Alertas priorizados                         | 4    |
| `/especialista/incidentes`          | Incidentes e SLA                            | 4    |
| `/especialista/pendencias`          | Tarefas e solicitações                      | 4    |
| `/especialista/agenda`              | Reuniões e follow-ups, não agenda clínica   | 4    |
| `/especialista/capacidade`          | Complexidade e carga da carteira            | 4/8  |

## Administração da plataforma

| Rota web               | Finalidade                               | Fase      |
| ---------------------- | ---------------------------------------- | --------- |
| `/admin`               | Saúde operacional da plataforma          | 1, mínimo |
| `/admin/organizacoes`  | Provisionamento e estado de organizações | 1         |
| `/admin/especialistas` | Especialistas e assignments              | 1/4       |
| `/admin/integracoes`   | Monitoramento de conexões e jobs         | 1/6       |
| `/admin/feature-flags` | Rollout controlado                       | 1         |
| `/admin/auditoria`     | Consulta autorizada de auditoria         | 1         |
| `/admin/incidentes`    | Gestão de incidentes                     | 1/10      |

O namespace `/admin` exige papel de plataforma, MFA e trilha reforçada. Não deve ser uma forma de ignorar tenant sem propósito registrado.

## API de fundação

| Método e rota                                                                  | Finalidade                          | Fase   |
| ------------------------------------------------------------------------------ | ----------------------------------- | ------ |
| `GET /health/live`                                                             | Liveness sem dependências           | 1      |
| `GET /health/ready`                                                            | Readiness sanitizada                | 1      |
| `GET /api/v1/me`                                                               | Perfil, memberships e capabilities  | 1      |
| `GET /api/v1/organizations/:organizationId`                                    | Organização autorizada              | 1      |
| `GET /api/v1/organizations/:organizationId/clinics`                            | Clínicas visíveis                   | 1      |
| `GET /api/v1/organizations/:organizationId/units`                              | Unidades visíveis                   | Adiada |
| `GET /api/v1/organizations/:organizationId/memberships`                        | Acessos, restrito a gestores        | 1      |
| `POST /api/v1/organizations/:organizationId/memberships`                       | Conceder acesso                     | 1      |
| `PATCH /api/v1/organizations/:organizationId/memberships/:membershipId/revoke` | Revogar acesso de forma idempotente | 1      |
| `GET /api/v1/organizations/:organizationId/feature-flags`                      | Flags efetivas                      | 1      |
| `GET /api/v1/organizations/:organizationId/audit-logs`                         | Auditoria autorizada                | 1      |
| `GET /api/v1/organizations/:organizationId/integrations`                       | Estado sanitizado das integrações   | 1      |

Mutations exigem validação, autorização, auditoria e idempotency key quando repetição puder causar efeito duplicado.

## API de produto por módulo

| Prefixo                                                                     | Recursos principais                             | Fase                    |
| --------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------- |
| `/api/v1/organizations/:organizationId/clinics/:clinicId/radar-assessments` | rascunho, detalhe, prévia, envio e export       | 2, implementada         |
| `/api/v1/organizations/:organizationId/clinics/:clinicId/scores`            | snapshots, detalhe e histórico                  | 2, implementada         |
| `/api/v1/organizations/:organizationId/clinics/:clinicId/score-comparisons` | comparação explícita entre snapshots            | 2, implementada         |
| `/api/v1/organizations/:organizationId/clinics/:clinicId/portal/*`          | dashboard, indicadores, oportunidades e pessoas | 3, implementada         |
| `/api/v1/organizations/:organizationId/leads`                               | visão normalizada                               | 3/6                     |
| `/api/v1/organizations/:organizationId/appointments`                        | eventos administrativos                         | 3, após source of truth |
| `/api/v1/organizations/:organizationId/clinics/:clinicId/requests`          | solicitações, detalhe e transições              | 3, implementada         |
| `/api/v1/organizations/:organizationId/clinics/:clinicId/improvement-plans` | plano atual, criação, transições e tarefas      | 3, implementada         |
| `/api/v1/organizations/:organizationId/clinics/:clinicId/tasks`             | transições de tarefas                           | 3, implementada         |
| `/api/v1/specialist/assignments`                                            | carteira do especialista autenticado            | 4                       |
| `/api/v1/organizations/:organizationId/recovery-rules`                      | regras e versões                                | 5                       |
| `/api/v1/organizations/:organizationId/recovery-opportunities`              | oportunidades e ações                           | 5                       |
| `/api/v1/organizations/:organizationId/quality-reviews`                     | avaliação e revisão                             | 7                       |
| `/api/v1/organizations/:organizationId/capacity`                            | snapshots e recomendações                       | 8                       |
| `/api/v1/organizations/:organizationId/ad-accounts`                         | leitura Google Ads                              | 9                       |

Operações específicas como simular, aprovar ou pausar podem usar sub-recursos/commands REST, definidos no plano detalhado da respectiva fase; não serão antecipadas sem contrato.

## Integrações e webhooks

| Rota Althion                                              | Finalidade                           | Estado                                                        |
| --------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `GET /api/v1/organizations/:organizationId/integrations`  | Estado das integrações               | Fundação                                                      |
| `POST /api/v1/integrations/helena/webhooks/:connectionId` | Receptor potencial de eventos Helena | Integração de dados opcional; desligada até documentação real |
| `GET /api/v1/organizations/:organizationId/sync-jobs`     | Status e freshness                   | Fase 6                                                        |
| `POST /api/v1/organizations/:organizationId/sync-jobs`    | Sync manual autorizado e limitado    | Fase 6                                                        |
| `/api/v1/integrations/google-ads/oauth/*`                 | OAuth e callback                     | Fase 9                                                        |

A rota de webhook proposta é uma rota da Althion; ela não presume URL, evento, header ou assinatura existente na Helena.

## Rotas proibidas

Não serão criados namespaces de prontuário, diagnóstico, prescrição, exames, urgência, telemedicina ou tratamento clínico. Dados de outro tenant nunca serão acessíveis por parâmetro alternativo, query string ou ID externo.

## Fase 4 — Cockpit do Especialista (17/07/2026)

Web (sessão + flag global `cockpit.specialist.v1` + autorização por principal/RLS):

| Rota web         | Entrega                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `/cockpit`       | carteira do Especialista: saúde, SLA, capacidade e próxima ação             |
| `/cockpit/conta` | conta por `organizationId`+`clinicId`: razões, ações, incidentes e reuniões |

API:

```text
GET  /api/v1/cockpit/portfolio                     # autorização pelo principal; linhas via RLS
GET  /api/v1/organizations/:orgId/clinics/:clinicId/cockpit/account   # cockpit:read
GET|POST /api/v1/organizations/:orgId/clinics/:clinicId/incidents     # incident:read|manage
POST /api/v1/organizations/:orgId/clinics/:clinicId/incidents/:id/transitions
GET|POST /api/v1/organizations/:orgId/clinics/:clinicId/meetings      # meeting:read|manage
POST /api/v1/organizations/:orgId/clinics/:clinicId/meetings/:id/transitions
```

## Fase 5 — Recovery (17/07/2026)

Web (sessão + flag global `recovery.engine.v1` + capability + RLS):

| Rota                | Entrega                                                                    |
| ------------------- | -------------------------------------------------------------------------- |
| `/cockpit/recovery` | simulações, fila de oportunidades/ações e supressões por conta (sintético) |

API:

```text
GET  /api/v1/organizations/:orgId/clinics/:clinicId/recovery/queue        # recovery:read
POST /api/v1/organizations/:orgId/clinics/:clinicId/recovery/simulations  # recovery:simulate
POST .../recovery/opportunities/:opportunityId/decisions                  # recovery:decide
POST .../recovery/actions/:actionId/decisions                             # recovery:decide
POST .../recovery/suppressions                                            # suppression:manage
POST .../recovery/suppressions/:suppressionId/revoke                      # suppression:manage
```

Nenhuma rota executa contato: o resultado final de uma ação é `approved`, `rejected` ou `expired`.
