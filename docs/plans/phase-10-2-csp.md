# Plano — Fase 10, incremento 10.2: Content-Security-Policy no web

## Problema

O web serve `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options` e `X-Frame-Options`, mas **não** serve `Content-Security-Policy`. Sem CSP, nada impede que um script injetado exfiltre dados para um host arbitrário, que um `<base>` injetado reescreva URLs relativas, ou que um formulário seja apontado para fora do domínio — controles que os headers atuais não cobrem.

## Decisões

1. **CSP estática no `next.config.ts`, sem nonce.** A abordagem com nonce exige gerar o valor por requisição no `proxy.ts`, o que **força renderização dinâmica em todas as rotas** e derruba o prerender estático da landing (hoje `○ Static`). Para um site institucional de marketing, esse custo não se paga: as diretivas que realmente reduzem superfície aqui (`connect-src`, `form-action`, `base-uri`, `object-src`, `frame-ancestors`) funcionam igual sem nonce.
2. **`script-src` aceita `'unsafe-inline'`, e isso é declarado como limitação.** O App Router injeta scripts inline (payload do Flight, bootstrap). Sem nonce não há como restringi-los. A CSP não vira, portanto, uma defesa forte contra XSS — vira defesa contra exfiltração, clickjacking e sequestro de formulário. Fingir o contrário no doc seria pior do que não ter CSP.
3. **Diretivas variam por ambiente.** O dev server (Turbopack) precisa de `'unsafe-eval'` e de WebSocket para HMR. Em produção nenhum dos dois é permitido, e entra `upgrade-insecure-requests`.
4. **`connect-src` inclui a origem do Supabase.** O cliente do browser fala com o Supabase Auth direto; a API da Althion é chamada do servidor, então não entra aqui. A origem sai de `NEXT_PUBLIC_SUPABASE_URL` — se a env var faltar no build, cai só para `'self'` (falha fechada, não abre curinga).
5. **`frame-ancestors 'none'` além do `X-Frame-Options`.** O header antigo é ignorado por navegadores modernos quando há CSP; manter os dois cobre também navegadores antigos.

## Arquivos

- `apps/web/next.config.ts` — montagem da CSP.
- `apps/web/next-config.test.ts` — diferenças entre ambientes e fallback fechado.
- `e2e/foundation.spec.ts` — asserção do header e das diretivas críticas.
- `docs/security/security-model.md` — registro do controle e da limitação.

## Verificação

- E2E completo verde (o console do browser não pode acumular violações de CSP nas rotas públicas).
- Build de produção mantém a landing como estática.

## Critérios de aceite

- Toda resposta HTML carrega `Content-Security-Policy`.
- `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`.
- Nenhuma rota pública quebra visualmente nem registra violação de CSP.
