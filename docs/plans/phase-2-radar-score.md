# Plano da Fase 2 — Althion Radar e Score

## Estado

**Aprovada e implementada em 16 de julho de 2026; validação de banco pendente.**

Os pesos e critérios de suficiência provisórios foram autorizados. A execução das migrations e dos testes pgTAP das Fases 1 e 2 continua sendo gate obrigatório antes de considerar a fase pronta para merge ou staging.

## Objetivo e decisão suportada

Entregar um diagnóstico administrativo por clínica, baseado inicialmente em dados manuais e sintéticos, que:

- identifique pontos de perda na jornada `contato → atendimento → agendamento → confirmação → comparecimento → retorno`;
- produza recomendações determinísticas e priorizadas;
- calcule um Althion Score explicável, versionado e rastreável;
- diferencie nota calculada de dados insuficientes;
- permita acompanhar e comparar períodos equivalentes;
- gere um relatório imprimível/exportável sem apresentar estimativa financeira como fato.

O usuário principal desta fase é o gestor da clínica. O Especialista de Relacionamento atribuído poderá apoiar o preenchimento e a análise. A fórmula é governada pela plataforma, não por cada usuário final.

## Escopo

### Incluído

- questionário versionado por seções;
- criação de diagnóstico em rascunho, edição, validação e envio;
- entrada de contagens brutas, duração, origem e período, evitando percentuais sem denominador;
- cálculo determinístico das oito dimensões do Score;
- fórmula publicada e imutável, pesos configuráveis por versão;
- cobertura, qualidade, evidências e explicação por componente;
- estado explícito `insufficient_data` sem nota global;
- recomendações geradas por regras versionadas;
- histórico e comparação entre períodos de mesma duração ou normalizados de forma declarada;
- relatório web acessível, modo de impressão/PDF do navegador e exportação CSV dos inputs/componentes;
- auditoria de criação, envio, cálculo e exportação;
- RLS e testes negativos por organização, clínica e assignment do especialista.

### Não incluído

- importação real da Helena ou de agenda;
- preenchimento automático com dados externos;
- IA generativa, recomendação clínica ou conteúdo clínico;
- previsão financeira, receita recuperada ou ROI inferido;
- benchmarks de mercado tratados como verdade;
- personalização arbitrária da fórmula por clínica;
- automação de Recovery, campanhas ou contato com pacientes;
- dashboard amplo do Portal, reservado à Fase 3;
- PDF armazenado permanentemente ou envio por e-mail;
- campos odontológicos complexos.

## Premissas e gates

1. Todos os dados da fase serão sintéticos ou inseridos manualmente para uma finalidade administrativa explícita.
2. O período padrão será de 30 dias; o sistema aceitará de 7 a 92 dias e registrará a duração usada.
3. Comparações diretas exigirão períodos equivalentes; caso contrário, a UI mostrará a diferença e apenas métricas normalizáveis serão comparadas.
4. Fórmulas publicadas não serão editadas. Uma mudança cria nova versão e preserva cálculos anteriores.
5. Um recálculo nunca sobrescreve o snapshot histórico.
6. Valores monetários opcionais de aquisição não participarão do Score v1 nem gerarão afirmações de retorno financeiro.
7. A agenda continua sem fonte oficial. Ocupação e comparecimento serão inputs manuais identificados como `manual` até uma integração aprovada.
8. Migrations/RLS da Fase 1 e da Fase 2 precisam passar em Docker/CI antes do aceite técnico da fase.

## Matriz de acesso proposta

| Papel                     | Ler diagnósticos                | Editar rascunho             | Enviar/calcular | Exportar | Gerir fórmula |
| ------------------------- | ------------------------------- | --------------------------- | --------------- | -------- | ------------- |
| `platform_admin`          | conforme suporte autorizado     | conforme suporte autorizado | sim             | sim      | sim           |
| `organization_owner`      | organização                     | organização                 | sim             | sim      | não           |
| `clinic_manager`          | clínicas no escopo              | clínicas no escopo          | sim             | sim      | não           |
| `relationship_specialist` | somente assignments ativos      | somente assignments ativos  | sim             | sim      | não           |
| `doctor`                  | diagnóstico concluído no escopo | não                         | não             | não      | não           |
| `operator`                | não                             | não                         | não             | não      | não           |
| `viewer`                  | diagnóstico concluído no escopo | não                         | não             | não      | não           |

