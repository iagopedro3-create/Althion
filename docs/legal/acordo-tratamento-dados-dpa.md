# Acordo de Tratamento de Dados (DPA) — Althion Operadora

> **RASCUNHO — PENDENTE DE REVISÃO JURÍDICA.** Minuta de anexo contratual; não é aconselhamento jurídico. Deve ser revisada e integrada ao contrato principal com cada clínica cliente por advogado(a). Preencher os `[colchetes]`.

Este Acordo regula o tratamento de dados pessoais quando a **`[RAZÃO SOCIAL]` ("Althion") atua como Operadora** por conta de uma **clínica cliente ("Controladora")**, nos termos dos arts. 39 e seguintes da LGPD. Integra e complementa o contrato de prestação de serviços `[REFERÊNCIA DO CONTRATO]`.

## 1. Objeto e papéis

- A Controladora determina as finalidades e os meios do tratamento dos dados de seus pacientes e leads.
- A Althion trata esses dados **exclusivamente conforme as instruções documentadas** da Controladora e este Acordo (art. 39). A Althion informará a Controladora caso, em sua avaliação, uma instrução viole a LGPD.
- A Althion **não** exerce função clínica e não interpreta conteúdo clínico.

## 2. Escopo do tratamento

| Item                    | Descrição                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Natureza/finalidade     | Recuperação e performance da agenda administrativa (dashboard, score, recomendações, oportunidades).                     |
| Categorias de titulares | Pacientes e leads da Controladora; equipe da Controladora usuária da plataforma.                                         |
| Categorias de dados     | Identificadores e metadados administrativos (contato, agenda, status), conforme `bases-legais.md`. Sem conteúdo clínico. |
| Duração                 | Vigência do contrato principal + prazos de retenção legal (ver `politica-de-retencao-e-descarte.md`).                    |

## 3. Obrigações da Althion (Operadora)

1. Tratar dados apenas conforme instruções documentadas e finalidade contratada; não usar para finalidade própria incompatível.
2. Garantir **confidencialidade** e vincular pessoas autorizadas a dever de sigilo.
3. Adotar medidas de segurança compatíveis (art. 46–49): isolamento por organização aplicado no banco (RLS) e testado, controle de acesso por papel (RBAC), criptografia em trânsito, minimização/sanitização de logs, trilha de auditoria.
4. Auxiliar a Controladora no atendimento aos **direitos dos titulares** (art. 18) e no cumprimento dos arts. 46–48.
5. Comunicar à Controladora **incidente de segurança** sem demora injustificada, em até `[PRAZO — ex.: 48h]` do conhecimento, com as informações do art. 48, §1º disponíveis (ver `direitos-dos-titulares-e-incidentes.md`).
6. Manter **registro das operações** que realiza (art. 37).
7. Eliminar ou devolver os dados ao término, conforme instrução da Controladora, salvo guarda exigida por lei (art. 15, 16).
8. Permitir e contribuir com **auditorias/demonstrações de conformidade** razoáveis, `[periodicidade/condições]`.

## 4. Suboperadores (subcontratação — art. 39)

A Althion está autorizada a utilizar suboperadores para infraestrutura e funcionalidades, mediante contratos com obrigações **equivalentes** às deste Acordo ("back-to-back"). A Althion permanece responsável perante a Controladora pelos atos dos suboperadores.

| Suboperador  | Função                                                                                               | Local de processamento | Transf. internacional?                     |
| ------------ | ---------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------ |
| `[Supabase]` | Banco de dados e infraestrutura de autenticação                                                      | `[REGIÃO A CONFIRMAR]` | `[SIM/NÃO — se sim, salvaguardas art. 33]` |
| `[Vercel]`   | Hospedagem da aplicação web                                                                          | `[REGIÃO A CONFIRMAR]` | `[SIM/NÃO]`                                |
| `[Helena]`   | Motor operacional (CRM/atendimento) — integração de dados **opcional**, habilitada pela Controladora | `[A CONFIRMAR]`        | `[A CONFIRMAR]`                            |
| `[Google]`   | Mídia/anúncios — apenas quando aplicável (fase futura)                                               | `[A CONFIRMAR]`        | `[A CONFIRMAR]`                            |

A Althion comunicará a Controladora sobre **alterações** no quadro de suboperadores com antecedência razoável, facultando oposição fundamentada.

## 5. Transferência internacional (art. 33)

Havendo processamento fora do Brasil, aplicar as hipóteses e salvaguardas do art. 33 (ex.: cláusulas contratuais específicas, garantias de nível adequado de proteção). `[Confirmar por prestador; priorizar região brasileira quando disponível.]`

## 6. Retorno e eliminação

Ao término do contrato, a Althion, conforme instrução da Controladora, **devolve** e/ou **elimina** os dados no prazo de `[PRAZO — ex.: 30 dias]`, salvo obrigação legal de guarda, hipótese em que os dados permanecem bloqueados até o fim do prazo legal.

## 7. Responsabilidade

A repartição de responsabilidades observa os arts. 42 a 45 da LGPD e o `[contrato principal]`. `[Cláusulas de limitação/indenização a definir juridicamente.]`

## 8. Encarregados

- Encarregado da Althion: `[NOME]` — `[E-MAIL]`.
- Encarregado da Controladora: `[NOME]` — `[E-MAIL]`.
