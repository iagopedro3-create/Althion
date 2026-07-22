# Política de Privacidade — Althion

> **RASCUNHO — PENDENTE DE REVISÃO JURÍDICA.** Minuta técnica; não é aconselhamento jurídico nem documento com validade legal. Revisar e aprovar com advogado(a) antes de publicar. Preencher os campos `[entre colchetes]`.

**Última atualização:** `[DATA]` · **Versão:** `[0.1-rascunho]`

A `[RAZÃO SOCIAL]`, inscrita no CNPJ sob nº `[CNPJ]`, com sede em `[ENDEREÇO]` ("Althion", "nós"), respeita a sua privacidade e trata dados pessoais em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD). Esta Política explica quais dados tratamos, para quê, com qual base legal, com quem compartilhamos, por quanto tempo guardamos e como você pode exercer seus direitos.

## 1. A quem esta Política se aplica

Esta Política se aplica a:

- **Visitantes do site** e pessoas que solicitam diagnóstico/contato;
- **Usuários da plataforma** (profissionais e equipe das clínicas clientes);
- **Titulares cujos dados são tratados por conta de uma clínica cliente** (pacientes e leads da clínica).

**Papéis (LGPD art. 5º):** Em relação aos dados de **pacientes e leads das clínicas**, a **clínica cliente é a Controladora** e a **Althion atua como Operadora**, tratando os dados sob instrução contratual da clínica — nesse caso, o exercício de direitos deve, em regra, ser dirigido primeiro à clínica (ver seção 8). Em relação aos dados de **visitantes do site, usuários da plataforma e da relação contratual**, a **Althion é a Controladora**.

## 2. Dados que tratamos

Não tratamos dados além do necessário para as finalidades descritas (princípio da necessidade, art. 6º, III).

| Categoria                                                 | Exemplos                                                                                                                | Origem                                                              |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Dados de contato de prospect                              | nome, e-mail, telefone, nome da clínica, mensagem                                                                       | formulário do site                                                  |
| Dados de conta/usuário                                    | nome, e-mail corporativo, papel/permissões, registros de acesso                                                         | cadastro e uso da plataforma                                        |
| Dados operacionais/administrativos (por conta da clínica) | identificadores de contatos/leads, metadados de conversas e de agenda (data/hora, status), oportunidades de recuperação | integrações operadas pela clínica (ex.: Helena), quando habilitadas |
| Dados de relacionamento e faturamento                     | dados do contrato, cobrança e nota fiscal                                                                               | relação contratual com a clínica                                    |
| Registros técnicos                                        | logs de acesso à aplicação, identificadores de sessão, dados de auditoria                                               | funcionamento e segurança                                           |

**Dados sensíveis de saúde (art. 5º, II; art. 11).** A Althion **não** coleta nem interpreta conteúdo clínico (diagnóstico, prescrição, prontuário, exames). No entanto, informações administrativas em contexto de saúde — como o fato de uma pessoa ter agendamento em determinada clínica — **podem revelar dado sensível**. Por isso aplicamos salvaguardas reforçadas (minimização, segregação por organização, controle de acesso) e tratamos essas hipóteses conforme a base legal do art. 11 aplicável, sob responsabilidade da clínica Controladora. Ver `bases-legais.md` e `ripd-dpia.md`.

**Não tratamos** dados de crianças e adolescentes de forma dirigida; caso identificados, aplicamos o art. 14 sob orientação da clínica Controladora. `[CONFIRMAR se o público das clínicas inclui menores.]`

## 3. Para que usamos e com qual base legal

Detalhamento completo em `bases-legais.md`. Em resumo:

