# Evidências da Fase 1

## Escopo entregue

Fundação modular, banco/migrations, autenticação, multi-tenancy, RBAC/capabilities, RLS, auditoria, feature flags, service layer, mock CRM, Helena bloqueada, testes, observabilidade básica e CI.

Nenhum módulo da Fase 2 foi iniciado.

## Comandos executados

| Comando                             | Resultado                                   |
| ----------------------------------- | ------------------------------------------- |
| `pnpm install`                      | lockfile criado; supply-chain policy passou |
| `pnpm format` / `pnpm format:check` | passou                                      |
| `pnpm lint`                         | passou sem warnings                         |
| `pnpm typecheck`                    | passou em 6 workspaces executáveis          |
| `pnpm test`                         | 5 arquivos; 11 testes passaram              |
| `pnpm build`                        | Next.js e NestJS passaram                   |
| `pnpm test:e2e`                     | 2 testes Chromium passaram                  |
| `pnpm audit --prod`                 | nenhuma vulnerabilidade conhecida           |
| `pnpm db:start`                     | bloqueado: daemon Docker ausente            |

## Isolamento versionado

A suíte pgTAP contém 15 assertions para dois tenants, scopes de clínica, viewer sem mutation, Especialista atribuído, integração isolada, idempotência, auditoria, FK composta e revogação imediata.

O job `database` no CI executa `db:start`, `db:reset`, `db:lint` e `test:db`. A Fase 1 não deve ser promovida a staging sem esse job verde.

## Segurança

- service role não existe na configuração web/API da Fundação;
- publishable key é a única chave permitida no navegador;
- JWT é verificado por JWKS na API;
- capabilities e RLS aplicam defesa em profundidade;
- mutations de membership usam RPC security-definer com autorização interna;
- idempotency keys são persistidas somente como SHA-256;
- logs removem authorization, cookie, password, token e set-cookie;
- mensagens, anexos e conteúdo clínico não são persistidos.

## Revisão visual

Home revisada em Chromium a 1440×1000. Hierarquia, contraste, foco e ausência de aparência de CRM/call center foram verificados. O site completo e a identidade definitiva continuam fora da Fundação.

## Limitações para aceite final

- executar migrations/pgTAP em Docker ou CI;
- regenerar `packages/contracts/src/database.types.ts` a partir do schema executado;
- revisar o diff gerado e repetir typecheck/build;
- definir projeto Supabase remoto e fluxo de provisionamento somente antes de staging;
- não iniciar a Fase 2 sem aprovação explícita.
