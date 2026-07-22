# Relatório de Impacto à Proteção de Dados Pessoais (RIPD/DPIA) — Althion

> **RASCUNHO — PENDENTE DE REVISÃO JURÍDICA.** Minuta técnica; não é aconselhamento jurídico. O RIPD é peça que a ANPD pode requisitar (art. 38). Concluir com o Encarregado e a assessoria jurídica antes do piloto.

**Elaborado por:** `[NOME/EQUIPE]` · **Data:** `[DATA]` · **Versão:** `[0.1-rascunho]` · **Encarregado:** `[NOME]`

## 1. Descrição do tratamento

- **Contexto:** plataforma B2B que auxilia clínicas na recuperação e performance da **agenda administrativa**. Sem função clínica (`docs/product/non-goals.md`).
- **Papéis:** clínica cliente = Controladora dos dados de pacientes/leads; Althion = Operadora (e Controladora dos dados de usuários/prospects/contrato).
- **Ciclo de vida:** coleta via integrações operadas pela clínica e via site → processamento/normalização → indicadores e recomendações administrativas com supervisão humana → retenção/eliminação.
- **Estado atual:** dados **100% sintéticos**; nenhum dado real tratado até o piloto.

## 2. Necessidade e proporcionalidade

- **Finalidades legítimas e específicas:** ver `bases-legais.md`.
- **Minimização:** persistência de metadados administrativos minimizados; **não** persistência de conteúdo clínico nem de corpo de mensagens por padrão; logs sanitizados.
- **Base legal:** mapeada por finalidade; atenção reforçada a hipóteses de dado sensível (art. 11).

## 3. Riscos aos titulares e medidas de mitigação

| ID  | Risco                                                          | Prob. | Impacto | Mitigação atual                                                                                 | Ação pendente                                                                                                  |
| --- | -------------------------------------------------------------- | ----- | ------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| R1  | Vazamento cross-tenant (dados de uma clínica visíveis a outra) | Baixa | Alto    | RLS deny-by-default no banco, **testado** (153 assertions), FKs compostas por organização, RBAC | Manter testes no CI; revisão periódica de policies                                                             |
| R2  | Dado administrativo revelar condição de saúde (sensível)       | Média | Alto    | minimização; não interpretar por IA; segregação                                                 | Definir base do art. 11 no contrato; avaliar não persistir dado que revele condição (ver `bases-legais.md` S2) |
| R3  | Acesso indevido por credencial comprometida                    | Média | Alto    | autenticação, escopos por papel, MFA para plataforma `[a exigir]`, auditoria                    | Exigir MFA em produção; rotação/gestão de segredos em cofre                                                    |
| R4  | Retenção excessiva                                             | Média | Médio   | política de retenção proposta                                                                   | Implementar rotinas de expiração/eliminação                                                                    |
| R5  | Transferência internacional sem salvaguarda                    | Média | Médio   | —                                                                                               | Confirmar região dos prestadores e salvaguardas do art. 33                                                     |
| R6  | Log com dado sensível/segredo                                  | Baixa | Alto    | sanitização de logs (sem token/corpo/anexo)                                                     | Revisão de amostras de log antes do piloto                                                                     |
| R7  | Uso secundário incompatível dos dados                          | Baixa | Médio   | finalidade contratual; instrução da Controladora                                                | Cláusulas de finalidade no DPA                                                                                 |
| R8  | Decisão automatizada sem revisão humana                        | Baixa | Médio   | recomendações explicáveis + decisão humana obrigatória                                          | Documentar direito à revisão (art. 20)                                                                         |

## 4. Segurança e governança

Isolamento por organização (RLS), RBAC, criptografia em trânsito, auditoria append-only, segregação de segredos, resposta a incidentes (`direitos-dos-titulares-e-incidentes.md`), Encarregado designado. Ver `docs/security/security-model.md`.

## 5. Conclusão preliminar

O desenho apresenta **controles maduros de isolamento e minimização**, com o principal ponto de atenção residual em **R2 (dado sensível de saúde)** e nas pendências de **infraestrutura de produção** (MFA, cofre de segredos, região dos dados) e **base legal do art. 11**. Recomenda-se concluir estas pendências e a revisão jurídica **antes de tratar qualquer dado real**. Avaliar, com a assessoria, necessidade de consulta prévia à ANPD caso o tratamento de dados sensíveis em escala assim exija.

## 6. Itens a decidir antes do piloto

- [ ] Base legal do art. 11 acordada com cada clínica.
- [ ] MFA obrigatório e cofre de segredos em produção.
- [ ] Região de armazenamento e salvaguardas de transferência internacional.
- [ ] Rotinas de retenção/eliminação implementadas.
- [ ] Revisão de logs reais (amostragem) quanto a dado sensível.
