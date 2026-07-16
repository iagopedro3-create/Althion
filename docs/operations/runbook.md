# Runbook da Fundação

## Health

- `GET /health/live`: processo aceita requests; não consulta dependências.
- `GET /health/ready`: readiness mínima da API. Dependências entram quando houver checks que não exponham detalhes.

Ambas são públicas, rate-limited e não retornam segredo, versão interna ou configuração.

## Sintomas principais

| Código/estado              | Interpretação                    | Ação                                      |
| -------------------------- | -------------------------------- | ----------------------------------------- |
| `AUTHENTICATION_REQUIRED`  | bearer ausente ou inválido       | renovar login; não registrar token        |
| `PROFILE_NOT_PROVISIONED`  | Auth existe sem profile          | verificar trigger/provisionamento         |
| `ACCESS_DENIED`            | capability ou scope insuficiente | revisar membership/assignment e auditoria |
| `DATA_SERVICE_UNAVAILABLE` | Data API indisponível/falhou     | validar Supabase e correlation ID         |
| `PROVIDER_NOT_CONFIGURED`  | Helena propositalmente bloqueada | não improvisar URL; obter documentação    |
| integration `blocked`      | conexão não habilitada           | estado esperado na Fase 1                 |

## Revogação de acesso

1. Owner autorizado chama o command de revogação com idempotency key.
2. A RPC valida que não remove o último owner, revoga e audita na mesma transação.
3. RLS deixa de reconhecer a membership no request seguinte.
4. Se houver suspeita de comprometimento, revogar também sessões no Supabase Auth e registrar incidente.

## Segredo exposto

1. Não imprimir nem copiar o valor em issue/chat.
2. Revogar/rotacionar no provedor.
3. Verificar logs, histórico Git e ambientes afetados.
4. Se entrou no Git, tratar histórico como comprometido; remover o texto não invalida o segredo.
5. Registrar incidente, impacto, ações e evidências sanitizadas.

## Possível vazamento cross-tenant

1. Classificar como incidente crítico.
2. Suspender a rota/job afetado por feature flag ou deploy seguro.
3. Preservar logs e correlation IDs sem ampliar acesso.
4. Reproduzir com tenants sintéticos.
5. Corrigir policy, capability e constraint; adicionar teste negativo.
6. Seguir avaliação e comunicação LGPD/contratual aplicável.

## Helena

Não existe operação real na Fase 1. Nenhum erro autoriza criar endpoint, credencial ou payload por tentativa. O desbloqueio segue `docs/architecture/integrations.md`.

## Backup e restore

A Fundação versiona migrations e seed sintético. Backup/restore de ambiente remoto depende da escolha do projeto Supabase e deve ser exercitado antes do piloto; ainda não há ambiente remoto autorizado.