Capabilities implementadas: `radar:read`, `radar:write`, `radar:submit`, `score:read`, `score:calculate`, `score_formula:manage` e `radar_report:export`.

## Modelo de dados proposto

Todas as entidades tenant-owned terão `organization_id`, FKs compostas quando houver parent tenant-owned, timestamps, RLS e índices de escopo/período.

| Entidade                           | Finalidade e campos essenciais                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `radar_assessments`                | clínica/unidade opcional, período, versão do questionário, status, fonte, autor, envio e soft delete de rascunho       |
| `radar_metric_inputs`              | código da métrica, valor, unidade, numerador, denominador, período, fonte, qualidade e observação administrativa curta |
| `althion_score_formulas`           | versão semântica, estado, cobertura mínima, vigência, publicação e hash da definição                                   |
| `althion_score_formula_components` | dimensão, peso, métricas, direção e parâmetros de normalização versionados                                             |
| `althion_scores`                   | assessment, fórmula, status, nota opcional, cobertura, hash dos inputs e instante do cálculo                           |
| `althion_score_components`         | dimensão, nota opcional, peso, contribuição, cobertura e explicação estruturada                                        |
| `althion_score_evidence`           | vínculo componente/input, valor observado, numerador, denominador, transformação e fonte                               |
| `radar_recommendations`            | regra/versão, prioridade, categoria, evidência, rationale, estado e ordem de exibição                                  |

Regras de integridade:

- um rascunho pode ser alterado; um assessment enviado é imutável;
- `period_end >= period_start` e duração entre 7 e 92 dias;
- valores e contagens não podem ser negativos;
- denominador deve ser positivo quando informado e numerador não pode excedê-lo para proporções;
- pesos de uma fórmula publicada somam exatamente 100;
- uma versão publicada é única e imutável;
- `score_value` fica nulo quando o status é `insufficient_data`;
- `input_hash + formula_id` torna o cálculo idempotente;
- recomendações são reproduzíveis por `rule_code + rule_version + evidence`.

## Score v1 proposto

Os pesos abaixo são uma hipótese de produto para validação, não um benchmark externo:

| Dimensão              | Peso proposto | Sinal principal                                                         |
| --------------------- | ------------: | ----------------------------------------------------------------------- |
| Velocidade            |            15 | primeiras respostas dentro do SLA administrativo aprovado               |
| Conversão             |            20 | leads elegíveis que resultaram em agendamento                           |
| Continuidade          |            15 | leads elegíveis com acompanhamento dentro da política                   |
| Ocupação              |            15 | slots ocupados sobre capacidade agendável informada                     |
| Comparecimento        |            15 | comparecimentos sobre agendamentos esperados no período                 |
| Recuperação           |            10 | oportunidades trabalhadas que voltaram ao fluxo administrativo          |
| Retenção              |             5 | elegíveis para retorno administrativo que retomaram contato/agendamento |
| Inteligência de dados |             5 | completude, origem, consistência e atualidade dos dados administrativos |

Cada métrica será normalizada para `0..100` por uma transformação declarada na fórmula. A dimensão será a média ponderada apenas de métricas válidas. A nota global será a soma das contribuições das dimensões quando:

- a cobertura ponderada for pelo menos 75%;
- Velocidade, Conversão, Continuidade, Ocupação e Comparecimento estiverem cobertas;
- não houver erro de consistência bloqueante.

Caso contrário, o resultado será `insufficient_data`, sem nota global. Componentes calculáveis, lacunas e instruções de correção continuarão visíveis. Pesos ausentes não serão redistribuídos silenciosamente.

