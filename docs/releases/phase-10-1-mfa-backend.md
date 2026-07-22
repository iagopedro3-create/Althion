# Fase 10, incremento 10.1 — MFA no backend (enforcement desligado)

## Resultado

Implementado em 22 de julho de 2026 no branch `security/mfa-backend`. A API passou a **ler e propagar** o nível de garantia da autenticação (claim `aal` do Supabase Auth) e ganhou um guard que exige segundo fator nas rotas marcadas. O enforcement é controlado pela env var `MFA_ENFORCEMENT`, cujo padrão é `disabled` — **este incremento não muda o comportamento de nenhum ambiente**.

Fecha o passo 3 do anexo de MFA do `docs/operations/go-live-checklist.md` (item 2.3). Os passos 1, 2, 4 e 5 (inscrição TOTP no web, sessão AAL2 ponta a ponta, guard no web, rollout) continuam pendentes de Supabase de staging e da lista de rotas do item 3.5.

## Escopo entregue

### Verificação do token

`parseAccessTokenClaims` (`apps/api/src/modules/auth/access-token-claims.ts`) extrai `sub`, `aal` e `amr` de um payload já verificado. Ficou separado do `JwtVerifierService` justamente para ser testável sem JWKS remoto.

`JwtVerifierService.verify` passou a devolver `VerifiedAccessToken { subject, assuranceLevel, methods }` em vez de uma string; o `JwtAuthGuard` grava `assuranceLevel` no request, ao lado de `accessToken` e `principal`.

### Postura diante de claims ausentes ou estranhos

`aal` ausente ou com valor desconhecido resolve para `aal1`. Projetos Supabase sem MFA configurado podem simplesmente não emitir o claim; conceder `aal2` por omissão seria o erro caro. `amr` malformado vira lista vazia — é dado de auditoria, não de decisão, e não deve derrubar a sessão.

### Guard e decorator

`@RequireMfa()` marca rota ou controlador. `MfaGuard` (registrado como `APP_GUARD` logo após o `JwtAuthGuard`) só age quando `MFA_ENFORCEMENT=enforced`; então rejeita sessões que não sejam `aal2` com **`403 MFA_REQUIRED`**. O 403 é deliberado: o token é válido, o que falta é o fator — assim o cliente distingue "faça login" de "conclua a verificação em duas etapas". Rotas `@Public()` continuam livres mesmo se marcadas.

**Nenhuma rota foi marcada.** A lista de rotas sensíveis é decisão de produto (item 3.5 do checklist); marcá-las agora criaria falso sinal de cobertura.

### Contrato

`principalResponseSchema` ganhou `assuranceLevel` (campo aditivo, com `.default('aal1')`), e `/api/v1/me` passou a devolvê-lo. O web pode decidir se pede a inscrição no segundo fator sem decodificar o JWT no cliente. O default no schema mantém o web compatível com uma API mais antiga durante o deploy.

## Evidências

- Gates locais verdes: `format:check`, `lint`, `typecheck`, `test` (122 testes, 31 arquivos), `build`.
- Testes novos: `access-token-claims.test.ts` (5 casos, incluindo degradação de `aal` desconhecido) e `mfa.guard.test.ts` (6 casos, cobrindo enforcement desligado, `aal2`, `aal1`, nível ausente, rota não marcada e rota pública).
- Em `mfa.guard.test.ts` os decorators são aplicados via `Reflect.defineMetadata` porque o transform do vitest não emite metadata de decorator; o efeito sobre o `Reflector` é o mesmo.

## Limitações

- Não existe tela de inscrição TOTP; ligar `MFA_ENFORCEMENT=enforced` com rotas marcadas trancaria o acesso de quem ainda não se inscreveu.
- O fluxo `enroll`/`challenge`/`verify` e os códigos de recuperação não foram construídos — exigem Supabase real.
- O caminho `aal2` foi testado com payloads sintéticos, não contra um JWT emitido pelo Supabase com MFA verificado.
- `amr` é coletado mas ainda não é registrado em auditoria.

## Próximos passos

1. Supabase de staging no ar (itens 1.3–1.8 do checklist).
2. Definir com Produto quais papéis/rotas exigem AAL2 (item 3.5) e aplicar `@RequireMfa()`.
3. Construir a inscrição TOTP no web e o guard de rota correspondente.
4. Ligar `MFA_ENFORCEMENT=enforced` em staging, começando por `platform_admin`.
