# ADR 0001 — Fundação técnica

- Status: aceita provisoriamente para a Fase 1
- Data: 2026-07-16

## Contexto

O repositório começou vazio. A Fundação precisa suportar autenticação, multi-tenancy, integrações substituíveis e evolução gradual sem antecipar microserviços ou funcionalidades clínicas.

## Decisão

- Monorepo com pnpm workspaces, TypeScript estrito, Next.js e NestJS.
- Modular monolith na API; worker somente quando houver job real.
- Supabase Auth e PostgreSQL com RLS deny-by-default.
- API valida JWT via JWKS e acessa o Data API com o token do usuário.
- Um papel tenant efetivo por membership e scopes explícitos por organização, clínica ou unidade.
- Especialista recebe acesso por assignment, não por membership ampla.
- Login inicial por convite/e-mail e senha; cadastro público desabilitado; MFA TOTP habilitado no Auth local e obrigatório para plataforma antes de produção.
- Mutations de membership ocorrem por RPC atômica com autorização, idempotência e auditoria.
- Helena opera em paralelo como motor operacional; a integração de dados Althion↔Helena é opcional, desligada por padrão e sem endpoint fictício.

## Consequências

- A defesa combina capabilities na API, RLS e constraints compostas no banco.
- Processos privilegiados não são necessários nos requests comuns da Fundação.
- Provisionamento de primeiro owner/platform admin permanece administrativo e precisa de runbook antes de staging.
- O acesso Supabase user-scoped deve ser reavaliado com queries transacionais reais; um ORM não será adicionado até provar benefício sem enfraquecer RLS.
- Fluxos de convite, MFA e papéis serão revisitados com as clínicas piloto.
