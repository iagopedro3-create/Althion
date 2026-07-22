# Plano — Fase 10 (Segurança e piloto), incremento 10.1: MFA no backend

> Escopo deste incremento: **apenas o lado servidor do MFA** (item 2.3 do `docs/operations/go-live-checklist.md`, passo 3 do anexo). A inscrição TOTP no web e o enforcement de rota real ficam para 10.2, que exige Supabase de staging e a lista de papéis/rotas do item 3.5.

## Problema

A API confia em qualquer token válido do Supabase Auth, independentemente de o usuário ter feito o segundo fator. O JWT do Supabase carrega os claims `aal` (`aal1` = só senha, `aal2` = senha + MFA) e `amr` (métodos usados), mas o `JwtVerifierService` descarta tudo exceto o `sub`. Sem ler o `aal`, não existe defesa em profundidade: mesmo que o web force a inscrição, uma chamada direta à API com um token `aal1` passa.

## Objetivo

Deixar o enforcement pronto para ser **ligado por configuração**, sem risco de travar acesso enquanto a tela de inscrição não existir.

## Decisões

1. **Nível de garantia vira parte do contexto autenticado.** `JwtVerifierService.verify` passa a devolver `VerifiedAccessToken { subject, assuranceLevel, methods }` em vez de uma string. O `JwtAuthGuard` grava `assuranceLevel` no request.
2. **Claim ausente = `aal1`.** Projetos Supabase sem MFA configurado podem omitir `aal`. Tratar ausência como `aal1` é o padrão seguro: nunca concede AAL2 por omissão. Valor desconhecido (nem `aal1` nem `aal2`) também degrada para `aal1`, em vez de rejeitar o token — a decisão de barrar é do guard de MFA, não do verificador.
3. **Rota declara a exigência; ambiente decide se ela vale.** `@RequireMfa()` marca a rota; `MfaGuard` só rejeita quando `MFA_ENFORCEMENT=enforced`. O default é `disabled`, então mesclar este incremento **não altera comportamento em nenhum ambiente**. Ligar é uma mudança de env var, reversível sem deploy de código.
4. **Erro dedicado.** `403 MFA_REQUIRED` (não `401`): o token é válido, o que falta é o fator. Isso permite ao cliente distinguir "faça login" de "conclua a verificação em dois fatores".
5. **Nenhuma rota é marcada ainda.** A lista de rotas sensíveis é decisão de produto (item 3.5). Marcar rotas agora, mesmo com enforcement desligado, criaria um falso sinal de cobertura.
6. **`/api/v1/me` expõe o nível.** O web precisa saber se a sessão é `aal1` ou `aal2` para decidir se pede a inscrição; devolver isso junto do principal evita decodificar o JWT no cliente. É um **campo adicional** (`assuranceLevel`), não um envelope: mantém o consumo atual do web funcionando, e o contrato usa `.default('aal1')` para tolerar uma API mais antiga durante o deploy.

## Arquivos

- `apps/api/src/modules/auth/access-token-claims.ts` (novo) — parsing puro dos claims, testável sem JWKS.
- `apps/api/src/modules/auth/jwt-verifier.service.ts` — devolve `VerifiedAccessToken`.
- `apps/api/src/modules/auth/jwt-auth.guard.ts` — grava `assuranceLevel` no request.
- `apps/api/src/common/http/authenticated-request.ts` — campo `assuranceLevel`.
- `apps/api/src/common/auth/require-mfa.decorator.ts` (novo).
- `apps/api/src/common/auth/mfa.guard.ts` (novo).
- `apps/api/src/common/auth/current-assurance-level.decorator.ts` (novo).
- `apps/api/src/config/api-config.service.ts` — env `MFA_ENFORCEMENT`.
- `apps/api/src/app.module.ts` — registra o `MfaGuard` depois do `JwtAuthGuard`.
- `apps/api/src/modules/auth/me.controller.ts` — acrescenta `assuranceLevel` à resposta.
- `packages/contracts/src/auth.ts` — `assuranceLevelSchema` e o campo em `principalResponseSchema`.
- `.env.example` / `docs/operations/deploy-staging.md` — documentar a env var.
- Testes: `access-token-claims.test.ts`, `mfa.guard.test.ts`.

## Riscos

| Risco                                                    | Mitigação                                                            |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| Ligar o enforcement sem tela de inscrição trava o acesso | Default `disabled`; rollout documentado exige a tela publicada antes |
| Mudança de assinatura do `verify` quebra chamadores      | Um único chamador (`JwtAuthGuard`); typecheck cobre                  |
| Contrato de `/api/v1/me` muda para o web                 | Campo aditivo com default no schema; nenhum consumidor quebra        |

## Critérios de aceite

- `MFA_ENFORCEMENT` ausente ⇒ comportamento idêntico ao de hoje (nenhum 403 novo).
- Com `enforced` e rota marcada: token `aal2` passa, `aal1` recebe `403 MFA_REQUIRED`, rota pública e rota não marcada seguem livres.
- Claim `aal` ausente ou inválido resolve para `aal1`.
- Gates locais verdes: `format:check`, `lint`, `typecheck`, `test`, `build`.