- **Responder a solicitações do site e relação pré-contratual** — base: execução de procedimentos preliminares a contrato a pedido do titular (art. 7º, V) e/ou legítimo interesse (art. 7º, IX).
- **Prestar o serviço à clínica** (dashboard, score, recuperação administrativa) — base: execução de contrato com a clínica (art. 7º, V) e, quanto aos dados de pacientes, a base indicada pela clínica Controladora.
- **Segurança, prevenção a fraude e auditoria** — base: legítimo interesse (art. 7º, IX) e cumprimento de obrigação legal (art. 7º, II).
- **Obrigações fiscais, contábeis e regulatórias** — base: cumprimento de obrigação legal/regulatória (art. 7º, II).

Não usamos os dados para decisões automatizadas que produzam efeitos jurídicos sobre o titular sem revisão humana; os indicadores e recomendações da plataforma (ex.: Althion Score) são **auxílio à decisão administrativa**, com regra explicável e supervisão humana (ver art. 20).

## 4. Compartilhamento

Compartilhamos dados apenas quando necessário:

- **Suboperadores/prestadores de infraestrutura**, sob contrato de tratamento de dados: `[Supabase]` (banco de dados/infraestrutura), `[Vercel]` (hospedagem), `[Helena]` (motor operacional, quando a integração de dados for habilitada pela clínica), `[Google]` (mídia, apenas quando aplicável). Lista mantida em `acordo-tratamento-dados-dpa.md`.
- **Autoridades**, quando exigido por lei, ordem judicial ou requisição legítima.
- **Em reorganização societária**, mediante garantias de continuidade desta Política.

Não vendemos dados pessoais.

## 5. Transferência internacional (art. 33)

Alguns prestadores podem processar dados **fora do Brasil** `[CONFIRMAR região de cada prestador]`. Nesses casos, adotamos as salvaguardas do art. 33 (ex.: cláusulas contratuais específicas e garantias de nível de proteção adequado). Onde possível, priorizamos armazenamento em região brasileira. `[DECISÃO DE REGIÃO A CONFIRMAR.]`

## 6. Segurança (art. 46–49)

Adotamos medidas técnicas e administrativas: isolamento de dados por organização aplicado no banco (RLS) e testado, controle de acesso por papel, criptografia em trânsito, minimização e sanitização de logs (sem tokens, corpo de mensagens ou conteúdo sensível), trilha de auditoria e resposta a incidentes (ver `direitos-dos-titulares-e-incidentes.md`). Nenhuma medida elimina integralmente riscos; em caso de incidente relevante, seguimos o art. 48.

## 7. Retenção e eliminação (art. 15, 16)

Mantemos os dados apenas pelo tempo necessário às finalidades ou conforme obrigação legal/prazo prescricional; depois, eliminamos ou anonimizamos. Prazos detalhados em `politica-de-retencao-e-descarte.md`.

## 8. Seus direitos (art. 18)

Você pode solicitar: confirmação da existência de tratamento; acesso; correção; anonimização, bloqueio ou eliminação de dados desnecessários/excessivos ou tratados em desconformidade; portabilidade; informação sobre compartilhamentos; informação sobre a possibilidade de não consentir; e revogação do consentimento.

Quando a Althion for **Operadora** (dados de pacientes/leads de uma clínica), encaminhe o pedido à **clínica Controladora**; auxiliaremos a clínica a atendê-lo. Quando a Althion for **Controladora**, use o canal abaixo. Responderemos nos prazos da LGPD.

**Encarregado (DPO):** `[NOME]` — `[E-MAIL DO ENCARREGADO]` — `[CANAL/ENDEREÇO]`.

## 9. Cookies e tecnologias no site

`[DESCREVER cookies/analytics efetivamente usados — ver GTM no layout. Detalhar categorias (essenciais x não essenciais), base legal e gestão de preferências. Alinhar com o banner de consentimento antes de publicar.]`

## 10. Alterações

Podemos atualizar esta Política; mudanças relevantes serão comunicadas pelos canais adequados, com indicação da data de vigência.

## 11. Contato e ANPD

Dúvidas: `[E-MAIL DO ENCARREGADO]`. Você também pode peticionar à Autoridade Nacional de Proteção de Dados (ANPD).
