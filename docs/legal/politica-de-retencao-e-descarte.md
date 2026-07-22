# Política de Retenção e Descarte — Althion

> **RASCUNHO — PENDENTE DE REVISÃO JURÍDICA.** Minuta técnica; não é aconselhamento jurídico. Os prazos abaixo são **propostas** e devem ser confirmados com base em obrigações fiscais, prazos prescricionais e no Marco Civil, por advogado(a).

Princípios: necessidade e finalidade (art. 6º). Ao fim da finalidade ou do prazo legal, os dados são **eliminados** ou **anonimizados** (art. 15 e 16). Guarda além do necessário só ocorre nas hipóteses do art. 16 (obrigação legal, estudo por órgão de pesquisa com anonimização, transferência a terceiro conforme lei, ou uso exclusivo do controlador com anonimização).

## Tabela de retenção (proposta)

| Categoria                                                 | Prazo proposto                                    | Gatilho de contagem       | Fundamento a confirmar                      | Ação ao fim                                                |
| --------------------------------------------------------- | ------------------------------------------------- | ------------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| Contato de prospect (sem contratação)                     | `[12 meses]`                                      | último contato            | legítimo interesse / expectativa            | eliminar ou anonimizar                                     |
| Conta de usuário e permissões                             | duração do contrato                               | encerramento do vínculo   | execução de contrato                        | eliminar/anonimizar após período de tolerância `[30 dias]` |
| Dados operacionais/administrativos (por conta da clínica) | conforme instrução da **clínica Controladora**    | fim do contrato           | contrato + DPA                              | devolver/eliminar (ver DPA §6)                             |
| Registros de acesso à aplicação (logs)                    | mínimo **6 meses**                                | data do registro          | Marco Civil (Lei 12.965/2014, art. 15)      | eliminar                                                   |
| Trilha de auditoria de segurança                          | `[12–24 meses]`                                   | data do evento            | legítimo interesse/segurança                | eliminar/anonimizar                                        |
| Dados fiscais/contábeis (notas, contratos)                | `[5 anos ou conforme legislação fiscal]`          | fim do exercício/contrato | obrigação legal (art. 7º, II)               | eliminar após prazo                                        |
| Dados objeto de litígio/ordem judicial                    | até trânsito em julgado + prazo legal             | conforme processo         | exercício regular de direitos (art. 7º, VI) | eliminar após prazo                                        |
| Registros de consentimento/opt-out                        | enquanto necessário à prova + prazo prescricional | concessão/revogação       | responsabilização (art. 6º, X)              | eliminar após prazo                                        |

## Bloqueio vs. eliminação

Quando houver obrigação legal de guarda que impeça a eliminação imediata solicitada pelo titular, os dados são **bloqueados** (acesso restrito, sem uso para outras finalidades) até o fim do prazo, e então eliminados.

## Anonimização

A anonimização deve ser **efetiva e irreversível** por meios razoáveis (art. 5º, III e XI). Dados apenas pseudonimizados continuam sendo dados pessoais. Registrar a técnica adotada.

## Operacionalização

- Rotinas de expiração/eliminação `[a implementar]` respeitando históricos append-only e auditoria (não apagar trilha de auditoria antes do prazo próprio).
- Ao eliminar, garantir remoção também de backups conforme o ciclo de retenção de backup `[definir]`.
- Registrar cada eliminação/anonimização relevante (prestação de contas).

`[Alinhar esta política com a arquitetura de dados — ver docs/architecture/data-model.md e docs/data/data-dictionary.md — antes de implementar as rotinas.]`
