# Plano de implementação da Althion

## Controle de escopo

Este plano foi criado na Fase 0. As Fases 1, 2 e 3 foram autorizadas e implementadas em 16 de julho de 2026; as Fases 4 (Cockpit) e 5 (Recovery sem execução) foram implementadas em 17 de julho de 2026 sob a mesma autorização de avanço contínuo. Código, testes e builds locais estão verdes; migrations e 128 assertions pgTAP (Fases 1–5) aguardam execução em Docker/CI antes do aceite final. A autorização contínua não elimina gates técnicos nem amplia o escopo de cada fase.

O repositório começou vazio: sem commits, remoto, stack ou landing page. Portanto, a Fundação será greenfield e não uma migração de código existente.

## Princípios de execução

- uma fase por plano e gate técnico; a autorização contínua do usuário substitui novas pausas formais;
- incrementos pequenos e revisáveis;
- regra de negócio separada de framework e provedor;
- modular monolith antes de microserviços;
- RLS e testes de isolamento desde a primeira tabela tenant-owned;
- dados sintéticos até contratos e ambiente aprovados;
- migrations aditivas; SQL destrutivo exige aprovação específica;
- nenhuma API Helena fictícia;
- nenhuma função ou campo clínico;
- definição de pronto inclui código, testes, segurança, UX, documentação e evidências.

## Fase 0 — Auditoria

### Arquivos entregues

- `docs/current-state.md`
- `docs/product/vision.md`
- `docs/product/mvp-scope.md`
- `docs/product/non-goals.md`
- `docs/architecture/architecture.md`
- `docs/architecture/route-map.md`
- `docs/architecture/data-model.md`
- `docs/architecture/integrations.md`
- `docs/data/data-dictionary.md`
- `docs/security/security-model.md`
- `docs/roadmap.md`
- `IMPLEMENTATION_PLAN.md`

### Critérios de saída

- inventário atual baseado em evidências;
- arquitetura, rotas e dados marcados como proposta, não implementação;
- Helena posicionada como motor operacional paralelo; integração de dados opcional e não bloqueante;
- riscos multi-tenant, LGPD e conteúdo clínico documentados;
- escopo e não objetivos alinhados;
- dúvidas fundacionais respondidas ou aceitas como decisões adiadas;
- aprovação explícita para iniciar a Fase 1.

## Decisões técnicas propostas

| Tema           | Proposta                                                  | Justificativa                                                                     | Estado                            |
| -------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| Repositório    | monorepo pnpm workspaces                                  | contratos/tipos compartilhados e releases coordenados sem ferramenta pesada       | Implementado                      |
| Arquitetura    | modular monolith NestJS                                   | fronteiras claras e menor custo operacional inicial                               | Implementado                      |
| Web            | Next.js App Router + TypeScript + Tailwind                | stack solicitada, SSR/RSC e acessibilidade                                        | Implementado                      |
| API            | NestJS REST `/api/v1`                                     | contratos explícitos, módulos e guards                                            | Implementado                      |
| Dados          | Supabase PostgreSQL + SQL migrations                      | Auth, RLS e Postgres solicitados                                                  | Implementado; Docker pendente     |
| Acesso a dados | Supabase user-scoped na API; RPC para transações críticas | mantém RLS com o JWT; reduz bypass privilegiado                                   | Implementado; pgTAP pendente      |
| Auth           | Supabase Auth; API valida JWT por JWKS                    | autoridade única e fronteira server-side                                          | Convite/e-mail e senha provisório |
| Testes         | Vitest, Supertest, Playwright e testes SQL/RLS            | cobertura por camada e testes negativos                                           | Código/E2E verdes; SQL pendente   |
| Assíncrono     | outbox + fila somente quando houver job real              | idempotência sem infraestrutura prematura                                         | Provedor adiado                   |
| CRM            | ports/adapters com `MockCrmProvider`                      | Helena opera em paralelo e é substituível; integração de dados opcional/desligada | Requisito confirmado              |
| Deploy         | local, staging e production separados                     | reduz risco e evita dados reais em preview                                        | Fornecedor/região a decidir       |