Os thresholds de normalização não serão inventados a partir de benchmarks externos. A fórmula publicada exigirá parâmetros aprovados por Produto e Operações, ou metas administrativas explicitamente configuradas e registradas.

## Métricas candidatas e guardrails

| Dimensão              | Inputs brutos preferidos                                 | Guardrail                                                       |
| --------------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| Velocidade            | leads recebidos, respondidos e respondidos dentro do SLA | não confundir ausência de timestamp com resposta lenta          |
| Conversão             | leads elegíveis e agendamentos originados                | documentar elegibilidade e excluir duplicados                   |
| Continuidade          | leads elegíveis e acompanhados na janela                 | janela precisa estar aprovada e versionada                      |
| Ocupação              | slots agendáveis e ocupados                              | excluir bloqueios e períodos não ofertados                      |
| Comparecimento        | agendamentos esperados e comparecimentos                 | separar cancelamentos, reagendamentos e faltas                  |
| Recuperação           | oportunidades trabalhadas e recuperadas                  | não atribuir causalidade financeira                             |
| Retenção              | elegíveis administrativos e retornos                     | não inferir necessidade clínica de retorno                      |
| Inteligência de dados | campos requeridos, fontes e atualidade                   | não permitir que a própria cobertura mascare dimensões ausentes |

Não serão definidos targets de performance de clínica nesta fase sem baseline interno revisado. A fase validará a mensuração e a utilidade da nota antes de afirmar o que é “bom” para uma especialidade.

## Questionário proposto

1. **Contexto:** organização, clínica, unidade opcional, período, especialidade administrativa e responsável pelo preenchimento.
2. **Atendimento:** contatos/leads, respondidos, primeira resposta, SLA e fonte.
3. **Conversão e continuidade:** elegíveis, agendados, acompanhados e motivos administrativos de perda agregados.
4. **Agenda:** slots agendáveis, ocupados, confirmações, cancelamentos, reagendamentos, faltas e comparecimentos.
5. **Recuperação e retenção:** oportunidades identificadas, trabalhadas, recuperadas e elegíveis administrativos para retorno.
6. **Dados:** origem, frequência de atualização, cobertura dos denominadores e limitações conhecidas.

Campos livres serão mínimos, limitados e instruídos a não conter nomes, telefones, mensagens, diagnósticos, exames ou outras informações clínicas.

## Recomendações v1

O gerador será determinístico. Cada regra terá código, versão, condição, prioridade, explicação e evidências. Exemplos de classes, sem thresholds ainda:

- reduzir tempo de primeira resposta;
- revisar leads sem acompanhamento;
- investigar queda de conversão;
- atuar em cancelamentos/reagendamentos;
- reforçar confirmação quando faltas estiverem elevadas;
- melhorar qualidade/origem dos dados;
- coletar dados ausentes antes de qualquer conclusão.

Recomendações não iniciarão fluxos, contatos ou campanhas e não conterão orientação clínica.

## Rotas propostas

### Web

- `GET /app/radar`
- `GET /app/radar/novo`
- `GET /app/radar/[assessmentId]`
- `GET /app/radar/[assessmentId]/editar`
- `GET /app/radar/[assessmentId]/relatorio`
- `GET /app/score`
- `GET /app/score/[scoreId]`

### API REST

- `GET|POST /api/v1/organizations/:organizationId/clinics/:clinicId/radar-assessments`
- `GET|PATCH /api/v1/organizations/:organizationId/clinics/:clinicId/radar-assessments/:assessmentId`
- `POST /api/v1/organizations/:organizationId/clinics/:clinicId/radar-assessments/:assessmentId/submit`
- `POST /api/v1/organizations/:organizationId/clinics/:clinicId/radar-assessments/:assessmentId/calculate`
- `GET /api/v1/organizations/:organizationId/clinics/:clinicId/scores`
- `GET /api/v1/organizations/:organizationId/clinics/:clinicId/scores/:scoreId`
- `GET /api/v1/organizations/:organizationId/clinics/:clinicId/score-comparisons?currentScoreId=&previousScoreId=`
- `GET /api/v1/organizations/:organizationId/clinics/:clinicId/radar-assessments/:assessmentId/export.csv`

