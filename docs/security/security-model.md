# Modelo de segurança e privacidade

## Status

Baseline e controles das Fases 1 e 2. Autenticação, capabilities, RLS, constraints compostas, auditoria, idempotência, rate limit, redaction, Radar e Score foram implementados. A execução local de pgTAP depende de Docker e as decisões jurídicas continuam sujeitas a validação especializada e contratos.

## Objetivos

- impedir acesso entre organizações;
- limitar acesso ao mínimo necessário por papel, clínica, unidade e assignment;
- proteger credenciais, dados pessoais e evidências administrativas;
- assegurar autoria, integridade, idempotência e auditoria de ações;
- impedir uso do produto para funções clínicas;
- atender direitos, retenção, descarte e incidentes conforme LGPD e contratos;
- manter operação e integrações recuperáveis e observáveis.

## Classificação de dados

| Classe                          | Exemplos Althion                                            | Tratamento                                                                         |
| ------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Pública                         | conteúdo institucional aprovado                             | pode ser cacheado/publicado                                                        |
| Interna                         | documentação técnica e métricas agregadas sem identificação | acesso de equipe e ambientes separados                                             |
| Confidencial                    | configuração de tenant, regras, contratos, relatórios       | autenticação, RBAC, RLS e auditoria                                                |
| Pessoal restrita                | identidade/contato, histórico administrativo de atendimento | minimização, criptografia, finalidade, retenção e acesso restrito                  |
| Segredo                         | tokens, service role, chaves, assinatura, senha             | cofre, rotação, nunca em log/bundle/banco comum                                    |
| Conteúdo potencialmente clínico | mensagem ou arquivo espontâneo                              | não interpretar; não persistir/processar por padrão; encaminhar conforme protocolo |

Mesmo eventos administrativos ligados à saúde podem revelar relação com uma clínica e merecem proteção reforçada.

## Limite clínico

A plataforma não coleta campos de diagnóstico, prescrição, exame, prontuário, urgência ou tratamento. Interfaces, prompts, schemas, eventos e exports não oferecem espaço livre para esses dados quando um código controlado atende à finalidade.

Se conteúdo potencialmente clínico chegar por integração:

1. não produzir orientação ou interpretação;
2. não executar OCR, RAG ou treinamento;
3. sinalizar necessidade de handoff conforme protocolo aprovado;
4. manter conteúdo na fonte oficial sempre que possível;
5. persistir apenas flag e resultado administrativo minimizado;
6. aplicar retenção curta e acesso excepcional se tratamento temporário for aprovado.

## Papéis e autorização

| Papel                     | Escopo                             | Permissões principais                                           | Restrições                                                        |
| ------------------------- | ---------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| `platform_admin`          | plataforma                         | provisionamento, saúde, incidentes e suporte justificado        | MFA; acesso excepcional auditado; não é bypass informal de tenant |
| `organization_owner`      | organização                        | configurações, memberships, clínicas, relatórios e regras       | somente sua organização                                           |
| `clinic_manager`          | clínicas/unidades autorizadas      | operação, indicadores, solicitações e aprovações                | não administra outra clínica sem escopo                           |
| `doctor`                  | escopo autorizado                  | leitura administrativa de agenda/indicadores e ações permitidas | sem acesso global nem função clínica na Althion                   |
| `relationship_specialist` | assignments ativos                 | carteira, planos, alertas, tarefas, incidentes e recomendações  | somente clientes atribuídos; sem acesso clínico                   |
| `operator`                | clínicas/unidades/filas permitidas | tratar tarefas e ações administrativas aprovadas                | sem configurações, auditoria ampla ou exports irrestritos         |
| `viewer`                  | escopo concedido                   | leitura                                                         | nenhuma mutation                                                  |

Permissão é calculada por ação e recurso, não apenas pela rota. O mesmo papel pode ter escopos distintos.

## Autenticação

