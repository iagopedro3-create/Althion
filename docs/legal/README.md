# Documentação jurídica e LGPD — Althion

> **RASCUNHO — PENDENTE DE REVISÃO JURÍDICA.** Os documentos desta pasta são **minutas técnicas** preparadas para acelerar o trabalho jurídico. **Não constituem aconselhamento jurídico nem documentos com validade legal.** Devem ser revisados, ajustados e aprovados por advogado(a) habilitado(a) em Direito Digital/Proteção de Dados **antes de qualquer uso comercial, contratação ou publicação**. Campos entre `[colchetes]` precisam ser preenchidos ou confirmados. As datas, prazos e escolhas de base legal são propostas iniciais, não decisões definitivas.

Base normativa principal: **Lei nº 13.709/2018 (LGPD)**. Normas correlatas consideradas: Constituição Federal (art. 5º, X e XII), Marco Civil da Internet (Lei nº 12.965/2014), Código de Defesa do Consumidor (Lei nº 8.078/1990), Código Civil, e — no que toca ao contexto de saúde — o dever de sigilo e as resoluções do CFM/CFO aplicáveis às clínicas contratantes (a Althion **não** exerce função clínica; ver `docs/product/non-goals.md`).

## Contexto que fundamenta estes documentos

- A Althion é uma plataforma **B2B** de recuperação e performance da agenda para clínicas. Atua **exclusivamente na jornada administrativa** — sem diagnóstico, prescrição, prontuário, triagem ou interpretação clínica.
- Hoje o produto opera com **dados 100% sintéticos**; nenhum dado pessoal real é tratado até o piloto. Estes documentos preparam esse momento.
- Isolamento multi-tenant por organização é **requisito de produto**, aplicado no banco (RLS) e comprovado por testes automatizados (ver `docs/security/security-model.md` e `docs/security/rls-test-evidence.md`).
- A **Helena** opera em paralelo como motor operacional (CRM/WhatsApp/agentes de IA); a integração de dados Althion↔Helena é **opcional e desligada por padrão**. Ver `docs/architecture/integrations.md`.

## Modelo de papéis (LGPD art. 5º, VI–VIII) — **decisão central a validar juridicamente**

A Althion tem **papel duplo**, que deve ser refletido em todos os documentos e contratos:

| Situação                                                                | Controlador                           | Operador    | Observação                                                                                               |
| ----------------------------------------------------------------------- | ------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| Dados de **pacientes/leads** das clínicas clientes                      | **A clínica cliente**                 | **Althion** | A clínica decide finalidade e meios da relação com o paciente; a Althion trata sob instrução contratual. |
| Dados dos **usuários da plataforma** (equipe da clínica: login, papéis) | **Althion** (e/ou clínica, a definir) | —           | Necessário à prestação do serviço e à segurança de acesso.                                               |
| Dados de **prospects do site** (formulário de diagnóstico/contato)      | **Althion**                           | —           | Relação pré-contratual com a própria Althion.                                                            |
| Dados de **faturamento/contrato** do cliente                            | **Althion**                           | —           | Obrigação legal (fiscal/contábil) e execução de contrato.                                                |

Suboperadores/subcontratados da Althion (quando atua como **operadora**), a cobrir com contratos "back-to-back": ver `acordo-tratamento-dados-dpa.md`.

## Documentos desta pasta

| Arquivo                                                                          | Conteúdo                                       | Artigos LGPD principais            |
| -------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------- |
| [politica-de-privacidade.md](politica-de-privacidade.md)                         | Aviso de privacidade ao titular                | art. 6º, 9º, 18                    |
| [termos-de-uso.md](termos-de-uso.md)                                             | Termos do serviço (site e plataforma)          | — (CDC, Código Civil, Marco Civil) |
| [bases-legais.md](bases-legais.md)                                               | Mapa de base legal por finalidade e categoria  | art. 7º, 11                        |
| [acordo-tratamento-dados-dpa.md](acordo-tratamento-dados-dpa.md)                 | Acordo controlador↔operador e suboperadores    | art. 39, 33, 46–48                 |
| [politica-de-retencao-e-descarte.md](politica-de-retencao-e-descarte.md)         | Prazos de retenção e eliminação                | art. 15, 16                        |
| [ripd-dpia.md](ripd-dpia.md)                                                     | Relatório de Impacto à Proteção de Dados       | art. 38                            |
| [registro-operacoes-ropa.md](registro-operacoes-ropa.md)                         | Registro das operações de tratamento           | art. 37                            |
| [direitos-dos-titulares-e-incidentes.md](direitos-dos-titulares-e-incidentes.md) | Atendimento a direitos e resposta a incidentes | art. 18, 48                        |

## Checklist para a revisão jurídica

- [ ] Confirmar o modelo controlador/operador e o papel duplo da Althion.
- [ ] Validar a base legal de cada finalidade (especial atenção a **dados sensíveis de saúde**, art. 11 — ver `bases-legais.md` e `ripd-dpia.md`).
- [ ] Confirmar prazos de retenção com fundamento legal (fiscal, prescricional, Marco Civil).
- [ ] Aprovar as cláusulas de transferência internacional (Supabase/Vercel/Google — art. 33).
- [ ] Designar formalmente o **Encarregado (DPO)** e publicar canal de contato (art. 41).
- [ ] Definir a região de armazenamento dos dados e sua compatibilidade com o contratado.
- [ ] Revisar o RIPD e decidir sobre necessidade de consulta prévia à ANPD.
- [ ] Aprovar os textos públicos (política e termos) antes de remover os placeholders do site.
