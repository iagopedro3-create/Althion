# Checklist de Go-Live — Piloto Althion

> Lista de prontidão acionável para iniciar um **piloto com clínica real**. Consolida o estado atual e o que falta, com **dono** e **ordem**. Atualizado em `[22/07/2026]`. Legenda: ✅ pronto · 🟡 em andamento/parcial · ❌ pendente.

## Onde estamos

A **fundação técnica** está implementada e **validada** (isolamento multi-tenant comprovado por 153 assertions pgTAP no CI, no `main`). Existem **minutas jurídicas/LGPD** e **scaffolds de deploy** prontos para revisão/execução. O que separa o piloto do ar são, sobretudo, itens **jurídicos, de infraestrutura e de decisão de produto** — nenhum deles é código que se resolva sem insumos externos.

## Gate 0 — Bloqueadores absolutos (sem isto, não se toca dado real)

| #   | Item                                                                                                  | Estado | Dono               | Depende de                                      |
| --- | ----------------------------------------------------------------------------------------------------- | ------ | ------------------ | ----------------------------------------------- |
| 0.1 | Revisão e aprovação jurídica das minutas (`docs/legal/`)                                              | ❌     | Jurídico           | minutas prontas ✅                              |
| 0.2 | Definir base legal do **art. 11** (dado sensível de saúde) por clínica                                | ❌     | Jurídico + Produto | 0.1                                             |
| 0.3 | Designar **Encarregado (DPO)** e publicar canal de contato                                            | ❌     | Você               | —                                               |
| 0.4 | Assinar **DPA** com a clínica piloto (controlador↔operador)                                           | ❌     | Jurídico + Você    | 0.1                                             |
| 0.5 | Definir **região de armazenamento** dos dados e salvaguardas de transferência internacional (art. 33) | ❌     | Você               | escolha de provedores                           |
| 0.6 | Publicar Política de Privacidade e Termos aprovados no site                                           | ❌     | Jurídico → Eng.    | 0.1 (hoje o site mostra placeholders — correto) |

## Gate 1 — Infraestrutura de produção/staging

| #    | Item                                                                   | Estado | Dono      | Depende de                                                           |
| ---- | ---------------------------------------------------------------------- | ------ | --------- | -------------------------------------------------------------------- |
| 1.1  | Runbook + scaffolds de deploy                                          | ✅     | —         | `docs/operations/deploy-staging.md`, `apps/api/Dockerfile`, workflow |
| 1.2  | Provedor de hospedagem: **Supabase + Vercel** (web + API serverless)   | ✅     | —         | decidido 22/07                                                       |
| 1.3  | Criar projeto **Supabase de staging** + senha do banco                 | ❌     | Você      | —                                                                    |
| 1.4  | Aplicar **migrations** no Supabase remoto (dry-run → push)             | ❌     | Você/Eng. | 1.3                                                                  |
| 1.5  | Regenerar `database.types.ts` a partir do schema remoto e revisar diff | ❌     | Eng.      | 1.4                                                                  |
| 1.6  | Criar projeto **Vercel** do web (root `apps/web`) + domínio            | ❌     | Você      | —                                                                    |
| 1.7  | Criar projeto **Vercel** da API (root `apps/api`, serverless)          | ❌     | Você      | —                                                                    |
| 1.8  | Validar o **adaptador serverless** da API no 1º deploy (DI/rotas)      | ❌     | Eng.      | 1.7                                                                  |
| 1.9  | Preencher **Secrets** do Environment `staging` no GitHub               | ❌     | Você      | 1.3–1.7                                                              |
| 1.10 | Primeiro deploy de staging ponta a ponta (web → API → Supabase)        | ❌     | Eng.      | 1.9                                                                  |
| 1.11 | **Cofre de segredos** de produção definido                             | ❌     | Você      | —                                                                    |
| 1.12 | Backups do banco e teste de restore                                    | ❌     | Eng.      | 1.3                                                                  |

## Gate 2 — Segurança de produção

| #   | Item                                                         | Estado | Dono           | Depende de                           |
| --- | ------------------------------------------------------------ | ------ | -------------- | ------------------------------------ |
| 2.1 | Isolamento multi-tenant (RLS) validado                       | ✅     | —              | 153 assertions pgTAP verdes no CI    |
| 2.2 | Secret scan (Gitleaks) e audit de dependências no CI         | ✅     | —              | job `secrets`/`quality` do `ci.yml`  |
| 2.3 | **MFA obrigatório** na plataforma (ver plano abaixo)         | 🟡     | Eng. + Produto | backend pronto; falta tela + rotas   |
| 2.4 | Revisão de logs reais (amostragem) quanto a dado sensível    | ❌     | Eng.           | 1.8                                  |
| 2.5 | E2E autenticado por papel/tenant com usuários **sintéticos** | 🟡     | Eng.           | 1.3 (Supabase), provisionar usuários |