- Supabase Auth é a autoridade de identidade inicial.
- Sessões usam cookies seguros/HttpOnly quando aplicável e proteção CSRF nas mutations baseadas em cookie.
- A API valida JWT por JWKS, emissor, audiência, expiração e algoritmo permitido.
- MFA é obrigatório para plataforma e recomendado/gradualmente exigido para owners e especialistas.
- Recuperação de acesso não revela existência da conta.
- Reautenticação é exigida para ações sensíveis como conceder admin, exportar ou rotacionar integração.
- Remoção, revogação ou expiração de membership bloqueia novas operações imediatamente; sessões longas não carregam permissões imutáveis.

## RLS e isolamento multi-tenant

Regras de implementação:

1. RLS habilitada e forçada em todas as tabelas expostas tenant-owned.
2. Ausência de policy significa negação; nenhuma policy pública ou `anon` para dados de cliente.
3. `USING` controla leitura/alvo e `WITH CHECK` impede gravação em outro tenant.
4. Policies consultam membership/assignment ativo e escopo coerente.
5. Foreign keys compostas impedem relações cross-tenant mesmo sob processo privilegiado.
6. Funções auxiliares de autorização têm `search_path` fixo, privilégios mínimos e testes próprios.
7. Views não usam comportamento que contorne a identidade do chamador.
8. Buckets privados repetem tenant e autorização no path/policy.
9. Service role não aparece no navegador e seu uso é isolado, medido e auditado.

Testes negativos obrigatórios:

- usuário A não lê, cria, altera ou exclui dados da organização B;
- troca de UUID/path/header não altera o tenant efetivo;
- especialista sem assignment ou com assignment encerrado não acessa a clínica;
- operador fora do escopo não acessa lead/ação;
- viewer não executa mutation;
- usuário removido perde acesso;
- relação filha não aceita IDs de tenants diferentes;
- export, relatório, busca, contagem e erro não vazam existência de outro tenant;
- job/webhook com tenant divergente é rejeitado e gera alerta.

## Service role e processos privilegiados

O bypass de RLS é risco crítico. A service role:

- fica apenas em API/worker ou cofre do provedor;
- nunca usa prefixo público nem é interpolada no frontend;
- não é usada em request comum quando o JWT do usuário basta;
- opera por repository que exige `organization_id` explícito;
- registra propósito, origem, correlation ID e contagens;
- tem chamadas monitoradas e, quando possível, credenciais separadas por workload;
- não retorna payload irrestrito para o cliente.

## API e aplicação

- DTOs validados em runtime com schemas estritos; propriedades extras são rejeitadas quando apropriado.
- Autorização antecede acesso ao recurso.
- Rate limit por IP, usuário, tenant e integração, conforme risco.
- Paginação e limites máximos em listas/exports.
- CORS allowlist por ambiente; headers de segurança e CSP no web.
- Erros públicos não expõem stack, SQL, IDs externos ou existência indevida.
- Mutations críticas usam idempotency key e optimistic concurrency/version quando necessário.
- Logs têm correlation ID, mas redaction central remove PII e segredos.

### Radar e Score

- inputs são contagens agregadas; campos livres são opcionais, limitados e nunca entram em logs;
- navegador não envia nota persistida: o PostgreSQL calcula o snapshot a partir dos inputs autorizados;
- rascunhos são visíveis apenas a owner, manager e especialista atribuído; doctor/viewer leem somente concluídos;
- operator não possui capability de Radar/Score;
- Score, componentes, evidências, recomendações e fórmula publicada são imutáveis;
- exportação exige capability, revalida RLS, gera auditoria e neutraliza formula injection;
- `insufficient_data` usa nota nula; ausência de dados não é convertida em zero;
- fórmula provisória não é benchmark, qualidade clínica ou verdade financeira.

### Portal do Cliente

