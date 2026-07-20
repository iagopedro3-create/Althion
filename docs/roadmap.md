# Roadmap Althion

## Modelo de governança

Cada fase é um gate. Antes de iniciar: plano detalhado, arquivos, riscos, critérios de aceite e aprovação explícita. Depois: lint, typecheck, testes, build, E2E relevante, revisão visual/acessibilidade, documentação, evidências, limitações e próximos passos.

As Fases 2 e 3 foram implementadas em 16 de julho de 2026, as Fases 4, 5, 7 e o protótipo sintético da Fase 9 em 17 de julho, e a landing foi redesenhada até 19 de julho. O aceite técnico permanece condicionado aos gates de banco documentados (153 assertions pgTAP pendentes de Docker/CI).

## Sequência

| Fase                   | Resultado                                                                       | Dependências/gate                                                               | Status               |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------- |
| 0. Auditoria           | Estado atual, visão, arquitetura, segurança, dados e plano                      | Revisão do solicitante                                                          | Concluída            |
| 1. Fundação            | Base modular, Auth, tenancy, RBAC/RLS, auditoria, flags e providers vazios/mock | Execução de migrations/pgTAP em Docker ou CI                                    | Em validação         |
| 2. Radar e Score       | Diagnóstico, inputs manuais, score explicável e relatório                       | Execução das migrations e 37 assertions pgTAP                                   | Em validação         |
| 3. Portal              | Dashboard acionável, indicadores, oportunidades, solicitações e plano           | Execução das migrations e 73 assertions pgTAP                                   | Em validação         |
| 4. Cockpit             | Carteira, saúde, alertas, incidentes, capacidade e próxima ação                 | Execução das migrations e 100 assertions pgTAP; validação do modelo operacional | Em validação         |
| 5. Recovery            | Regras determinísticas, simulação, aprovação, ações e auditoria                 | Execução das migrations e 128 assertions pgTAP; base legal do consentimento     | Em validação         |
| 6. Helena              | Sync real, webhooks, normalização e monitoramento                               | Documentação oficial, sandbox e contrato; atualmente bloqueada                  | Bloqueada            |
| 7. Quality             | Critérios, avaliação assistida, revisão e handoff                               | 140 assertions acumuladas; política de conteúdo/IA e privacidade                | Em validação         |
| 8. Capacity            | Snapshots, baixa ocupação, recomendação e simulação                             | Fonte oficial de agenda e definição de slot                                     | Bloqueada pela fonte |
| 9. Google Ads leitura  | OAuth, campanhas, métricas, alertas e relação prudente com leads                | 153 assertions acumuladas; OAuth/API real e cofre de produção                   | Protótipo sintético  |
| 10. Segurança e piloto | Hardening, E2E, performance, acessibilidade, staging e lançamento               | Clínica piloto, jurídico, runbooks e gates anteriores                           | Não iniciada         |

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

Plano detalhado: `docs/plans/phase-4-cockpit.md`. Implementada com política operacional `1.0.0-provisional` (SLA, saúde, capacidade e nove regras de próxima ação), incidentes e reuniões internos com RLS exclusivo do Especialista/admin, e carteira em `/cockpit`. Entrega e limitações: `docs/releases/phase-4.md`.

## Fase 5 — Recovery

Ordem interna recomendada:

1. lead sem resposta;
2. atendido sem agendamento;
3. cancelamento;
4. falta;
5. horário vago;
6. paciente inativo.

Os dois últimos dependem de fontes e definições ainda ausentes. Toda execução respeita aprovação, finalidade, consentimento/base aplicável, supressão e frequência.

Plano detalhado: `docs/plans/phase-5-recovery.md`. Implementada sem execução de contato: os cenários 1 e 2 rodam sobre o `MockCrmProvider` com política `1.0.0-provisional`, governança revalidada no banco e decisão humana obrigatória. Os cenários 3 a 6 seguem bloqueados pela fonte de agenda. Entrega e limitações: `docs/releases/phase-5.md`.

## Fase 6 — Helena

Não começa até receber documentação real. A integração avança por capability e recurso, com contrato, sandbox, backfill pequeno, incremental, webhook e reconciliação. Escritas ficam atrás de feature flag e aprovação operacional.

## Fases 7 e 8 — Quality e Capacity

Quality foi implementado em modo assistido, com revisão humana e bloqueio clínico, e permanece em validação de banco/privacidade. Capacity continua bloqueado pela ausência de uma fonte oficial de agenda.

## Fase 9 — Google Ads

O protótipo atual é somente leitura e usa dados sintéticos. Métricas da plataforma de anúncios não serão confundidas com consultas realizadas. Os tokens foram removidos do schema público, isolados em `app_private` e o contrato rejeita valores sem prefixo `mock_`. OAuth/API real, cofre de produção e conta sandbox oficial ainda precisam ser implementados; alterações automáticas permanecem fora.

## Fase 10 — Segurança e piloto

Inclui E2E por papel/tenant, carga e performance, acessibilidade, secret/dependency scan, revisão de RLS, restore de backup, runbooks, staging, demo sintética, onboarding e checklist go/no-go.

## Trilha do site institucional

A landing e as páginas institucionais estão implementadas e compartilham a fundação Next.js sem depender de sessão. A trilha ainda depende de decisões operacionais e jurídicas:

- aprovar conteúdo, identidade, privacidade e termos finais;
- definir destino dos leads, retenção e responsável operacional;
- adicionar rate limit e antiabuso antes de ativar formulários;
- o formulário público do Radar exige rate limit, consentimento/base, antiabuso e segregação de dados.

Plano detalhado: `docs/plans/site-institucional.md`. A publicação com coleta de dados reais permanece bloqueada por base jurídica (LGPD), destino do lead e controles de antiabuso; por isso os formulários não encaminham nem persistem submissões.

## Marcos de decisão

| Marco                   | Pergunta                                                 |
| ----------------------- | -------------------------------------------------------- |
| Fundação pronta         | O isolamento e a operação básica são confiáveis?         |
| Score v1 validado       | A nota é útil, explicável e sustentada pelos inputs?     |
| Portal/Cockpit testados | Usuários encontram a próxima ação com menos esforço?     |
| Recovery simulado       | Regras detectam perdas sem duplicar ou violar políticas? |
| Helena staging          | Dados reais de sandbox reconciliam com fonte oficial?    |
| Piloto                  | Há evidência segura de valor e operação sustentável?     |
