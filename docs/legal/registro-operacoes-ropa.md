# Registro das Operações de Tratamento (ROPA) — Althion

> **RASCUNHO — PENDENTE DE REVISÃO JURÍDICA.** Minuta técnica; não é aconselhamento jurídico. Registro exigível pela ANPD (art. 37). Manter **vivo** e atualizado a cada nova operação/integração.

**Responsável pela manutenção:** Encarregado `[NOME]` · **Última revisão:** `[DATA]`

Cada linha descreve uma operação de tratamento. `C` = Althion Controladora; `O` = Althion Operadora.

| ID    | Operação                                           | Papel | Titulares                  | Categorias de dados                                 | Finalidade                                | Base legal                                   | Compartilhamento/suboperadores      | Transf. intl. | Retenção              | Segurança                     |
| ----- | -------------------------------------------------- | ----- | -------------------------- | --------------------------------------------------- | ----------------------------------------- | -------------------------------------------- | ----------------------------------- | ------------- | --------------------- | ----------------------------- |
| OP-01 | Solicitação de diagnóstico/contato (site)          | C     | prospects                  | nome, e-mail, telefone, clínica, mensagem           | relação pré-contratual                    | art. 7º, V / IX                              | `[Vercel]`                          | `[?]`         | `[12m]`               | TLS, sanitização              |
| OP-02 | Cadastro e autenticação de usuários                | C     | equipe da clínica          | nome, e-mail, papel, logs de acesso                 | acesso seguro à plataforma                | art. 7º, V                                   | `[Supabase]`                        | `[?]`         | contrato + tolerância | RBAC, MFA `[a exigir]`, RLS   |
| OP-03 | Prestação do serviço (dashboard/score/recuperação) | O     | pacientes/leads da clínica | metadados administrativos (contato, agenda, status) | performance da agenda administrativa      | base indicada pela Controladora (art. 7º/11) | `[Supabase]`, `[Helena]` (opcional) | `[?]`         | conforme DPA          | RLS testado, minimização      |
| OP-04 | Auditoria e segurança                              | C     | usuários/pacientes         | eventos de auditoria (metadados)                    | segurança, prevenção, prestação de contas | art. 7º, IX / II                             | `[Supabase]`                        | `[?]`         | `[12–24m]`            | append-only, acesso restrito  |
| OP-05 | Guarda de registros de acesso à aplicação          | C     | usuários                   | logs de aplicação                                   | cumprimento legal                         | art. 7º, II + Marco Civil art. 15            | `[Supabase]`                        | `[?]`         | mín. 6 meses          | acesso restrito               |
| OP-06 | Faturamento e obrigações fiscais                   | C     | representantes da clínica  | dados de contrato/cobrança                          | obrigação legal                           | art. 7º, II                                  | `[contador/ERP]`                    | `[?]`         | `[5 anos]`            | acesso restrito               |
| OP-07 | Mídia/anúncios (fase futura)                       | C     | público de campanhas       | dados de campanha (agregados/sintéticos hoje)       | aquisição                                 | art. 7º, IX / I                              | `[Google]`                          | `[?]`         | `[definir]`           | tokens fora do schema público |

**Notas:**

- Preencher local de processamento e transferência internacional por suboperador após decisão de infraestrutura.
- OP-03: a base legal e a responsabilidade por consentimento (quando art. 11) são definidas com cada clínica Controladora (ver `bases-legais.md`).
- Atualizar este registro sempre que uma nova integração for habilitada (ex.: ligar a integração de dados da Helena) ou uma finalidade for adicionada.
