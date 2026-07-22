# Arquitetura de integrações

## Princípio

A Althion depende de capacidades externas, não de um fornecedor específico. O domínio consome modelos e erros canônicos. Cada adaptador traduz autenticação, paginação, rate limits, enums e payloads do provedor.

## Contrato CRM proposto

O contrato exato será tipado na Fase 1. A forma conceitual é:

```ts
interface CrmProvider {
  getCapabilities(): Promise<CrmCapabilities>;
  listContacts(input: SyncPageInput): Promise<Page<Contact>>;
  listLeads(input: SyncPageInput): Promise<Page<Lead>>;
  listConversations(input: SyncPageInput): Promise<Page<Conversation>>;
  listMessages(input: SyncPageInput): Promise<Page<Message>>;
  listPipelines(input: SyncPageInput): Promise<Page<Pipeline>>;
  listOpportunities(input: SyncPageInput): Promise<Page<Opportunity>>;
  updateOpportunity(input: UpdateOpportunityInput): Promise<void>;
  createTask(input: CreateTaskInput): Promise<void>;
}
```

Os tipos acima são Althion. Paginação, nomes de status e DTOs externos permanecem privados ao adaptador.

```text
CrmProvider
├── HelenaCrmProvider   # integração de dados opcional, desligada por padrão
├── MockCrmProvider     # fixtures sintéticas e determinísticas
└── FutureCrmProvider   # ponto de extensão, sem implementação especulativa
```

`getCapabilities` permite declarar capacidades ausentes sem fingir suporte. Métodos não suportados retornam erro canônico `CAPABILITY_NOT_SUPPORTED`; configuração incompleta retorna `PROVIDER_NOT_CONFIGURED`.

## Estado da integração Helena

**A Helena opera em paralelo.** Ela é um CRM operacional completo e autônomo (WhatsApp, Instagram, webhooks, agentes e supervisor de IA) que executa contato e conversa por conta própria. A Althion funciona **ao lado** dela como camada de inteligência, recuperação e score, sem depender da Helena como fonte de verdade para operar.

A **integração de dados** Althion↔Helena (consumir Helena como fonte oficial de conversas, leads etc.) é **opcional, desligada por padrão e não bloqueia o roadmap**. Enquanto não é ligada, o `MockCrmProvider` sustenta o domínio. O repositório ainda não contém documentação, SDK, collection, schema, credenciais de sandbox ou exemplos de webhook oficiais; portanto nenhum endpoint, método de autenticação, limite ou evento é assumido.

Na Fase 1 foram implementados:

- interface e modelos canônicos mínimos;
- `MockCrmProvider` com dados sintéticos;
- `HelenaCrmProvider` vazio que falha explicitamente como não configurado (`PROVIDER_NOT_CONFIGURED`);
- integração de dados desabilitada por padrão;
- testes do contrato usando o mock;
- TODOs que apontam para os requisitos documentais abaixo.

## Requisitos para ativar a integração de dados (opcional)

A Helena não depende disto para funcionar. Antes de ligar a integração de dados, obter e validar:

1. ambientes, base URLs oficiais e sandbox;
2. autenticação, rotação, scopes e segregação por cliente;
3. paginação, filtros incrementais, ordenação e cursores;
4. contratos oficiais para contatos, leads, conversas, mensagens, funis e oportunidades;
5. operações oficialmente suportadas para atualizar oportunidade e criar tarefa;
6. catálogo de eventos/webhooks, entrega, assinatura, timestamp e replay;
7. IDs estáveis, formato de datas, timezone e semântica de exclusão;
8. rate limits, quotas, erros, retries e SLA;
9. política de retenção, exportação e exclusão;
10. versionamento, depreciação e changelog;
11. limites da licença white label e responsabilidades de suporte;
12. disponibilidade de agenda, confirmação, cancelamento, falta e comparecimento.

Esse inventário descreve capacidades necessárias, não endpoints presumidos.

## Fonte oficial de dados