## Fase 1 — Fundação (implementada; validação de banco pendente)

### Objetivo

Entregar uma base executável, autenticada, multi-tenant, auditável e testada, sem funcionalidade de Radar, dashboard, Recovery real ou chamada externa.

### Incremento 1 — Workspace e qualidade

Criar:

```text
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
tsconfig.base.json
eslint.config.*
prettier.config.*
.editorconfig
.gitignore
.env.example
README.md
apps/web/
apps/api/
packages/contracts/
packages/domain/
packages/config/
packages/testing/
```

Resultados:

- scripts únicos para lint, typecheck, test e build;
- TypeScript strict e aliases controlados;
- validação de ambiente que falha no startup;
- página/shell neutro sem inventar identidade visual;
- API com health endpoints sanitizados.

### Incremento 2 — Supabase e schema de fundação

Criar:

```text
supabase/config.toml
supabase/migrations/<timestamp>_foundation.sql
supabase/migrations/<timestamp>_rls.sql
supabase/seed.sql
supabase/tests/tenancy_rls.test.sql
packages/contracts/src/database.types.ts
```

Entidades da Fase 1:

- organizations, clinics, units;
- profiles, memberships, membership_scopes, platform_roles;
- professionals, professional_units, services;
- relationship_specialists, relationship_assignments;
- feature_flags, feature_flag_overrides;
- audit_logs;
- integrations;
- idempotency_records, se já houver command que justifique seu teste.

Não criar ainda todas as tabelas do roadmap. Cada módulo adicionará suas migrations na própria fase.

### Incremento 3 — Autenticação e principal

Áreas previstas:

```text
apps/web/src/app/(auth)/
apps/web/src/app/(portal)/
apps/web/src/lib/auth/
apps/web/src/middleware.*
apps/api/src/modules/auth/
apps/api/src/modules/identity/
apps/api/src/common/guards/
apps/api/src/common/decorators/
```

Resultados:

- login/callback/recuperação conforme fluxo aprovado;
- sessão segura e logout;
- endpoint `/api/v1/me`;
- validação JWT por JWKS;
- principal com memberships/assignments atuais;
- estados loading, vazio, erro, acesso negado e sessão expirada.

### Incremento 4 — Tenancy, RBAC e RLS

Resultados:

- guardas por capability e escopo;
- repositories user-scoped;
- policies deny-by-default com `USING` e `WITH CHECK`;
- FKs compostas cross-tenant;
- revogação de membership;
- shell de organização/clínica autorizada;
- suíte negativa para todos os perfis iniciais.

### Incremento 5 — Auditoria e feature flags

Resultados:

- auditoria append-only de mutations de acesso/configuração;
- metadata sanitizada e correlation ID;
- definição global + override tenant de flag;
- feature flags server-authoritative;
- interface administrativa mínima apenas se necessária ao teste; sem dashboard de produto.

### Incremento 6 — Camada de integração

Criar estrutura equivalente a:

```text
apps/api/src/modules/integrations/domain/crm-provider.ts
apps/api/src/modules/integrations/providers/mock-crm.provider.ts
apps/api/src/modules/integrations/providers/helena-crm.provider.ts
apps/api/src/modules/integrations/providers/future-crm.provider.ts
apps/api/src/modules/integrations/README.md
packages/testing/src/fixtures/crm/
```

Resultados:

- tipos canônicos mínimos;
- mock determinístico, paginado e isolado por tenant;
- Helena desativada e lançando erro explícito `PROVIDER_NOT_CONFIGURED`;
- nenhuma URL, header ou payload Helena inventado;
- TODOs ligados ao checklist de documentação;
- contract tests do mock e do comportamento bloqueado.

### Incremento 7 — CI, observabilidade básica e documentação

Criar/ajustar, conforme provedor de Git:

