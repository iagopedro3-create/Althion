# Evidências de isolamento — Fases 1, 2 e 3

## Suíte criada

`supabase/tests/tenancy_rls.test.sql` contém testes negativos e positivos para:

- owner limitado ao próprio tenant;
- manager limitado à clínica atribuída;
- viewer sem mutation;
- Especialista limitado a assignments;
- integração invisível para outro tenant;
- command de membership restrito a owner/platform;
- command idempotente com um único audit log;
- foreign key composta bloqueando relação cross-tenant;
- revogação removendo acesso no request seguinte.

`supabase/tests/radar_score_rls.test.sql` adiciona 22 assertions para:

- pesos, estado draft e imutabilidade de fórmula publicada;
- criação e envio idempotentes;
- cálculo esperado, cobertura, evidências e recomendações;
- `insufficient_data` sem nota numérica;
- owner/manager/especialista dentro do escopo;
- operator e viewer sem mutation;
- isolamento cross-tenant, FKs compostas e auditoria sanitizada.

`supabase/tests/client_portal_rls.test.sql` adiciona 36 assertions para:

- flag do Portal deny-by-default;
- criação/transição idempotente de solicitações, planos e tarefas;
- transições inválidas e unicidade de plano ativo;
- históricos append-only e timestamps coerentes;
- owner/manager dentro do escopo;
- doctor limitado às solicitações próprias;
- viewer somente leitura e operator sem acesso;
- Especialista limitado ao assignment ativo;
- isolamento cross-tenant e FKs compostas;
- auditoria sem texto livre da solicitação.

## Execução local

Pendente no ambiente atual. `docker` não está instalado/disponível e `pnpm db:start` não pode subir a stack local. A Supabase CLI 2.109.1 está fixada no projeto, mas `supabase test db` exige runtime Docker compatível. São 73 assertions versionadas e nenhuma foi tratada como aprovada sem execução.

## Execução CI

O job `database` em `.github/workflows/ci.yml` sobe Supabase local, recria o banco pelas migrations, executa lint e pgTAP. O job deverá estar verde antes de merge/deploy.

Esta pendência não deve ser confundida com teste aprovado. A evidência será atualizada com data, commit e saída quando Docker local ou CI remoto estiver disponível.

## Fase 4 — Cockpit (17/07/2026)

`supabase/tests/cockpit_rls.test.sql` adiciona 27 assertions (total do repositório: 100): flag deny-by-default; default de complexidade; criação/idempotência/conflito de incidente; transições válidas e inválidas; reunião agendada/concluída/terminal; negação de owner, manager, doctor, viewer e operator em leitura e escrita; negação cross-tenant e FK composta; históricos append-only; auditoria sem texto livre; registros de idempotência; e revogação imediata com assignment encerrado. Execução pendente de Docker/CI, como nas fases anteriores.

## Fase 5 — Recovery (17/07/2026)

`supabase/tests/recovery_rls.test.sql` adiciona 28 assertions (total do repositório: 128): flag deny-by-default; consentimento e simulação pelo Especialista; idempotência da simulação; revalidação de consentimento e supressão no banco (erros `Candidate without granted consent` e `Candidate is suppressed`); owner lê e decide mas não simula; decisões terminais; unicidade de supressão ativa; negação de doctor, viewer, operator e tenant B; FK composta cross-tenant; histórico append-only; auditoria sem payload de lead; registros de idempotência; e revogação imediata de acesso com assignment encerrado. Execução pendente de Docker/CI.