| Informação                        | Fonte oficial inicial | Persistência Althion                                                               |
| --------------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| Conversas                         | Helena                | ID, metadados necessários, eventos e agregações; conteúdo não replicado por padrão |
| Mensagens                         | Helena                | ID, direção, timestamps e atributos analíticos minimizados                         |
| Contatos operacionais             | Helena                | referência externa e projeção mínima normalizada                                   |
| Funis                             | Helena                | IDs, versão/snapshot mínimo para interpretar oportunidade                          |
| Oportunidades CRM                 | Helena                | referência, estado normalizado e histórico necessário                              |
| Agentes de IA                     | Helena                | identidade externa e métricas aprovadas                                            |
| Operadores                        | Helena                | identidade externa e escopo necessário, sem duplicar gestão                        |
| Organizações e clínicas           | Althion               | registro transacional próprio                                                      |
| Especialistas e assignments       | Althion               | registro transacional próprio                                                      |
| Regras e ações de recuperação     | Althion               | registro transacional e auditável                                                  |
| Althion Score                     | Althion               | fórmula, inputs, componentes e histórico                                           |
| Relatórios e analytics históricos | Althion               | agregações e snapshots com provenance                                              |
| Quality e Capacity                | Althion               | avaliações/recomendações derivadas e explicáveis                                   |
| Google Ads                        | Google/Althion        | fatos externos normalizados e snapshots; recomendações próprias                    |
| Solicitações                      | Althion               | registro transacional próprio                                                      |
| Agenda e comparecimento           | **Indefinida**        | bloqueio para métricas e engines dependentes                                       |

## Dados externos e provenance

Registros normalizados devem carregar, quando aplicável:

- `organization_id`;
- `integration_id`;
- `source_system` e `source_record_id`;
- `source_observed_at` e `synced_at`;
- `source_updated_at`, se o provedor garantir sua semântica;
- versão do mapeamento;
- hash do payload para deduplicação, sem guardar payload bruto por padrão;
- qualidade/freshness do dado.

Uma constraint única por tenant, integração, tipo e ID externo impede colisão entre clientes.

## Estratégia de sincronização futura

1. Backfill paginado, limitado e reiniciável.
2. Sync incremental por cursor/timestamp somente se o contrato garantir consistência.
3. Webhooks para baixa latência quando houver assinatura oficial.
4. Reconciliação periódica para corrigir eventos perdidos.
5. Upsert idempotente e histórico apenas dos fatos relevantes.
6. Checkpoint atualizado somente após persistência completa da página/lote.
7. Retry transitório, dead letter e reprocessamento auditado.
8. Monitoramento de lag, completude, erro, quota e divergência.

Eventos recebidos são não confiáveis até autenticação, validação de schema, vínculo da conexão ao tenant, verificação de replay e deduplicação.

## Mapeamento e anticorrupção

- enums externos são mapeados para enums canônicos com fallback `unknown` observável;
- timestamps são normalizados para UTC, preservando timezone de origem quando relevante;
- números de telefone e e-mails são normalizados somente para a finalidade aprovada;
- mudanças desconhecidas de schema vão para erro monitorado, não são descartadas silenciosamente;
- regras de negócio não recebem payload bruto;
- logs nunca contêm token, assinatura, mensagem integral ou anexo.

## Escritas no CRM

`updateOpportunity` e `createTask` ficam desabilitados até comprovação do contrato. Quando habilitados:

- exigem capability declarada;
- usam idempotency key quando suportada; caso contrário, deduplicação local robusta;
- registram autor, regra, aprovação, request sanitizado e resultado;
- aplicam rate/frequency limits e circuit breaker;
- não enviam conteúdo clínico;
- falhas ambíguas são reconciliadas antes de retry para evitar duplicidade.

## MockCrmProvider

O mock deverá ser determinístico e cobrir:

- paginação e incremental sync;
- lead sem resposta e atendido sem agendamento;
- cancelamento, falta e horário vago apenas com fonte sintética declarada;
- IDs iguais em tenants diferentes para provar isolamento;
- status desconhecido, dado incompleto, duplicata e evento fora de ordem;
- rate limit, timeout, erro transitório e erro permanente;
- contato consentido e contato suprimido;
- ausência de conteúdo clínico ou dado real.

## Google Ads

Somente na Fase 9 e inicialmente leitura. OAuth, contas, campanhas e métricas serão isolados atrás de um `AdsProvider`. No protótipo atual, credenciais sintéticas ficam em `app_private`, a tabela pública expõe apenas metadados de conexão e valores sem prefixo `mock_` são rejeitados. Toda recomendação terá evidência, explicação e risco. Não haverá mutation na conta de anúncios nessa fase.

## Critérios para ativar a integração de dados (opcional)

Requisitos para ligar a integração Althion↔Helena. A Helena continua operando em paralelo independentemente deles:

- documentação oficial arquivada/referenciada e revisada;
- sandbox e credenciais não produtivas;
- matriz de capabilities confirmada;
- source-of-truth de agenda decidido;
- mapeamento de dados e DPIA/avaliação LGPD aprovados;
- contrato de webhook e segurança testado;
- limites, retries e runbook definidos;
- testes de contrato e integração em staging;
- autorização explícita para ligar a integração de dados.