```text
.github/workflows/ci.yml  # somente se GitHub for confirmado
docs/development/local-setup.md
docs/operations/runbook.md
docs/security/rls-test-evidence.md
```

Pipeline mínimo: secret scan, instalação imutável, lint, typecheck, unit, integração/RLS, build e E2E relevante. Logs estruturados e health checks entram sem dados sensíveis.

### Riscos da Fase 1

| Risco                                              | Mitigação/critério                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| RLS aparenta funcionar, mas a API usa service role | testes com JWT real/local e inspeção do bundle/configuração            |
| Schema amplo demais antes do produto               | criar somente tabelas da Fundação                                      |
| Auth UX define política sem decisão                | aprovar fluxo de convite/login antes do incremento 3                   |
| Hierarquia não reflete grupos reais                | validar Organization/Clinic/Unit com cenários piloto                   |
| Framework compartilhado vaza para domínio          | lint/boundaries e contracts canônicos                                  |
| Mock cria falsa impressão de integração            | UI/status explícito “mock” e integração de dados Helena “desligada”    |
| OneDrive afeta watchers/performance                | medir; mover workspace se causar lock/sync inconsistente               |
| Dependências atuais mudam                          | verificar releases e advisories na abertura da fase; lockfile imutável |

### Critérios de aceite da Fase 1

- `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build` passam;
- E2E mínimo de login, troca de escopo autorizada e negação passa;
- testes SQL e API provam leitura e escrita negativas entre dois tenants;
- viewer não altera; operador e especialista respeitam scopes; usuário removido perde acesso;
- service role não aparece em browser, logs ou fixtures;
- migrations sobem do zero e reaplicação/validação é documentada;
- nenhum dado real, endpoint Helena fictício ou campo clínico;
- auditoria registra mutations relevantes sem PII/segredo;
- estados de UX e navegação por teclado verificados;
- documentação local e evidências atualizadas;
- limitações e decisões adiadas listadas.

## Planos resumidos das fases seguintes

Cada plano será detalhado e reapresentado antes da fase.

### Fase 2 — Radar e Score

- schemas de questionário e inputs manuais;
- fórmula/componentes/evidências versionados;
- cálculo determinístico com dados insuficientes;
- relatório/export e histórico;
- testes de limites, pesos, períodos e rastreabilidade.

Plano detalhado: `docs/plans/phase-2-radar-score.md`. Especificação draft: `docs/product/althion-score-v1.md`.

### Fase 3 — Portal (implementada; validação de banco pendente)

- projeções de dashboard;
- indicadores, ações, solicitações, plano e integrações;
- visual responsivo, acessível e orientado a decisão;
- autorização por rota, caso de uso e RLS.

Plano detalhado: `docs/plans/phase-3-client-portal.md`. Escopo entregue source-backed: Radar/Score, recomendações, solicitações, plano/tarefas, Especialista e estado de integrações. Leads, agenda, Recovery e Quality permanecem indisponíveis enquanto suas fontes e módulos não existirem. Evidências e limitações: `docs/releases/phase-3.md`.

### Fase 4 — Cockpit (implementada; validação de banco pendente)

- assignments, saúde, SLA, incidentes, tarefas e capacidade da carteira;
- próxima melhor ação baseada em regra explicável;
- testes de acesso do Especialista e expiração do assignment.

Plano detalhado: `docs/plans/phase-4-cockpit.md`. Política operacional versionada `1.0.0-provisional` (SLA, saúde da conta, complexidade/capacidade, nove regras de próxima ação); incidentes e reuniões como registros internos com RLS exclusivo do Especialista/platform_admin. Evidências e limitações: `docs/releases/phase-4.md`.

### Fase 5 — Recovery (implementada; validação de banco pendente)

- regra/versão, simulação, run, oportunidade e ação;
- consentimento, supressão, frequência, aprovação e idempotência;
- sem execução de contato pela Althion; o contato é executado pela Helena, que opera em paralelo.

