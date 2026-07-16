# Roadmap Althion

## Modelo de governança

Cada fase é um gate. Antes de iniciar: plano detalhado, arquivos, riscos, critérios de aceite e aprovação explícita. Depois: lint, typecheck, testes, build, E2E relevante, revisão visual/acessibilidade, documentação, evidências, limitações e próximos passos.

As Fases 2 e 3 foram implementadas em 16 de julho de 2026. O usuário autorizou avanço contínuo sem novas pausas de aprovação. O aceite técnico permanece condicionado aos gates de banco documentados; a Fase 4 não foi iniciada.

## Sequência

| Fase                   | Resultado                                                                       | Dependências/gate                                              | Status               |
| ---------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------- |
| 0. Auditoria           | Estado atual, visão, arquitetura, segurança, dados e plano                      | Revisão do solicitante                                         | Concluída            |
| 1. Fundação            | Base modular, Auth, tenancy, RBAC/RLS, auditoria, flags e providers vazios/mock | Execução de migrations/pgTAP em Docker ou CI                   | Em validação         |
| 2. Radar e Score       | Diagnóstico, inputs manuais, score explicável e relatório                       | Execução das migrations e 37 assertions pgTAP                  | Em validação         |
| 3. Portal              | Dashboard acionável, indicadores, oportunidades, solicitações e plano           | Execução das migrations e 73 assertions pgTAP                  | Em validação         |
| 4. Cockpit             | Carteira, saúde, alertas, incidentes, capacidade e próxima ação                 | Modelo operacional do Especialista e SLAs                      | Não iniciada         |
| 5. Recovery            | Regras determinísticas, simulação, aprovação, ações e auditoria                 | Consentimento, supressão, frequência e fontes definidas        | Não iniciada         |
| 6. Helena              | Sync real, webhooks, normalização e monitoramento                               | Documentação oficial, sandbox e contrato; atualmente bloqueada | Bloqueada            |
| 7. Quality             | Critérios, avaliação assistida, revisão e handoff                               | Política de conteúdo/IA e avaliação de privacidade             | Não iniciada         |
| 8. Capacity            | Snapshots, baixa ocupação, recomendação e simulação                             | Fonte oficial de agenda e definição de slot                    | Bloqueada pela fonte |
| 9. Google Ads leitura  | OAuth, campanhas, métricas, alertas e relação prudente com leads                | Conta sandbox, consentimentos e taxonomia de atribuição        | Não iniciada         |
| 10. Segurança e piloto | Hardening, E2E, performance, acessibilidade, staging e lançamento               | Clínica piloto, jurídico, runbooks e gates anteriores          | Não iniciada         |

## Fase 0 — Auditoria

Entregáveis:

- inventário factual do repositório;
- visão, escopo de MVP e não objetivos;
- arquitetura de sistema, rotas e integrações;
- modelo/dicionário de dados;
- modelo de segurança e privacidade;
- roadmap e plano de implementação.

Gate de saída: dúvidas fundacionais respondidas ou aceitas como decisões adiadas, e aprovação explícita para planejar/executar a Fundação.

## Fase 1 — Fundação

Incrementos sugeridos:

1. workspace, padrões e CI local;
2. Supabase local, schema base e tipos;
3. autenticação e sessão;
4. tenancy, memberships, scopes e RLS;
5. API modular, guards e auditoria;
6. feature flags e providers mock/bloqueado;
7. testes negativos, health e documentação operacional.

Não inclui dashboard de produto, Score, regra de recuperação real ou chamada Helena.

## Fase 2 — Radar e Score

Começar com dados manuais e sintéticos permite validar fórmula e UX sem esperar integração. A nota deve mostrar cobertura, componentes, evidências e `dados insuficientes` quando aplicável. Exportação só após revisão visual e sanitização.

Plano detalhado: `docs/plans/phase-2-radar-score.md`. Fórmula proposta: `docs/product/althion-score-v1.md`.

## Fase 3 — Portal

Construir uma home orientada a alertas, oportunidades e próximas ações. Tabelas ficam reservadas para investigação detalhada; o dashboard principal prioriza decisão e impacto administrativo.

Plano detalhado: `docs/plans/phase-3-client-portal.md`. A implementação usa oportunidades apenas como projeção das recomendações Radar; nenhum conceito do Recovery Engine foi antecipado. A entrega e suas limitações estão em `docs/releases/phase-3.md`.

## Fase 4 — Cockpit

Validar a rotina real do Especialista, capacidade da carteira e critérios de saúde. Próxima melhor ação inicia com regras explicáveis, não modelo opaco de churn.

## Fase 5 — Recovery

Ordem interna recomendada:

1. lead sem resposta;
2. atendido sem agendamento;
3. cancelamento;
4. falta;
5. horário vago;
6. paciente inativo.

Os dois últimos dependem de fontes e definições ainda ausentes. Toda execução respeita aprovação, finalidade, consentimento/base aplicável, supressão e frequência.

## Fase 6 — Helena

Não começa até receber documentação real. A integração avança por capability e recurso, com contrato, sandbox, backfill pequeno, incremental, webhook e reconciliação. Escritas ficam atrás de feature flag e aprovação operacional.

## Fases 7 e 8 — Quality e Capacity

Quality começa assistido, com revisão humana e bloqueio clínico. Capacity começa como recomendação e simulação. Ambos guardam versões e explicação.

## Fase 9 — Google Ads

Somente leitura. Métricas da plataforma de anúncios não serão confundidas com consultas realizadas. Atribuição inclui janela, fonte, cobertura e incerteza. Alterações automáticas permanecem fora.

## Fase 10 — Segurança e piloto

Inclui E2E por papel/tenant, carga e performance, acessibilidade, secret/dependency scan, revisão de RLS, restore de backup, runbooks, staging, demo sintética, onboarding e checklist go/no-go.

## Trilha do site institucional

Não há landing no repositório. Para não alterar a ordem técnica, o site é uma trilha de produto dependente de marca e conteúdo:

- definir conteúdo, identidade, privacidade e formulário antes do trabalho visual;
- compartilhar a fundação Next.js sem acoplar site ao portal autenticado;
- implementar em fase aprovada, possivelmente junto da Fase 2;
- o formulário público do Radar exige rate limit, consentimento/base, antiabuso e segregação de dados.

## Marcos de decisão

| Marco                   | Pergunta                                                 |
| ----------------------- | -------------------------------------------------------- |
| Fundação pronta         | O isolamento e a operação básica são confiáveis?         |
| Score v1 validado       | A nota é útil, explicável e sustentada pelos inputs?     |
| Portal/Cockpit testados | Usuários encontram a próxima ação com menos esforço?     |
| Recovery simulado       | Regras detectam perdas sem duplicar ou violar políticas? |
| Helena staging          | Dados reais de sandbox reconciliam com fonte oficial?    |
| Piloto                  | Há evidência segura de valor e operação sustentável?     |
