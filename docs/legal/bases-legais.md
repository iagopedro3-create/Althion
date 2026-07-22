# Mapa de Bases Legais — Althion (LGPD art. 7º e 11)

> **RASCUNHO — PENDENTE DE REVISÃO JURÍDICA.** Minuta técnica; não é aconselhamento jurídico. A escolha da base legal é decisão jurídica e deve ser confirmada por advogado(a), em especial quanto a **dados sensíveis** (art. 11).

Este documento mapeia, por **finalidade** e **categoria de dado**, a base legal proposta. Princípios aplicáveis: finalidade, adequação, necessidade, transparência, segurança, prevenção, não discriminação e responsabilização (art. 6º).

## 1. Dados pessoais comuns (art. 7º)

| #   | Finalidade                                                                 | Categorias                         | Papel Althion              | Base legal proposta                                                                            | Nota                                                                                    |
| --- | -------------------------------------------------------------------------- | ---------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | Responder solicitação de diagnóstico/contato do site                       | contato do prospect                | Controlador                | Art. 7º, V (procedimentos preliminares a contrato, a pedido do titular)                        | Alternativa/reforço: art. 7º, IX (legítimo interesse) com teste de balanceamento (LIA). |
| 2   | Comunicação comercial subsequente (follow-up)                              | contato do prospect                | Controlador                | Art. 7º, IX (legítimo interesse) **ou** art. 7º, I (consentimento)                             | Se for marketing ativo, avaliar consentimento e opt-out.                                |
| 3   | Criar e manter contas de usuário; autenticação                             | dados de usuário, logs de acesso   | Controlador (e/ou clínica) | Art. 7º, V (execução de contrato)                                                              | Necessário à prestação.                                                                 |
| 4   | Prestar o serviço à clínica (dashboard, score, recuperação administrativa) | dados operacionais/administrativos | **Operador**               | Base indicada pela **clínica Controladora** (tipicamente art. 7º, V, entre clínica e paciente) | Althion trata sob instrução (art. 39).                                                  |
| 5   | Segurança da informação, prevenção a fraude, auditoria                     | logs, auditoria                    | Controlador                | Art. 7º, IX (legítimo interesse) + art. 7º, II (obrigação legal)                               |                                                                                         |
| 6   | Faturamento, emissão fiscal, contabilidade                                 | dados de contrato/cobrança         | Controlador                | Art. 7º, II (obrigação legal/regulatória)                                                      | Retenção conforme prazos fiscais.                                                       |
| 7   | Guarda de registros de acesso à aplicação                                  | logs de aplicação                  | Controlador                | Art. 7º, II c/c Marco Civil (Lei 12.965/2014, art. 15)                                         | Guarda mínima de 6 meses.                                                               |
| 8   | Cumprir ordem judicial/requisição de autoridade                            | conforme requisição                | Controlador/Operador       | Art. 7º, II / art. 7º, VI (exercício regular de direitos)                                      |                                                                                         |

**Legítimo interesse (art. 7º, IX):** onde utilizado, elaborar e arquivar o **teste de balanceamento (LIA)** — finalidade legítima, necessidade, e ponderação frente às expectativas e direitos do titular, com salvaguardas (minimização, opt-out, transparência).

## 2. Dados pessoais sensíveis — saúde (art. 5º, II; art. 11) — **atenção reforçada**

A Althion **não coleta conteúdo clínico**. Contudo, dados administrativos em contexto de saúde **podem revelar informação de saúde** (ex.: agendamento em clínica de especialidade). Para essas hipóteses, o art. 7º **não** basta — aplica-se o art. 11.

| #   | Situação                                                                     | Base legal proposta (art. 11)                                                                                                    | Responsável primário     | Nota crítica                                                                          |
| --- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------- |
| S1  | Metadados de agenda/atendimento tratados por conta da clínica                | Art. 11, II, "f" (tutela da saúde, por profissionais/serviços de saúde) **ou** art. 11, I (consentimento específico e destacado) | **Clínica Controladora** | Decidir com a clínica a base aplicável; a Althion, como operadora, segue a instrução. |
| S2  | Eventual inferência de condição a partir da especialidade da clínica         | Minimizar/evitar; se inevitável, mesma base do S1 + avaliação no RIPD                                                            | Clínica Controladora     | Preferir não persistir dado que revele condição; ver `ripd-dpia.md`.                  |
| S3  | Conteúdo potencialmente clínico enviado por engano em canais administrativos | Não tratar/encaminhar a pessoa; não interpretar por IA                                                                           | Clínica Controladora     | Já é regra de produto (ver `docs/product/non-goals.md`).                              |

**Recomendações para a revisão jurídica:**

1. Definir, no contrato com cada clínica, **qual base do art. 11** ampara o tratamento dos metadados administrativos e **de quem é a responsabilidade** de obter consentimento, quando aplicável.
2. Avaliar se o desenho atual (minimização, não persistência de conteúdo clínico, segregação por organização) é suficiente para **descaracterizar** parte dos dados como sensíveis, ou se devem ser tratados como sensíveis por precaução.
3. Registrar a decisão no ROPA (`registro-operacoes-ropa.md`) e no RIPD.

## 3. Revogação e mudança de base

Onde a base for consentimento, garantir revogação tão fácil quanto a concessão (art. 8º, §5º) e não reutilizar o dado para finalidade incompatível sem nova base (art. 6º, I e art. 9º).
