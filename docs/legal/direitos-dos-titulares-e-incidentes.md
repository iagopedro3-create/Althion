# Atendimento a Direitos dos Titulares e Resposta a Incidentes — Althion

> **RASCUNHO — PENDENTE DE REVISÃO JURÍDICA.** Minuta técnica/operacional; não é aconselhamento jurídico. Validar prazos e fluxos com advogado(a) e Encarregado.

## Parte A — Direitos dos titulares (LGPD art. 18)

### Direitos atendidos

Confirmação da existência de tratamento; acesso; correção; anonimização, bloqueio ou eliminação de dados desnecessários/excessivos ou tratados em desconformidade; portabilidade; informação sobre uso compartilhado; informação sobre a possibilidade de não consentir e suas consequências; e revogação do consentimento.

### Roteamento (papel duplo)

- **Dados de pacientes/leads de uma clínica (Althion = Operadora):** o pedido deve, em regra, ser dirigido à **clínica Controladora**. Ao receber um pedido diretamente, a Althion **identifica a clínica**, orienta o titular e **auxilia a Controladora** a responder no prazo (art. 39).
- **Dados de usuários/prospects/contrato (Althion = Controladora):** a Althion responde diretamente.

### Fluxo operacional

1. **Recepção** pelo canal do Encarregado: `[E-MAIL/CANAL]`.
2. **Identificação e autenticação** do solicitante (evitar divulgação indevida). `[definir método de verificação]`.
3. **Triagem** do papel (Controladora x Operadora) e da clínica envolvida.
4. **Atendimento** dentro do prazo — confirmação/acesso: em regra **imediato** ou até **15 dias** (art. 19, II); demais pedidos em prazo razoável `[definir SLA interno, ex.: 15 dias prorrogáveis com justificativa]`.
5. **Registro** do pedido, decisão e evidências (prestação de contas), sem reter mais dados do que o necessário.
6. **Recusa fundamentada** quando aplicável (ex.: obrigação legal de guarda), informando o motivo e a via da ANPD.

### Observações

- Revogação de consentimento tão simples quanto a concessão (art. 8º, §5º).
- Eliminação sujeita a bloqueio quando houver guarda legal obrigatória.
- Nunca expor dados de um titular a outro; casos multi-tenant respeitam o isolamento por organização.

## Parte B — Resposta a incidentes de segurança (LGPD art. 48)

### Definição

Incidente = evento de segurança que possa acarretar risco ou dano aos titulares (acesso não autorizado, perda, alteração, vazamento, indisponibilidade relevante).

### Fluxo

1. **Detecção e registro** (data/hora, sistema, correlation ID) — preservar evidências sem ampliar exposição.
2. **Contenção** (ex.: suspender rota/job por feature flag ou deploy seguro; revogar sessões/credenciais).
3. **Classificação de severidade e avaliação de risco** aos titulares.
4. **Notificação:**
   - Quando a Althion for **Operadora**: comunicar a **Controladora** sem demora injustificada, em até `[48h]` do conhecimento, com as informações disponíveis do art. 48, §1º.
   - Quando a Althion for **Controladora** e houver risco relevante: comunicar **ANPD** e **titulares** em prazo razoável, conforme regulamentação vigente da ANPD `[confirmar prazo/critério atualizado]`, incluindo: natureza dos dados, titulares envolvidos, medidas técnicas, riscos e medidas adotadas/mitigadoras.
5. **Erradicação e recuperação**; correção da causa raiz; **teste negativo/regressão** quando aplicável.
6. **Registro pós-incidente** (lições, ações), com dados sanitizados.

### Conteúdo mínimo da comunicação (art. 48, §1º)

Descrição da natureza dos dados afetados; titulares envolvidos; medidas técnicas e de segurança utilizadas; riscos; motivo de eventual demora; e medidas adotadas para reverter/mitigar.

### Papéis

- **Encarregado:** ponto focal e comunicação com ANPD/titulares.
- **Responsável técnico de plantão:** `[definir]` — contenção e evidências.
- **Jurídico:** avaliação de notificação e comunicação regulatória.

`[Alinhar com o runbook operacional — docs/operations/runbook.md, seções de "Segredo exposto" e "Possível vazamento cross-tenant".]`