Plano detalhado: `docs/plans/phase-5-recovery.md`. Política `1.0.0-provisional` com duas regras determinísticas sobre o `MockCrmProvider`; consentimento deny-by-default, supressão e frequência revalidados no banco; nenhuma execução de contato (o estado `executed` não existe no schema). Evidências e limitações: `docs/releases/phase-5.md`.

### Fase 6 — Integração de dados com a Helena (opcional, não bloqueante)

- autenticação e endpoints apenas conforme documentação oficial;
- adapter mapping, backfill, incremental, webhook e reconciliação;
- retry/dead letter, métricas e runbooks;
- contract/integration tests em sandbox.

### Fase 7 — Quality

- critérios e rubricas versionados;
- avaliação assistida, revisão humana, correção e feedback;
- guardrail clínico, minimização e avaliação de provedor de IA.

### Fase 8 — Capacity

- definição de slot e snapshots;
- baixa ocupação e elegibilidade;
- recomendação, explicação, simulação e histórico;
- nenhuma automação irrestrita.

### Fase 9 — Google Ads

- OAuth e secrets server-side;
- leitura, sync, métricas e alertas;
- atribuição com cobertura/incerteza;
- nenhuma mutation de campanha.

### Fase 10 — Segurança e piloto

- matriz E2E por papel/tenant;
- carga, acessibilidade e revisão de segurança;
- restore de backup, incident drills e staging;
- onboarding, demo sintética e checklist go/no-go.

## Dependências sugeridas

Nenhuma foi instalada. Versões devem ser verificadas e fixadas no lockfile somente após aprovação.

### Fundação

| Dependência/ferramenta                    | Uso                       | Observação                                |
| ----------------------------------------- | ------------------------- | ----------------------------------------- |
| Node.js LTS + Corepack + pnpm             | runtime e workspace       | registrar versão em arquivo/toolchain     |
| TypeScript                                | tipagem estrita           | `strict`, sem `any` implícito             |
| Next.js + React                           | web                       | App Router e Server Components por padrão |
| NestJS                                    | API modular               | REST inicial                              |
| Tailwind CSS                              | estilos/tokens            | preservar identidade quando existir       |
| `zod`                                     | DTO/config runtime        | schemas compartilháveis                   |
| `@supabase/supabase-js` e `@supabase/ssr` | Auth e acesso user-scoped | service role apenas server-side           |
| `jose`                                    | validação JWT/JWKS na API | validar issuer/audience/algoritmo         |
| `pino`/integração Nest                    | logs JSON e redaction     | fornecedor de observabilidade adiado      |

### Testes e qualidade

| Dependência/ferramenta                              | Uso                     |
| --------------------------------------------------- | ----------------------- |
| Vitest + Testing Library                            | unit/component          |
| `@nestjs/testing` + Supertest                       | integração HTTP         |
| Playwright + axe                                    | E2E e acessibilidade    |
| Supabase CLI + pgTAP                                | banco, migrations e RLS |
| ESLint + Prettier                                   | lint e formatação       |
| Gitleaks (ou equivalente aprovado)                  | detecção de segredos    |
| auditoria do package manager/Dependabot equivalente | vulnerabilidades        |

### Adiadas até necessidade real

- React Hook Form e resolvers Zod: instalados na Fase 2 para o formulário do Radar;
- biblioteca de gráficos: Fase 2/3 após requisitos de acessibilidade e export;
- BullMQ/Redis ou fila gerenciada: Fase 5/6 após escolher infraestrutura;
- OpenTelemetry e error tracking: fornecedor definido antes de staging;
- SDK de IA: Fase 7 após revisão de privacidade;
- Google Ads SDK: Fase 9.

Não se propõe ORM na Fundação. SQL migrations, tipos gerados e acesso Supabase user-scoped reduzem duplicação de autorização. Essa decisão será reavaliada após um spike com queries transacionais reais; adicionar ORM sem modelo de RLS validado pode incentivar bypass via conexão privilegiada.