- feature flag `portal.client.v1` é avaliada no servidor e desabilitada por padrão;
- leituras usam JWT do usuário e cliente Supabase user-scoped; nenhuma service role vai ao navegador;
- capabilities na API e RLS no PostgreSQL validam organização, clínica, papel e assignment;
- `doctor` lê apenas solicitações próprias; `viewer` não altera; `operator` não acessa o Portal;
- mutations usam RPCs transacionais, transições determinísticas e idempotency key estável desde o navegador;
- tabelas de histórico são append-only e tabelas de negócio não concedem escrita direta a `authenticated`;
- FKs compostas impedem relacionar request, plano, tarefa, Score ou recomendação de outro tenant;
- auditoria de request/plano/tarefa não registra assunto, detalhe ou título livre;
- formulários alertam contra nome de paciente, diagnóstico, exame, medicamento ou dado clínico;
- estados ausentes são explícitos; o Portal não fabrica Score, Especialista, agenda, recuperação ou impacto;
- listas têm limites e paginação keyset por timestamp/UUID para evitar perda/duplicação em empates.

## Webhooks e integrações

Um webhook só será habilitado após contrato oficial. Controles mínimos:

- TLS e allowlist quando oficialmente suportada;
- assinatura verificada sobre bytes originais e comparação constant-time;
- timestamp/janela anti-replay;
- vínculo inequívoco entre connection e organização;
- limite de tamanho, content type e schema;
- deduplicação por event ID ou fingerprint robusto;
- resposta rápida após persistência segura; processamento assíncrono;
- retry/dead letter monitorados;
- rotação de segredo sem indisponibilidade;
- payload bruto não entra em log e tem retenção mínima se for indispensável.

## IA e Quality Engine

IA não é parte da Fundação. Quando introduzida:

- somente modelos/provedores aprovados contratualmente;
- opt-out de treinamento e retenção mínima quando disponível;
- input limitado ao conteúdo administrativo necessário;
- anexos, OCR e RAG permanecem bloqueados;
- conteúdo externo é tratado como não confiável contra prompt injection;
- output segue schema, guarda modelo/prompt/versão e confiança;
- gatilhos clínicos geram handoff, nunca resposta médica;
- avaliação automática começa em modo assistido com revisão humana;
- decisões de contato, supressão e frequência continuam determinísticas.

## Criptografia e segredos

- TLS em trânsito e criptografia gerenciada em repouso.
- Campos pessoais de alto risco recebem criptografia de aplicação se precisarem ser persistidos; chaves ficam fora do banco.
- Busca/deduplicação pode usar hash/HMAC normalizado com chave rotacionável, após análise de finalidade.
- Segredos ficam em secret manager por ambiente, com rotação e acesso least-privilege.
- `.env.example` contém somente nomes e valores inofensivos.
- secret scanning bloqueia commits; dependências e imagens passam por auditoria.
- backups são criptografados, com acesso restrito e restore testado.

## Logging e auditoria

Logs técnicos não armazenam:

- tokens, cookies, senhas, chaves ou assinaturas;
- corpo de mensagem, anexo ou texto potencialmente clínico;
- telefone/e-mail completos;
- payload bruto de webhook;
- SQL com parâmetros pessoais.

Audit log registra ator/tipo, tenant quando aplicável, ação, recurso, horário, resultado e metadata sanitizada. Acesso e export da própria auditoria também são auditados. Integridade/imutabilidade e retenção serão definidas antes do piloto.

## LGPD e ciclo de vida

Antes de usar dados reais:

- mapear finalidades, categorias, titulares, fontes, destinatários e transferências;
- definir contratualmente controlador, operador e suboperadores; não assumir os papéis sem revisão jurídica;
- manter registro das operações e avaliação de impacto para processamento de maior risco;
- definir base legal por finalidade — consentimento não é automaticamente a única base;
- implementar canal e workflow para acesso, correção, oposição, portabilidade e eliminação aplicáveis;
- registrar consentimento, retirada e supressão quando consentimento for usado;
- publicar retenção por categoria e executar descarte verificável;
- listar suboperadores e gerir mudanças contratuais;
- possuir processo de incidente, preservação de evidência e comunicação conforme obrigação aplicável.

## Retenção proposta para aprovação

Não são prazos finais; são classes a serem preenchidas por jurídico/negócio:

