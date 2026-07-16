# Evidências de isolamento — Fase 1

## Suíte criada

`supabase/tests/tenancy_rls.test.sql` contém testes negativos e positivos para:

- owner limitado ao próprio tenant;
- manager limitado à clínica atribuída;
- viewer sem mutation;
- Especialista limitado a assignments;
- integração invisível para outro tenant;
- command de membership restrito a owner/platform;
- command idempotente com um único audit log;
- foreign key composta bloqueando relação cross-tenant;
- revogação removendo acesso no request seguinte.

## Execução local

Pendente no ambiente atual. `pnpm db:start` foi executado e falhou porque o pipe `//./pipe/docker_engine` não existe, confirmando que o daemon Docker não está disponível. A Supabase CLI 2.109.1 está fixada no projeto, mas `supabase test db` exige a stack local em runtime Docker compatível.

## Execução CI

O job `database` em `.github/workflows/ci.yml` sobe Supabase local, recria o banco pelas migrations, executa lint e pgTAP. O job deverá estar verde antes de merge/deploy.

Esta pendência não deve ser confundida com teste aprovado. A evidência será atualizada com data, commit e saída quando Docker local ou CI remoto estiver disponível.