Criação, envio, cálculo e exportação terão autorização server-side; comandos terão `Idempotency-Key` quando aplicável.

## Incrementos de implementação

### Incremento 1 — Contratos e domínio puro

- códigos de métricas/dimensões, unidades, status e versões;
- schemas Zod do questionário e DTOs;
- calculadora pura, cobertura, hashes e explicações;
- catálogo determinístico de recomendações;
- testes de propriedades, limites, arredondamento, dados ausentes e idempotência.

### Incremento 2 — Banco, RLS e auditoria

- migration aditiva com as oito entidades propostas;
- policies por membership/scope/assignment;
- fórmula v1 seedada como proposta/publicada somente após aprovação dos parâmetros;
- RPC transacional para submit/calculate, se necessário;
- pgTAP de isolamento, imutabilidade, versionamento e revogação.

### Incremento 3 — API

- módulo `radar` e módulo `score` no NestJS;
- repositories user-scoped, services e controllers;
- validação, erros estáveis, paginação e idempotência;
- auditoria sanitizada sem respostas livres ou PII;
- testes unitários e de integração HTTP.

### Incremento 4 — Formulário Radar

- fluxo em etapas com salvamento de rascunho;
- React Hook Form + Zod, validação progressiva e resumo antes do envio;
- estados de carregamento, erro, vazio, conflito e acesso negado;
- navegação por teclado, mensagens associadas e retomada segura.

### Incremento 5 — Resultado, histórico e exportação

- Score global ou estado de insuficiência;
- componentes, cobertura, fontes, evidências e recomendações;
- histórico e comparação de períodos;
- relatório responsivo e print stylesheet;
- CSV sanitizado, auditado e testado contra formula injection.

### Incremento 6 — Hardening e evidências

- E2E do caminho feliz, dados insuficientes, acesso negado e export;
- axe/teclado, mobile e impressão;
- lint, typecheck, unit, integração, pgTAP, build e E2E;
- atualização de arquitetura, rotas, dicionário, segurança, runbook e release notes.

## Arquivos previstos

### Criar

```text
docs/product/althion-score-v1.md
docs/releases/phase-2.md
supabase/migrations/<timestamp>_radar_score.sql
supabase/tests/radar_score_rls.test.sql
packages/domain/src/radar/*
packages/domain/src/score/*
packages/contracts/src/radar.ts
packages/contracts/src/score.ts
apps/api/src/modules/radar/*
apps/api/src/modules/score/*
apps/web/src/app/app/radar/*
apps/web/src/app/app/score/*
apps/web/src/components/radar/*
apps/web/src/components/score/*
e2e/radar-score.spec.ts
```

### Alterar

```text
package.json
pnpm-lock.yaml
apps/web/package.json
apps/api/src/app.module.ts
packages/domain/src/index.ts
packages/domain/src/authorization.ts
packages/contracts/src/index.ts
packages/contracts/src/database.types.ts
packages/testing/src/index.ts
supabase/seed.sql
docs/current-state.md
docs/architecture/architecture.md
docs/architecture/data-model.md
docs/architecture/route-map.md
docs/data/data-dictionary.md
docs/security/security-model.md
docs/operations/runbook.md
docs/roadmap.md
IMPLEMENTATION_PLAN.md
README.md
```

A lista pode ser refinada durante o incremento, mas qualquer mudança material de escopo será apresentada antes de implementação.

## Dependências sugeridas

| Dependência            | Motivo                                                | Decisão                                       |
| ---------------------- | ----------------------------------------------------- | --------------------------------------------- |
| `react-hook-form`      | formulário longo, performático e com estado por etapa | adicionar somente no Incremento 4             |
| `@hookform/resolvers`  | integração declarativa do formulário com Zod          | adicionar junto do React Hook Form            |
| `@axe-core/playwright` | verificação E2E automatizada de acessibilidade        | adicionar como dev dependency no Incremento 6 |