| Categoria                   | Direção                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| IDs/metadados sincronizados | janela necessária à operação e reconciliação                     |
| Analytics/scores agregados  | histórico contratual com minimização                             |
| Conteúdo de conversa        | não persistir por padrão; temporário excepcional                 |
| Anexos espontâneos          | não persistir; descarte imediato/curto conforme protocolo        |
| Audit logs                  | prazo de segurança/contrato aprovado, com acesso restrito        |
| Relatórios exportados       | TTL curto e renovação explícita                                  |
| Backups                     | janela definida, expiração e propagação de exclusão documentadas |

## Gestão de incidentes

- severidade e owner definidos;
- detecção, contenção, erradicação, recuperação e retrospectiva;
- runbooks para vazamento cross-tenant, segredo exposto, webhook abusado, sync incorreto e indisponibilidade;
- canal de escalonamento e contatos contratuais;
- exercícios em staging antes do piloto;
- postmortem sem culpa com ações e prazos;
- incidentes de segurança nunca são resolvidos apenas apagando logs.

## Critérios de segurança para concluir a Fase 1

- threat model revisado e owners definidos;
- migrations com RLS/grants revisadas por pelo menos duas pessoas;
- suíte negativa de isolamento passando local e CI;
- service role ausente do bundle e testes de configuração;
- secrets scan e dependency audit no CI;
- dados exclusivamente sintéticos;
- logs estruturados com testes de redaction;
- auditoria de mutations de acesso e configuração;
- documentação de acesso, revogação, backup e incidente;
- nenhuma rota/tabela/campo clínico;
- revisão manual de headers, cookies e fluxos de autenticação.

## Fase 4 — Cockpit (17/07/2026)

- Novas capabilities: `cockpit:read`, `incident:read`, `incident:manage`, `meeting:read`, `meeting:manage`. Concedidas apenas a `relationship_specialist` (via assignment ativo) e implícitas para `platform_admin`. `organization_owner` deixou de receber o conjunto completo automaticamente: o conjunto do papel é explícito e exclui o Cockpit.
- `app_private.can_access_cockpit(org, clinic)` = `is_platform_admin()` OU `is_assigned_specialist(org, clinic)` (status ativo + janela `starts_at`/`ends_at`); o fim do assignment revoga leitura e escrita imediatamente.
- Incidentes e reuniões são registros operacionais internos: nenhum papel tenant lê ou escreve (decisão provisória documentada em `docs/plans/phase-4-cockpit.md`).
- RPCs `security definer` com `search_path = ''`, idempotência (escopos `cockpit.*`), históricos append-only e auditoria sem `subject`/`details`/`summary`.
- `/api/v1/cockpit/portfolio` não usa capability por rota (sem organizationId); autoriza pelo principal e delega cada linha ao RLS.

## Fase 5 — Recovery (17/07/2026)

- Novas capabilities: `recovery:read`, `recovery:simulate`, `recovery:decide`, `suppression:read`, `suppression:manage`. `recovery:simulate` integra o conjunto interno (com as do Cockpit) que nunca é concedido automaticamente a papéis tenant; `organization_owner` e `clinic_manager` leem, decidem e gerenciam supressões, mas não simulam. `doctor`, `viewer` e `operator` não possuem nenhuma.
- `app_private.can_read_recovery` = platform_admin OU Especialista com assignment ativo OU owner/manager com acesso à clínica; `app_private.can_simulate_recovery` = platform_admin OU Especialista com assignment ativo.
- Defesa em profundidade: `run_recovery_simulation` revalida consentimento (`granted` obrigatório), supressão ativa e limites de frequência no banco antes de persistir cada candidato — uma API comprometida não consegue burlar a governança.
- Aprovar uma ação exige oportunidade aprovada; decisões são terminais, expiram em 14 dias e exigem `decided_by`.
- Auditoria registra apenas metadados (regra, decisão, contadores); rótulo do lead, evidência e referência externa nunca entram em `audit_logs`.
- Nenhuma superfície executa contato: o estado `executed` não existe no schema desta fase.