## Gate 3 — Produto e operação

| #   | Item                                                                                            | Estado | Dono                      | Depende de                 |
| --- | ----------------------------------------------------------------------------------------------- | ------ | ------------------------- | -------------------------- |
| 3.1 | Owner nominal + **calibração dos thresholds** do Althion Score (sair de `draft`)                | ❌     | Produto                   | dados/critérios            |
| 3.2 | Taxonomias de status/motivo (lead, perda, agendamento, ação)                                    | ❌     | Produto                   | —                          |
| 3.3 | SLAs padrão e limites de frequência                                                             | 🟡     | Produto                   | política provisória existe |
| 3.4 | Modelo de organização (grupo econômico × clínica) confirmado                                    | ❌     | Produto                   | —                          |
| 3.5 | Fluxo de auth inicial definitivo (convite/senha/MFA)                                            | 🟡     | Produto                   | 2.3                        |
| 3.6 | **Encaminhamento de leads** dos formulários públicos (destino, antiabuso, base legal, retenção) | ❌     | Produto + Jurídico + Eng. | 0.1                        |
| 3.7 | Ligar (ou não) a **integração de dados da Helena** para o piloto                                | ❌     | Você                      | doc oficial Helena + 0.1   |
| 3.8 | Selecionar e onboardar a **clínica piloto**                                                     | ❌     | Você                      | Gates 0–2                  |

## Já concluído (fundação técnica)

- ✅ Fases 1–5, 7 e protótipo sintético da 9 implementadas; landing redesenhada e polida.
- ✅ Reposicionamento Helena/agenda como camadas paralelas/opcionais.
- ✅ 153 assertions pgTAP (RLS/isolamento) verdes no CI; audit de dependências limpo; 111 testes; build.
- ✅ Pacote jurídico/LGPD (minutas) e scaffolds de deploy de staging.

---

## Anexo — Plano de implementação do MFA (item 2.3)

> **Passo 3 implementado em 22/07** (`docs/releases/phase-10-1-mfa-backend.md`): a API lê o claim `aal`, existe `@RequireMfa()` + `MfaGuard` e a env var `MFA_ENFORCEMENT` (padrão `disabled`). Os demais passos continuam pendentes de Supabase real e da decisão de **quais papéis/rotas** exigem MFA. Ativar a exigência **antes** de existir a tela de inscrição travaria o acesso.

**Abordagem (Supabase Auth, TOTP + AAL):**

1. **Inscrição (web):** tela para `supabase.auth.mfa.enroll({ factorType: 'totp' })` → exibir QR code/segredo → `challenge` + `verify` com o código do app autenticador. Gerar e exibir **códigos de recuperação**. (Requer decisão de UX e teste real.)
2. **Sessão AAL2:** após verificar, a sessão passa a `aal2`; o JWT do Supabase carrega o claim `aal` (`aal1` = só senha; `aal2` = senha + MFA) e `amr`.
3. **Enforcement na API (defesa em profundidade)** — ✅ **feito**:
   - ✅ `JwtVerifierService.verify` devolve `{ subject, assuranceLevel, methods }`; `aal` ausente/desconhecido vale `aal1`.
   - ✅ `@RequireMfa()` + `MfaGuard` rejeitam com `403 MFA_REQUIRED` quando a sessão não é `aal2`, e só quando `MFA_ENFORCEMENT=enforced`.
   - ❌ Aplicar às rotas sensíveis (ex.: `platform_admin`, `/admin/*`) — **lista a decidir com Produto**; nenhuma rota marcada ainda.
   - ✅ Testes unitários com payloads `aal1`/`aal2`.
4. **Enforcement no web:** middleware/guard que redireciona à inscrição/verificação quando a rota exige AAL2 e a sessão está em `aal1`.
5. **Rollout seguro:** exigir MFA primeiro para `platform_admin`; medir; depois estender. Nunca habilitar a exigência sem a tela de inscrição publicada.

**Pré-condições para construir com segurança:** ambiente de auth (Supabase staging) para testar o fluxo real (1.3/1.8) e a lista de papéis/rotas do item 3.5.

## Sequência recomendada

1. **Jurídico (Gate 0)** em paralelo com **Infra (Gate 1)** — são os caminhos críticos e independentes entre si no início.
2. Com staging no ar (1.8), construir **MFA (2.3)** e rodar **E2E autenticado (2.5)**.
3. Fechar **decisões de produto (Gate 3)**.
4. Onboarding da **clínica piloto (3.8)** e go/no-go.
