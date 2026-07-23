# Fase 10, incremento 10.2 — MFA no web: superfície de status (read-only)

## Resultado

Implementado em 23 de julho de 2026 no branch `claude/continue-previous-w2jz8q`. O web passou a **consumir e exibir** o nível de garantia da sessão (`assuranceLevel`), o campo que o incremento 10.1 acrescentou a `/api/v1/me`. Uma seção "Segurança da sessão" na página de Configurações mostra, em leitura, se a sessão foi verificada apenas com senha (`aal1`) ou com senha + segundo fator (`aal2`).

Este incremento **não** constrói a inscrição TOTP nem o enforcement de rota no web — ambos continuam dependendo de Supabase de staging (itens 1.3–1.8) e da lista de rotas sensíveis (item 3.5). É a contrapartida honesta do 10.1 no cliente: **ler e propagar, sem inventar fluxo que exige ambiente real**.

## Escopo entregue

### Tradução do nível de garantia

`describeSessionAssurance` (`apps/web/src/lib/session-assurance.ts`) é uma função pura que mapeia `AssuranceLevel` para uma view de exibição (`label`, `badge`, `summary`, `hasSecondFactor`). Ficou separada da página justamente para ser testável sem renderização nem sessão real, seguindo o mesmo padrão de `parseAccessTokenClaims` no backend.

- `aal2` → "Segundo fator ativo", badge `success`, `hasSecondFactor: true`.
- `aal1` (e qualquer valor que o schema já normalize para `aal1`) → "Apenas senha", badge `muted`, `hasSecondFactor: false`, com a ressalva explícita de que a inscrição no segundo fator ainda não está disponível nesta fase.

### Superfície na página de Configurações

`apps/web/src/app/app/configuracoes/page.tsx` renderiza a seção "Segurança da sessão" sempre que o principal está disponível — independente do painel da clínica, porque o nível de garantia é da sessão, não do tenant. Nenhuma decisão de acesso depende do valor; a superfície é puramente informativa.

## Evidências

- Gates locais verdes: `format:check`, `lint`, `typecheck`, `test` (124 testes, 32 arquivos), `build`.
- Teste novo: `session-assurance.test.ts` (2 casos, cobrindo `aal2` e `aal1`). O contrato garante que valores ausentes/desconhecidos já chegam como `aal1` (`.default('aal1')`), então a função só precisa distinguir os dois níveis válidos.

## Limitações

- Não há inscrição TOTP (`enroll`/`challenge`/`verify`) nem códigos de recuperação — exigem Supabase real (itens 1.3–1.8).
- Não há guard/middleware no web que redirecione uma sessão `aal1` para a inscrição quando a rota exige `aal2` — depende da lista de rotas do item 3.5 e da tela de inscrição existir.
- O caminho `aal2` foi exercitado com o valor sintético do contrato, não contra um JWT emitido pelo Supabase com MFA verificado.

## Próximos passos

1. Supabase de staging no ar (itens 1.3–1.8 do checklist).
2. Definir com Produto quais papéis/rotas exigem AAL2 (item 3.5) e aplicar `@RequireMfa()` no backend.
3. Construir a inscrição TOTP no web (a partir desta seção de status) e o guard de rota correspondente.
4. Ligar `MFA_ENFORCEMENT=enforced` em staging, começando por `platform_admin`.
