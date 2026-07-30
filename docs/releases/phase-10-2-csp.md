# Fase 10, incremento 10.2 — Content-Security-Policy no web

## Resultado

Implementado em 22 de julho de 2026 no branch `security/csp-web`. Todas as respostas do web agora recebem uma CSP estática que restringe origens de conexão, submissão de formulários, enquadramento, plugins e URLs relativas sem tornar dinâmicas as páginas institucionais.

A landing e as demais rotas públicas continuam pré-renderizadas. A política de produção remove as permissões usadas pelo HMR (`'unsafe-eval'` e `ws:`), acrescenta `upgrade-insecure-requests` e inclui a origem de `NEXT_PUBLIC_SUPABASE_URL` em `connect-src` quando a configuração é válida. URL ausente ou inválida falha fechada em `'self'`.

## Escopo entregue

- montagem central da CSP em `apps/web/next.config.ts`;
- diretivas críticas `default-src`, `base-uri`, `connect-src`, `form-action`, `frame-ancestors` e `object-src`;
- variação explícita entre desenvolvimento e produção;
- testes unitários da política e do fallback da origem do Supabase;
- E2E do header e de todas as 12 páginas públicas;
- porta e comando do servidor E2E configuráveis, com dois workers para evitar saturação do `next dev`;
- registro do controle e da limitação no modelo de segurança.

## Evidências

- `pnpm check` verde: formatação, lint, typecheck, 125 testes em 32 arquivos e build completo.
- Build Next.js com 15 páginas estáticas; `/` permaneceu `○ Static`.
- E2E em desenvolvimento: 17 testes verdes e 1 teste exclusivo de produção ignorado.
- E2E contra `next start`: 2 testes verdes, cobrindo as 12 rotas públicas e a ausência de `'unsafe-eval'`/`ws:`.

## Limitação assumida

Sem uma nonce por requisição, o App Router exige `'unsafe-inline'` em `script-src` e `style-src`. Portanto, esta CSP reduz exfiltração, clickjacking e sequestro de formulário, mas não é tratada como defesa completa contra XSS. Uma política com nonce exigiria proxy por requisição e sacrificaria o prerender estático da landing; essa troca não foi adotada neste incremento.
