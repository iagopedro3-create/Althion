# Runbook — Deploy de Staging

> **SCAFFOLD — VALIDAR ANTES DE USAR.** Este runbook e os artefatos referenciados (`.github/workflows/deploy-staging.yml`, `apps/api/Dockerfile`) foram preparados sem acesso a segredos nem a um ambiente com Docker/contas reais. As instruções são fundamentadas na arquitetura do projeto, mas **precisam de uma primeira execução real** (um `docker build`, um deploy com secrets configurados) para serem confirmadas. Campos `[entre colchetes]` são valores que só você tem.

## Topologia proposta

| Componente | Tecnologia                               | Hospedagem proposta                                                                                                      | Estado da decisão                                      |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Web        | Next.js (`apps/web`)                     | **Vercel** (root do projeto = `apps/web`)                                                                                | proposto/aceito                                        |
| API        | NestJS (`apps/api`, `node dist/main.js`) | **Container host a decidir** (Railway, Render, Fly.io, Cloud Run, VM…) — servidor de longa duração, **não** é serverless | **PENDENTE** (ver `docs/architecture/architecture.md`) |
| Banco/Auth | Supabase PostgreSQL                      | **Supabase** (projeto remoto `[yzbmmkyhsjkrdjknspnv]`)                                                                   | projeto existe; migrations não aplicadas               |

Regra de ouro: **staging usa dados exclusivamente sintéticos** e credenciais **não produtivas**. Nenhum dado real antes da revisão jurídica (`docs/legal/`).

## Pré-requisitos

- Acesso de owner ao repositório GitHub e permissão para configurar Environments/Secrets.
- Conta Vercel com um projeto criado para a Althion (web).
- Projeto Supabase de **staging** (idealmente separado do de produção) e sua senha de banco.
- Provedor escolhido para a API (para a Parte 3).
- `supabase` CLI e Docker instalados na máquina de quem for rodar os passos manuais.

## Segredos a configurar

Configure em **GitHub → Settings → Environments → `staging` → Secrets** (o Environment permite exigir aprovação manual antes de rodar):

| Secret                  | Usado por  | Observação                              |
| ----------------------- | ---------- | --------------------------------------- |
| `SUPABASE_ACCESS_TOKEN` | migrations | token pessoal da conta Supabase (CLI)   |
| `SUPABASE_PROJECT_REF`  | migrations | ex.: `[yzbmmkyhsjkrdjknspnv]` (staging) |
| `SUPABASE_DB_PASSWORD`  | migrations | senha do banco do projeto de staging    |
| `VERCEL_TOKEN`          | web        | token da conta Vercel                   |
| `VERCEL_ORG_ID`         | web        | id da organização/time                  |
| `VERCEL_PROJECT_ID`     | web        | id do projeto web na Vercel             |

**Nunca** coloque `service_role` do Supabase no web nem em `NEXT_PUBLIC_*`. A API usa **JWT do usuário + validação por JWKS** e chave _publishable_ — não precisa de service role.

### Variáveis de ambiente por aplicação

**Web (Vercel):**

```
NEXT_PUBLIC_SUPABASE_URL=https://[REF].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[publishable-key-staging]
ALTHION_API_URL=https://[HOST-DA-API-STAGING]
NEXT_PUBLIC_APP_URL=https://[DOMINIO-STAGING-DO-WEB]
```

**API (container host):**

```
NODE_ENV=production
API_PORT=4000
API_HOST=0.0.0.0
CORS_ORIGINS=https://[DOMINIO-STAGING-DO-WEB]
SUPABASE_URL=https://[REF].supabase.co
SUPABASE_PUBLISHABLE_KEY=[publishable-key-staging]
SUPABASE_JWT_ISSUER=https://[REF].supabase.co/auth/v1
SUPABASE_JWT_AUDIENCE=authenticated
LOG_LEVEL=info
```

## Parte 1 — Banco (Supabase remoto)

Aplique as migrations ao projeto de staging. **Faça um dry-run antes.**

