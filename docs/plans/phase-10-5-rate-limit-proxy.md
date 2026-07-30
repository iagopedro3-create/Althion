# Plano — Fase 10, incremento 10.5: rate limit por cliente real atrás de proxy

> Escopo: corrigir a identificação do cliente no throttler da API. Não troca o armazenamento do contador nem redesenha os limites por rota.

## Problema

`app.module.ts` registra `ThrottlerModule.forRoot([{ limit: 100, ttl: 60_000 }])` como `APP_GUARD`. O `ThrottlerGuard` do `@nestjs/throttler` identifica o cliente por `req.ip` (`getTracker(req) { return req.ip }`), e o Express só deriva `req.ip` do cabeçalho `X-Forwarded-For` quando `trust proxy` está configurado — o que **não acontece** em nenhum dos dois entrypoints (`main.ts` e o adaptador serverless `api/index.ts`).

Na Vercel, toda requisição chega pelo proxy da plataforma. Sem `trust proxy`, `req.ip` é o endereço do proxy, **igual para todos os clientes**. Consequências, em ordem de gravidade:

1. **Negação de serviço autoinfligida.** Os 100 req/min passam a ser um teto agregado da API inteira. Um único cliente ruidoso — ou simplesmente o tráfego somado de várias clínicas — derruba todo mundo com `429`. O controle criado para conter abuso vira o vetor de indisponibilidade.
2. **Nenhuma proteção real.** Não existe limite por cliente: quem abusa consome a cota comum, e o efeito recai sobre terceiros em vez de sobre quem abusa.

O sintoma só apareceria em produção, sob carga — depois do piloto começar.

## Objetivo

Que o contador seja por **cliente real**, com a confiança no `X-Forwarded-For` sendo uma decisão explícita de configuração, e não um efeito colateral do ambiente.

## Decisões

1. **`TRUST_PROXY_HOPS` (inteiro, padrão `0`).** Confiar no `X-Forwarded-For` por padrão seria pior que não confiar: qualquer cliente forjaria o cabeçalho e trocaria de balde à vontade. O padrão seguro é não confiar em ninguém; atrás da Vercel o valor correto é `1` (um salto). O número de saltos é propriedade do **deploy**, não do código — por isso vira env var, documentada junto dos demais segredos de ambiente.
2. **Aplicar via `trust proxy` do Express, não reimplementar o parsing.** O Express já trata lista de saltos, `X-Forwarded-For` com múltiplos endereços e endereços inválidos. Reescrever isso seria criar uma segunda implementação para divergir da primeira.
3. **Tracker explícito, com o caso indefinido nomeado.** Um `ThrottlerGuard` próprio resolve o cliente por uma função pura (`resolveClientIdentity`) e, quando nenhum endereço é resolvível, usa a chave `unresolved-client` em vez de deixar `undefined` virar chave. A diferença é diagnóstica: um balde chamado `unresolved-client` estourando é um sinal legível de configuração errada; `undefined` é um balde compartilhado silencioso — o mesmo defeito que este incremento corrige.
4. **Aviso no bootstrap, não recusa.** `NODE_ENV=production` com `TRUST_PROXY_HOPS=0` registra `warn` explicando que o limite será agregado. Recusar subir seria errado: existe deploy legítimo sem proxy à frente (container exposto direto), e derrubar a API por uma escolha de topologia é pior que o problema.
5. **O armazenamento continua em memória — e isso vira limitação registrada.** Em serverless, cada instância tem o próprio contador, então o teto efetivo é `limite × instâncias`. Corrigir exige store compartilhado (Redis/Postgres), que é decisão de infraestrutura com custo — fora do alcance deste incremento. Registrar é o que impede que o throttler seja tratado como controle mais forte do que é.

## Arquivos

- `apps/api/src/config/api-config.service.ts` — env `TRUST_PROXY_HOPS`.
- `apps/api/src/configure-application.ts` — aplica `trust proxy` e emite o aviso.
- `apps/api/src/common/http/client-identity.ts` (novo) — `resolveClientIdentity`, pura.
- `apps/api/src/common/http/client-identity.guard.ts` (novo) — `ClientIdentityThrottlerGuard`.
- `apps/api/src/app.module.ts` — usa o guard próprio no lugar do `ThrottlerGuard`.
- `.env.example`, `docs/operations/deploy-staging.md`, `docs/security/security-model.md` — configuração e limitação.
- Testes: `client-identity.test.ts`, `configure-application.test.ts`.

## Riscos

| Risco                                                      | Mitigação                                                                                                                                                         |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TRUST_PROXY_HOPS` alto demais confia em salto forjável    | Padrão `0`; documentado que o valor é o número de proxies **sob controle**, e na Vercel é `1`                                                                     |
| Clínica inteira atrás de um IP público compartilha o balde | Registrado como limitação conhecida; bucketing por identidade autenticada exigiria rodar o throttler depois do `JwtAuthGuard`, mudança de ordem fora deste escopo |
| Limite por instância em serverless dá teto efetivo maior   | Registrado explicitamente; store compartilhado é decisão de infraestrutura                                                                                        |

## Critérios de aceite

- Com `TRUST_PROXY_HOPS=1` e `X-Forwarded-For: cliente, proxy`, o tracker é o endereço do cliente.
- Com `TRUST_PROXY_HOPS=0`, o tracker é o endereço do socket e o `X-Forwarded-For` é ignorado.
- Sem endereço resolvível, a chave é `unresolved-client`.
- Produção sem saltos confiáveis registra aviso e sobe assim mesmo.
- Gates locais verdes: `format:check`, `lint`, `typecheck`, `test`, `build`.
