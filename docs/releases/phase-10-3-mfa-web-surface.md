# Fase 10, incremento 10.3 — nível de garantia da sessão no web (leitura)

## Resultado

Implementado em 30 de julho de 2026 no branch `security/mfa-web-surface`. O web passou a **consumir e exibir** o `assuranceLevel` que o incremento 10.1 acrescentou a `/api/v1/me`. Uma seção "Segurança da sessão" na página de Configurações mostra, em leitura, se a sessão foi verificada apenas com senha (`aal1`) ou com senha + segundo fator (`aal2`).

Este incremento **não** constrói a inscrição TOTP nem o enforcement de rota no web — ambos continuam dependendo de Supabase de staging (itens 1.3–1.8 do go-live checklist) e da lista de rotas sensíveis (item 3.5). É a contrapartida honesta do 10.1 no cliente: **ler e propagar, sem inventar fluxo que exige ambiente real**.

## Escopo entregue

### Tradução do nível de garantia

`describeSessionAssurance` (`apps/web/src/lib/session-assurance.ts`) é uma função pura que mapeia `AssuranceLevel` para uma view de exibição (`label`, `badge`, `summary`, `hasSecondFactor`). Ficou separada da página para ser testável sem renderização nem sessão real, seguindo o mesmo padrão de `parseAccessTokenClaims` no backend.

- `aal2` → "Segundo fator ativo", badge `success`, `hasSecondFactor: true`.
- `aal1` → "Apenas senha", badge `muted`, `hasSecondFactor: false`, declarando que a inscrição no segundo fator ainda não existe nesta fase — em vez de oferecer uma ação inexistente.

### Superfície na página de Configurações

`apps/web/src/app/app/configuracoes/page.tsx` renderiza a seção sempre que o principal está disponível, fora do painel da clínica: o nível de garantia é atributo da sessão, não do tenant. Nenhuma decisão de acesso depende do valor; a superfície é puramente informativa, e a barreira real continua sendo o `MfaGuard` no backend.

## Evidências

- Gates locais verdes: `format:check`, `lint`, `typecheck`, `test` (128 testes em 33 arquivos) e `build` (15 páginas, prerender estático preservado).
- Teste novo: `session-assurance.test.ts` (3 casos). O contrato normaliza valores ausentes/desconhecidos para `aal1` (`.default('aal1')`), então a função só precisa distinguir os dois níveis válidos.

## Limitações

- Não há inscrição TOTP (`enroll`/`challenge`/`verify`) nem códigos de recuperação — exigem Supabase real (itens 1.3–1.8).
- Não há guard/middleware no web que redirecione uma sessão `aal1` para a inscrição quando a rota exige `aal2` — depende da lista de rotas do item 3.5 e da tela de inscrição existir.
- O caminho `aal2` foi exercitado com o valor sintético do contrato, não contra um JWT emitido pelo Supabase com MFA verificado.

## Próximos passos

1. Supabase de staging no ar (itens 1.3–1.8 do checklist).
2. Definir com Produto quais papéis/rotas exigem AAL2 (item 3.5) e aplicar `@RequireMfa()` no backend.
3. Construir a inscrição TOTP no web a partir desta seção de status, e o guard de rota correspondente.
4. Ligar `MFA_ENFORCEMENT=enforced` em staging, começando por `platform_admin`.