Nenhuma biblioteca de gráficos ou PDF será adicionada inicialmente. Componentes acessíveis, tabelas curtas e CSS de impressão atendem a v1 com menos superfície de risco. Uma biblioteca será reavaliada se a comparação histórica não puder ser comunicada adequadamente sem ela.

## Riscos e mitigação

| Risco                                        | Mitigação/gate                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| Score transmite precisão falsa               | mostrar versão, cobertura, fontes, arredondamento e estado insuficiente             |
| Pesos/thresholds sem evidência               | tratá-los como hipótese aprovada; versionar e calibrar com pilotos                  |
| Percentuais manuais inconsistentes           | solicitar contagens brutas, validar denominadores e registrar fonte                 |
| Comparar períodos incompatíveis              | bloquear comparação direta ou normalizar apenas métricas válidas                    |
| Dados ausentes virarem zero                  | `null` + reason code; nunca imputar zero silenciosamente                            |
| Especialista acessa clínica não atribuída    | RLS + guard + pgTAP com assignment expirado/inexistente                             |
| Campo livre recebe dado clínico              | minimizar texto, aviso explícito, limite e não registrar conteúdo em logs           |
| Exportação vaza dados ou executa fórmula CSV | autorização, auditoria, sanitização e testes de formula injection                   |
| Fórmula muda histórico                       | snapshots e definições publicadas imutáveis                                         |
| Circularidade na dimensão de dados           | cobertura é guardrail separado; Inteligência usa critérios próprios e transparentes |
| Migration construída sobre RLS não validada  | CI/Docker obrigatório antes de merge/staging                                        |
| Escopo vira Portal completo                  | limitar navegação a Radar, Score, histórico e relatório                             |

## Critérios de aceite

- questionário versionado cria, salva e envia assessment sem PII ou campo clínico;
- validação impede períodos, contagens e proporções inconsistentes;
- cálculo é determinístico, puro e reproduzível pelo mesmo input/formula hash;
- pesos publicados somam 100 e fórmula publicada é imutável;
- dados insuficientes não geram nota global nem redistribuição silenciosa de peso;
- cada nota/componente mostra fórmula, período, cobertura, fonte e evidências usadas;
- histórico preserva snapshots e comparação trata períodos incompatíveis;
- recomendações são determinísticas, explicáveis, versionadas e administrativas;
- relatório possui loading, erro, vazio, insuficiência e impressão legível;
- CSV é autorizado, auditado, sanitizado e sem formula injection;
- RLS/guards negam cross-tenant, cross-clinic, viewer mutation, operator e specialist sem assignment;
- revogação de membership/assignment remove acesso imediatamente;
- nenhuma service role no navegador, dado real, endpoint Helena ou conteúdo clínico;
- lint, format, typecheck, unit, integração, pgTAP, build e E2E passam;
- navegação por teclado, contraste, mobile e axe são verificados;
- documentação e evidências da fase são atualizadas.

## Dúvidas e bloqueios para aprovação

1. Aprovar os pesos provisórios `15/20/15/15/15/10/5/5` ou indicar o owner de Produto/Operações que os definirá.
2. Aprovar cobertura mínima de 75% e as cinco dimensões obrigatórias propostas.
3. Definir os thresholds/metas administrativos da fórmula v1; sem eles a fórmula pode ser implementada, mas não publicada como oficial.
4. Confirmar se `doctor` e `viewer` podem ler diagnósticos concluídos ou se o acesso deve ficar restrito a owner/manager/especialista.
5. Confirmar se impressão/PDF pelo navegador + CSV satisfaz a exportação inicial.
6. Disponibilizar Docker ou CI para executar migrations, regenerar tipos e validar pgTAP.

## Gate de encerramento

A implementação foi autorizada com pesos e suficiência `v1-provisional`. A fórmula permanece `draft` até a definição de owner nominal e calibração. O aceite depende de Docker/CI, tipos regenerados e repetição de todos os gates.
