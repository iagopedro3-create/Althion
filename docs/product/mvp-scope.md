# Escopo do MVP

## Objetivo do piloto

Validar, em clínicas médicas particulares, que a Althion consegue identificar perdas administrativas, priorizar ações, apoiar a recuperação e demonstrar resultados confiáveis sem substituir a Helena nem ingressar no domínio clínico.

## Escopo funcional do MVP

O MVP de piloto é composto pelas Fases 1 a 6, cada uma com aprovação independente:

### Fundação

- monorepo TypeScript e arquitetura modular;
- autenticação Supabase;
- organizações, clínicas, unidades, profissionais e memberships;
- RBAC, RLS e testes negativos de isolamento;
- auditoria, feature flags e configuração por ambiente;
- contrato `CrmProvider`, `MockCrmProvider` e adaptador Helena como integração de dados opcional/desligada (Helena opera em paralelo).

### Radar e Score

- diagnóstico e entrada manual de indicadores administrativos;
- Althion Score 0–100 com fórmula, pesos e versão;
- nível de cobertura/confiança dos dados;
- componentes, explicação, histórico, comparação e recomendações;
- relatório e exportação sem tratar estimativas como fatos.

### Portal do cliente

- dashboard orientado a problemas e próximas ações;
- indicadores administrativos prioritários;
- oportunidades de recuperação e ações;
- solicitações, plano de melhoria, especialista e integrações;
- estados de carregamento, vazio, erro e acesso negado.

### Cockpit do Especialista

- carteira atribuída e saúde das contas;
- alertas, incidentes, SLAs, pendências e plano de ação;
- capacidade básica da carteira e próxima melhor ação explicável;
- risco sinalizado como heurística, nunca como fato sem evidência.

### Recovery Engine determinístico

- regras versionadas, ativação, pausa e simulação;
- casos iniciais: sem resposta, sem agendamento, cancelamento e falta;
- oportunidade, ação, resultado, aprovação e auditoria;
- idempotência, limite de frequência, consentimento e supressão;
- horário vago e inatividade podem entrar no piloto somente com fonte de agenda/retorno definida.

### Integração Helena

- somente após documentação e sandbox reais;
- sincronização incremental do subconjunto aprovado;
- webhooks assinados se oficialmente suportados;
- retries, idempotência, dead letter e monitoramento;
- nenhuma dependência do domínio em DTOs da Helena.

## Fora do MVP de piloto

- Quality Engine completo;
- Capacity Engine completo;
- Google Ads;
- automação irrestrita;
- funcionalidades odontológicas de orçamento, plano e tratamento;
- qualquer função clínica;
- reconstrução de CRM, inbox, WhatsApp, filas, campanhas ou agentes;
- aplicativo móvel.

Esses itens permanecem no roadmap posterior, não cancelados.

## Recorte de dados

O piloto deve usar dados sintéticos até que exista ambiente aprovado, contrato de tratamento e clínica piloto autorizada. Da Helena, persistir somente IDs externos, metadados/fatos normalizados, agregações analíticas e evidências necessárias para auditoria. O conteúdo integral das mensagens não será replicado por padrão.

## Critérios de sucesso do MVP

Os valores-alvo serão aprovados antes do piloto. A estrutura de avaliação deverá medir:

- zero evidência de acesso cruzado entre tenants;
- rastreabilidade completa do Score aos dados de entrada e à versão da fórmula;
- rastreabilidade de cada oportunidade até regra, ação e resultado;
- nenhum contato com pessoa suprimida ou sem base/consentimento aplicável;
- idempotência comprovada em eventos e jobs repetidos;
- explicação de recomendações e indicação de dados insuficientes;
- operação do piloto sem exposição de segredos ou conteúdo clínico em logs;
- aderência técnica aos gates de lint, typecheck, testes, build, E2E e acessibilidade.

## Hipóteses a validar

1. Os dados disponíveis são suficientes para detectar perdas úteis.
2. Gestores agem mais rapidamente com oportunidades priorizadas do que com dashboards passivos.
3. O Especialista consegue gerir mais contas com contexto e próxima ação centralizados.
4. A recuperação administrativa gera agendamentos/comparecimentos mensuráveis.
5. A Helena oferece contratos técnicos estáveis para os dados mínimos do piloto.

## Condições de saída do piloto

- métricas e denominadores validados com as clínicas;
- plano de retenção e descarte operante;
- runbook de integração e incidentes testado;
- revisão de segurança e LGPD concluída;
- relatório de resultados separando observação, atribuição e estimativa;
- decisão explícita de avançar, corrigir ou limitar o produto.