## Estratégia de branches e commits

Após confirmar o provedor/remoto:

- branch principal protegida;
- branches `codex/<escopo>` ou convenção aprovada;
- commits separados por scaffold, schema/RLS, auth, providers e testes;
- refatoração não misturada com feature;
- migrations nunca reescritas depois de aplicadas em ambiente compartilhado;
- pull request exige CI e revisão de segurança para schema/policies.

## Dúvidas e bloqueios

### Bloqueios externos

1. Integração de dados Helena: documentação, sandbox, autenticação, rate limits, webhooks e capabilities ausentes. Bloqueia apenas a Fase 6 (opcional). A Helena opera em paralelo independentemente disso e não bloqueia o roadmap.
2. Agenda: operada externamente por cliente (sistema próprio, Google Agenda etc.) e integrada via Helena — a Althion não mantém fonte de agenda própria nem precisa decidi-la. Disponibilidade, agendamento, confirmação, cancelamento, falta e comparecimento chegam à Althion pela integração de dados opcional da Helena; até lá, métricas dependentes e partes de Recovery/Capacity usam inputs manuais/sintéticos.
3. LGPD/contratos: papéis, bases legais, retenção, descarte, suboperadores e transferência internacional não aprovados. Bloqueia dados reais/piloto.
4. Infraestrutura: projetos/contas, região de dados, hosting, domínio e ownership não definidos. Não impede scaffold local, mas bloqueia staging.

### Decisões de produto/operação

1. Organization representa grupo econômico, contratante ou uma clínica independente?
2. Um usuário pode ter múltiplos papéis no mesmo tenant ou um papel efetivo com scopes?
3. Qual acesso administrativo um `doctor` precisa no MVP?
4. Como filas permitidas do operador serão mapeadas sem acoplar à Helena?
5. Qual é o fluxo inicial de Auth: convite + senha, magic link, OTP ou SSO?
6. Quais taxonomias definem status/motivo de lead, perda, appointment e ação?
7. Quem é o owner nominal da fórmula Althion Score v1 e quais thresholds serão calibrados antes da publicação?
8. Quais SLAs e limites de frequência serão padrão e quais são configuráveis?
9. Quais canais e protocolos de escalonamento humano estão aprovados?
10. Quais identidade visual, copy e documentos jurídicos devem orientar o site?

## Critérios para encerrar a Fase 3 e iniciar a Fase 4

1. Executar `db:start`, `db:reset`, `db:lint` e as 73 assertions pgTAP em host/CI com Docker.
2. Regenerar `packages/contracts/src/database.types.ts` pelo schema executado e revisar o diff.
3. Repetir lint, typecheck, testes, build e E2E após a geração dos tipos.
4. Provisionar usuários exclusivamente sintéticos para E2E autenticado do Radar e Portal por papel.
5. Revisar migrations, functions `security definer`, grants e policies por segunda pessoa.
6. Manter a integração de dados Helena desligada (opcional), fórmula `draft` e dados exclusivamente sintéticos.
7. Definir owner nominal e plano de calibração antes de publicar a fórmula oficial.
8. Revisar as limitações em `docs/releases/phase-2.md` e `docs/releases/phase-3.md`.
9. Definir SLAs, saúde da conta, incidentes, reuniões, complexidade, capacidade e risco do Cockpit.
10. Criar o plano, arquivos, riscos e critérios detalhados da Fase 4 antes de alterar código desse módulo.

Atualização de 17 de julho de 2026: sob a autorização de avanço contínuo, a Fase 4 foi planejada (`docs/plans/phase-4-cockpit.md`) e implementada com os gates de banco ainda pendentes — as definições do item 9 foram adotadas como política provisória versionada e o item 10 foi cumprido antes de qualquer código do módulo. Os gates 1–8 permanecem obrigatórios para o aceite final das Fases 1–4 e agora somam 100 assertions pgTAP.
