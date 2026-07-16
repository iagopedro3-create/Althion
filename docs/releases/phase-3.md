# Fase 3 — Portal do Cliente

## Resultado

Implementada em 16 de julho de 2026 no branch `codex/phase-3-client-portal`. O Portal transforma dados já sustentados pelo Radar/Score e pela Fundação em problemas, oportunidades e próximas ações administrativas, sem antecipar Recovery, agenda ou integração Helena.

A feature flag `portal.client.v1` é `false` por padrão e foi habilitada somente para a organização sintética A no seed local.

## Escopo entregue

### Dashboard e leitura operacional

- centro de performance por organização e clínica;
- Althion Score com cobertura, fórmula e estado explícito de dados insuficientes;
- histórico discreto antes de oito snapshots e gráfico acessível a partir de oito;
- prioridades derivadas exclusivamente das recomendações determinísticas do Radar;
- progresso do plano sem contar tarefas canceladas;
- solicitações abertas, tarefas vencidas e Especialista atribuído;
- estado, fonte e freshness sem fallback fictício;
- tabela equivalente aos valores do gráfico.

### Fluxos do cliente

- indicadores e evidências do Score;
- oportunidades administrativas do Radar;
- solicitações com categoria, prioridade, detalhe, histórico e transições;
- plano de melhoria versionado, tarefas, responsáveis, prazos e transições;
- perfil do Especialista de Relacionamento baseado em assignment ativo;
- catálogo de relatórios existentes;
- integrações e configurações em leitura.

Leads, agenda, ações do Recovery e performance do Quality Engine aparecem apenas como fontes indisponíveis ou módulos futuros. Nenhuma consulta, contato, recuperação ou impacto financeiro é inventado.

## Banco e isolamento

A migration `20260716160000_client_portal.sql` adiciona:

- `requests` e `request_status_history`;
- `improvement_plans` e `improvement_plan_status_history`;
- `tasks` e `task_status_history`;
- enums de categoria, prioridade, status e transições;
- FKs compostas por organização e clínica;
- índices de leitura e unicidade de um plano ativo por clínica;
- históricos append-only;
- RPCs transacionais para criação/transição;
- idempotência por tenant, escopo, chave e hash do payload;
- auditoria sem assunto, detalhe ou título livre;
- RLS deny-by-default para owner, manager, doctor, viewer, operator e Especialista.

O `doctor` lê planos/tarefas e só lê as próprias solicitações. O `viewer` é somente leitura. O `operator` não acessa o Portal. O Especialista depende de assignment ativo e limitado à clínica. Mutations autenticadas não recebem grants diretos nas tabelas.

## API

Endpoints implementados sob:

```text
/api/v1/organizations/:organizationId/clinics/:clinicId/portal
/api/v1/organizations/:organizationId/clinics/:clinicId/requests
/api/v1/organizations/:organizationId/clinics/:clinicId/improvement-plans
/api/v1/organizations/:organizationId/clinics/:clinicId/tasks
```

Todos usam JWT validado, capability, cliente Supabase user-scoped, RLS, Zod e feature flag server-authoritative. Commands exigem `Idempotency-Key`; o navegador preserva a mesma chave até obter sucesso.

## Web

Rotas implementadas:

```text
/app
/app/indicadores
/app/oportunidades
/app/solicitacoes
/app/solicitacoes/[requestId]
/app/plano-de-melhoria
/app/especialista
/app/relatorios
/app/integracoes
/app/configuracoes
```

Server Components fazem leitura; Client Components existem somente para gráfico e mutations interativas. Tokens permanecem no servidor. Formulários alertam para não inserir dados clínicos ou de pacientes.

## Evidências

| Gate                     | Resultado                                                            |
| ------------------------ | -------------------------------------------------------------------- |
| Prettier                 | passou nos arquivos TypeScript, TSX, CSS e lockfile alterados        |
| ESLint                   | passou sem warnings                                                  |
| Typecheck                | passou em todos os workspaces                                        |
| Unit/component/contracts | Portal, autorização, estados vazios e dados insuficientes cobertos   |
| API integration          | health e negação sem bearer passaram; inclui dashboard do Portal     |
| Build                    | NestJS e Next.js passaram; todas as rotas da Fase 3 foram compiladas |
| Playwright + axe         | 2 testes públicos passaram em Chromium                               |
| Visual desktop           | 1440 px, gráfico hidratado e hierarquia completa                     |
| Visual mobile            | 390 px, sem overflow; gráfico e cards em largura integral            |
| pgTAP                    | 36 assertions da Fase 3 versionadas; execução bloqueada sem Docker   |

Evidências visuais:

- [Portal desktop](../evidence/phase-3-client-portal.png)
- [Portal mobile](../evidence/phase-3-client-portal-mobile.png)

## Limitações e bloqueios

1. Docker não está instalado/disponível neste host. A migration, os RPCs, o lint SQL e as 36 assertions pgTAP da Fase 3 não foram executados; somadas às fases anteriores, são 73 assertions pendentes de runtime PostgreSQL.
2. `packages/contracts/src/database.types.ts` foi atualizado de forma provisória e deve ser regenerado pelo Supabase CLI após `db:reset` verde.
3. Não existe Supabase remoto, staging, deploy ou usuário sintético autenticado para E2E completo do Portal.
4. Helena continua bloqueada sem documentação, sandbox, autenticação, endpoints, webhooks e rate limits oficiais.
5. A fonte oficial de agenda continua indefinida; agenda, capacidade e comparecimento não são apresentados como dados disponíveis.
6. A fórmula do Score permanece `1.0.0-provisional` e `draft`.

## Gate antes da Fase 4

- executar `pnpm db:start`, `pnpm db:reset`, `pnpm db:lint` e `pnpm test:db` em Docker/CI;
- regenerar e revisar os tipos do banco;
- executar E2E autenticado por owner, manager, doctor, viewer, operator e Especialista;
- validar a hierarquia de ações com gestores e Especialistas usando dados sintéticos;
- definir SLAs, saúde de conta, incidentes, capacidade de carteira e taxonomia de risco do Cockpit;
- manter Helena, Recovery, Quality e Capacity fora do escopo até seus próprios gates.

A Fase 4 não foi iniciada.
