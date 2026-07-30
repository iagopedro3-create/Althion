# Fase 10, incremento 10.5 — rate limit por cliente real atrás de proxy

## Resultado

Implementado em 30 de julho de 2026 no branch `security/rate-limit-proxy`. O throttler global da API passa a identificar o cliente pelo endereço real quando existe um proxy confiável à frente, em vez de agrupar todo mundo no endereço do proxy.

## O defeito corrigido

`ThrottlerGuard` identifica o cliente por `req.ip`, e o Express só deriva esse valor do `X-Forwarded-For` quando `trust proxy` está configurado — o que não acontecia em nenhum dos dois entrypoints (`main.ts` e o adaptador serverless). Na Vercel, toda requisição chega pelo proxy da plataforma, então `req.ip` seria **o mesmo para todos os clientes**.

O efeito não é "rate limit fraco": é **negação de serviço autoinfligida**. Os 100 req/min viram um teto agregado da API inteira, e um único cliente ruidoso — ou o tráfego somado de várias clínicas — responde `429` para todos os outros. O controle criado para conter abuso seria o vetor de indisponibilidade, e o sintoma só apareceria em produção sob carga, depois do piloto começar.

## Escopo entregue

### `TRUST_PROXY_HOPS`, com padrão seguro

Nova env var inteira, padrão `0`. Confiar no `X-Forwarded-For` por padrão seria pior que não confiar: qualquer cliente forjaria o cabeçalho e trocaria de balde à vontade. Atrás da Vercel o valor correto é `1`. O número de saltos é propriedade do **deploy**, não do código.

`configure-application.ts` aplica o valor via `trust proxy` do Express — sem reimplementar o parsing de cadeia de saltos, que já existe e seria uma segunda implementação a divergir da primeira.

### Tracker explícito, com o caso indefinido nomeado

`ClientIdentityThrottlerGuard` resolve o cliente por `resolveClientIdentity`, função pura. Quando nenhum endereço é resolvível, a chave é `unresolved-client` em vez de deixar `undefined` virar chave. A diferença é diagnóstica: um balde com nome estourando é sinal legível de configuração errada; `undefined` seria um balde compartilhado silencioso — o mesmo defeito que o incremento corrige.

### Aviso no boot, não recusa

Produção com `TRUST_PROXY_HOPS=0` registra `warn` explicando que o limite será agregado. Recusar subir seria errado: um container exposto direto é topologia legítima, e derrubar a API por uma escolha de topologia é pior que o problema.

## Evidências

- **Testes de integração sobre o `AppModule` real** (não um módulo de mentira), provando os dois lados: com um salto confiável, cada cliente encaminhado tem cota própria e o cliente que estoura recebe `429` com `Retry-After` sem afetar os demais; sem salto confiável, o segundo cliente recebe `429` por causa do balde compartilhado — o defeito fica fixado e detectável.
- Testes unitários de `resolveClientIdentity` (5 casos, incluindo entradas em branco e o caso irresolúvel) e da condição de aviso.
- Gates locais verdes: `format:check`, `lint`, `typecheck`, `test` (138 testes em 36 arquivos) e `build`.

## Limitações registradas

- **Contador em memória por instância.** Em serverless, cada instância tem o próprio contador, então o teto efetivo é `limite × instâncias`. Corrigir exige store compartilhado (Redis/Postgres) — decisão de infraestrutura com custo, ainda não tomada. Enquanto isso, o controle vale como contenção de rajada, não como defesa contra abuso distribuído.
- **Balde por endereço.** Uma clínica inteira atrás de um IP público compartilha cota. Bucketing por identidade autenticada exigiria rodar o throttler depois do `JwtAuthGuard`, mudança de ordem de guards fora deste escopo.
- O limite continua único e global (100 req/min); não há teto por rota conforme risco.

## Nota de infraestrutura

`TRUST_PROXY_HOPS=1` precisa ser preenchido nos Secrets do Environment `staging` (item 1.9 do go-live checklist) junto das demais variáveis da API. Sem isso o deploy sobe com o comportamento agregado — e com o aviso no log.
