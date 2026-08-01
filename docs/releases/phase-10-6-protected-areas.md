# Fase 10, incremento 10.6 — áreas autenticadas declaradas em lista única

## Resultado

Implementado em 1º de agosto de 2026. A barreira de sessão do proxy passa a cobrir as **duas** áreas autenticadas do web — Portal do Cliente (`/app`) e Cockpit do Especialista (`/cockpit`) —, a partir de uma lista declarada em vez de uma comparação literal.

## O defeito corrigido

`updateSession` decidia se uma rota exigia sessão com `pathname.startsWith('/app')`. O Cockpit, criado na Fase 4, nunca entrou nessa condição: não havia lista a atualizar, havia um literal no meio da lógica de sessão.

**Não houve exposição de dados.** `cockpit/layout.tsx` valida a sessão com `getUser()` e redireciona, a API revalida o JWT por JWKS a cada chamada e o RLS isola por organização. O que faltava era a camada externa — e a assimetria tinha efeitos concretos:

- **Retorno perdido.** Um Especialista sem sessão em `/cockpit/recovery` caía em `/entrar` sem `retorno`, e depois do login era devolvido ao Portal em vez de voltar para onde tentava ir. Em `/app` o retorno sempre funcionou.
- **500 em vez de página.** Com a configuração do Supabase ausente, o `catch` de `apps/web/src/proxy.ts` só produzia `/entrar?erro=configuracao` para `/app`; em `/cockpit` respondia `next()`, e a página estourava ao criar o mesmo client que acabara de falhar.
- **A próxima área herdaria o defeito.** Esta é a causa raiz: uma área nova nasce fora da barreira e ninguém percebe, porque o `layout.tsx` dela compensa em silêncio.

## Escopo entregue

### Lista de áreas, não de rotas

`apps/web/src/lib/protected-areas.ts` declara `AUTHENTICATED_AREAS` e `AUTH_ENTRY_POINTS` e expõe `requiresSession`/`isAuthEntryPoint` — funções puras, testáveis sem Next, sem Supabase e sem rede, no padrão de `session-assurance.ts`.

Áreas, e não rotas, porque as áreas são duas e estáveis enquanto as rotas são 24 e crescem a cada incremento: uma lista de rotas exigiria manutenção a cada página nova, que é exatamente o esquecimento que produziu o defeito.

### Match por segmento

`/app` protege `/app` e `/app/...`, mas não `/application`. O `startsWith` cru casaria por engano — um redirecionamento inesperado hoje, e uma falsa sensação de cobertura depois. Nenhuma rota ambígua existe no repositório; o teste está lá para que não passe a existir despercebida.

### Nada muda para quem tem sessão

A condição nova só dispara **sem** usuário. As checagens de `getUser()` nos layouts **permanecem**: são a defesa que de fato guarda os dados; o proxy é a camada de cima. Remover uma porque a outra existe trocaria defesa em profundidade por atalho.

O destino de quem já tem sessão continua `/app` nas páginas de entrada. Escolher destino por papel exigiria ler capabilities no middleware — decisão de produto (item 3.5 do go-live), fora deste escopo.

## Evidências

- **Teste que fixa o defeito**: `apps/web/src/lib/supabase/proxy.test.ts` exerce `updateSession` com o client do Supabase mockado. Verificado por reversão — com o `startsWith('/app')` anterior, o caso do Cockpit falha; com a lista, passa. Os demais quatro casos (Portal, rotas públicas, sessão válida no Cockpit, saída da página de login) passam nas duas versões, provando que o comportamento aprovado foi preservado.
- 10 testes unitários de `protected-areas`, incluindo `/application` e `/cockpit-demo` como públicos.
- Gates locais verdes: `format:check`, `lint`, `typecheck`, `test` (**153 testes em 38 arquivos**, contra 138 em 36) e `build`.
- `test:e2e` verde: 23 testes passaram, 1 pulado (o exclusivo de CSP de produção).

## Limitações registradas

- **Sem E2E do redirecionamento sem sessão.** Exercer a barreira de ponta a ponta exige usuários reais no Supabase de staging (item 1.3 do go-live). A decisão está coberta por teste unitário sobre a função real do proxy, não sobre uma reimplementação.
- **A lista é do web, não do sistema.** As rotas da API têm seus próprios guards (`JwtAuthGuard`, `CapabilitiesGuard`, `MfaGuard`); nada aqui as alcança, e não deveria.
- **`AUTH_ENTRY_POINTS` não inclui `/definir-senha`**, que precisa da sessão de recuperação para funcionar e por isso não pode expulsar quem tem sessão.