```bash
# 1. Autenticar e linkar o projeto de staging
supabase login                       # ou export SUPABASE_ACCESS_TOKEN=...
supabase link --project-ref [REF]    # senha do banco quando solicitada

# 2. Conferir o que será aplicado (dry-run)
supabase db push --dry-run

# 3. Aplicar as migrations
supabase db push

# 4. Regenerar os tipos a partir do schema REMOTO e revisar o diff
supabase gen types typescript --project-id [REF] > packages/contracts/src/database.types.ts
git diff packages/contracts/src/database.types.ts   # revisar antes de commitar

# 5. (Staging) Popular com o seed SINTÉTICO — nunca em produção
#    Aplicar supabase/seed.sql manualmente via SQL editor ou psql, se desejado.
```

Notas:

- O CI já valida migrations + RLS + 153 assertions pgTAP em ambiente efêmero (job `database` do `ci.yml`); a Parte 1 aplica ao ambiente **persistente** de staging.
- `database.types.ts` é baseline manual até este passo; após aplicar, ele passa a refletir o schema real.

## Parte 2 — Web (Vercel)

**Recomendado: integração nativa de Git da Vercel** (mais simples e robusta que deploy por CLI):

1. Na Vercel, crie/conecte o projeto ao repositório e defina **Root Directory = `apps/web`**.
2. Framework: Next.js (autodetectado). Build/output: padrão.
3. Configure as variáveis de ambiente do web (acima) no ambiente **Preview/Staging**.
4. Defina a branch de staging (ex.: deploy automático de `main` para o ambiente de staging).

**Alternativa: deploy por CI** — ver o job `web-vercel` em `.github/workflows/deploy-staging.yml` (usa `VERCEL_TOKEN`/`ORG`/`PROJECT`). Use só se você preferir orquestrar pela Action em vez da integração de Git.

## Parte 3 — API (container host a decidir)

A API é um servidor Node de longa duração. Use o `apps/api/Dockerfile` (portável) e publique no host escolhido.

```bash
# Build local do container (validar antes de publicar)
docker build -f apps/api/Dockerfile -t althion-api:staging .

# Teste local
docker run --rm -p 4000:4000 --env-file [arquivo-env-api] althion-api:staging
# Healthcheck
curl -fsS http://localhost:4000/health/ready
```

Depois, publique conforme o provedor (Railway/Render/Fly/Cloud Run): aponte o build para `apps/api/Dockerfile`, injete as variáveis de ambiente da API e exponha a porta `4000`. Configure `CORS_ORIGINS` com o domínio do web.

**Decisão pendente:** escolher o provedor da API. Critérios: suporte a container Node de longa duração, região (preferir Brasil por LGPD), variáveis/segredos, health checks, custo. Ver `docs/legal/` (transferência internacional, art. 33).

## Parte 4 — Verificação pós-deploy

- API: `GET /health/live` e `GET /health/ready` respondem 200.
- Web: home e páginas do site carregam; `/entrar` acessível.
- Fluxo autenticado com **usuário sintético** provisionado no Supabase de staging (não usar conta real).
- Conferir CORS (web → API) e ausência de `service_role` no bundle do browser.

## Rollback

- **Web (Vercel):** promover o deployment anterior (Instant Rollback) ou reverter o commit.
- **API:** re-deploy da imagem/tag anterior.
- **Banco:** migrations são **aditivas**; SQL destrutivo exige aprovação específica. Não há "rollback" automático de migration — para reverter, criar uma nova migration corretiva. Manter backup antes de mudanças de schema relevantes.

## Ordem recomendada na primeira vez

1. Supabase staging (Parte 1) — banco pronto e tipos revisados.
2. API (Parte 3) — validar `docker build` e health checks.
3. Web (Parte 2) — apontando `ALTHION_API_URL` para a API já no ar.
4. Verificação (Parte 4).

## Itens que dependem de você

- [ ] Escolher o **provedor da API** e a **região** dos dados.
- [ ] Criar o projeto Supabase de **staging** e a senha do banco.
- [ ] Criar o projeto **Vercel** (root `apps/web`) e o domínio de staging.
- [ ] Preencher os **Secrets** do Environment `staging` no GitHub.
- [ ] Provisionar **usuários sintéticos** para o E2E autenticado.
