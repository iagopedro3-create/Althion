# Configuração local

## Requisitos

- Node.js 24.x e pnpm 11.x;
- Docker Desktop, Rancher Desktop ou runtime compatível com Docker APIs;
- pelo menos 7 GB disponíveis para os serviços locais do Supabase.

O Supabase local não deve ser exposto em rede pública.

## Instalação

```powershell
corepack enable
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm db:start
pnpm db:reset
```

Copie para `apps/web/.env.local` os valores `NEXT_PUBLIC_*` e `ALTHION_API_URL`. Para a API, carregue as variáveis server-side de `.env.local` pelo terminal ou pelo mecanismo do ambiente; o arquivo não é versionado.

A chave pública/publishable pode estar no navegador. Service role, secret key e tokens nunca usam prefixo `NEXT_PUBLIC_`.

## Usuários sintéticos

O seed cria identidades sem senha apenas para testes RLS. Para testar login manualmente, crie um usuário local pelo Supabase Studio e conceda a membership usando SQL local controlado ou a RPC como um owner já autenticado. Não copie usuário de produção.

## Execução

Em terminais separados:

```powershell
pnpm dev:api
pnpm dev:web
```

- Web: `http://127.0.0.1:3000`
- API: `http://127.0.0.1:4000`
- Supabase Studio: `http://127.0.0.1:54323`
- Mailpit: `http://127.0.0.1:54324`

## Verificações

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm db:lint
pnpm test:db
pnpm test:e2e
```

`pnpm test:e2e` sobe o próprio servidor em `127.0.0.1:3210` — porta dedicada, e não a `3000` do `pnpm dev:web`. O Playwright reaproveita um servidor que já esteja escutando na porta, então compartilhar a porta padrão faria a suíte rodar contra o `next dev` de qualquer outro projeto e reprovar (ou aprovar) por engano. Use `E2E_PORT` para mudar.

Um `pnpm dev:web` já em execução impede o Playwright de subir a sua instância (o Next recusa duas instâncias no mesmo diretório). Encerre-o antes, ou aponte a suíte para ele com `E2E_PORT=3000`.

`pnpm db:reset` é destrutivo somente para o banco local. Não execute `--linked` sem aprovação e confirmação explícita do projeto alvo.

## Docker indisponível

Sem um runtime Docker, código, testes unitários, integração HTTP e builds continuam disponíveis, mas migrations, pgTAP e geração real de `database.types.ts` não podem ser validados localmente. O CI executa essas verificações em runner com Docker.
