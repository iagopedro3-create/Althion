# Plano — Fase 10, incremento 10.6: áreas autenticadas declaradas em lista única

> Escopo: alinhar a barreira de sessão do proxy entre as duas áreas autenticadas do web. Não muda quem pode ver o quê — autorização por papel, assignment e RLS permanecem exatamente como estão.

## Problema

`apps/web/src/lib/supabase/proxy.ts` decide se uma rota exige sessão com uma comparação literal:

```ts
const isProtected = request.nextUrl.pathname.startsWith('/app');
```

O web tem **duas** áreas autenticadas — `/app/*` (Portal do Cliente) e `/cockpit/*` (Cockpit do Especialista, Fase 4) —, e o proxy só conhece a primeira. O Cockpit entrou na Fase 4 sem que a lista do proxy fosse revisada, porque não havia lista: havia um literal.

**Não há vazamento de dados hoje.** `cockpit/layout.tsx` valida a sessão com `getUser()` e redireciona, a API revalida o JWT por JWKS a cada chamada, e o RLS isola por organização. O que falta é a camada externa, e a assimetria produz três efeitos concretos:

1. **Sem redirecionamento de retorno.** `/app` sem sessão manda para `/entrar?retorno=<rota>`; `/cockpit` sem sessão manda para `/entrar` sem `retorno`. O Especialista é devolvido ao Portal em vez de voltar para onde tentava ir.
2. **Falha de configuração vira 500 em vez de página.** Quando `getSupabasePublicConfig()` lança, o `catch` de `proxy.ts` só produz `/entrar?erro=configuracao` para `/app`; em `/cockpit` responde `NextResponse.next()`, e a página estoura ao criar o mesmo client que acabou de falhar.
3. **A próxima área autenticada repete o defeito.** É a causa raiz: enquanto a condição for um literal dentro do proxy, qualquer área nova nasce fora da barreira e ninguém percebe, porque o layout dela compensa em silêncio.

Há ainda um defeito latente no próprio `startsWith`: um caminho como `/application` casaria com o prefixo `/app` sem ser aquela área. Nenhuma rota assim existe hoje — a correção é para que não passe a existir despercebida.

## Objetivo

Uma lista única e testada das áreas que exigem sessão, consumida pelo proxy, de modo que **acrescentar uma área autenticada seja uma linha nessa lista** e não uma edição no meio da lógica de sessão.

## Decisões

1. **Módulo próprio com funções puras** (`apps/web/src/lib/protected-areas.ts`), no padrão já usado por `session-assurance.ts`: lógica testável sem Next, sem Supabase e sem rede. O proxy roda no middleware; manter a decisão fora dele é o que a torna verificável.
2. **Match por segmento, não por prefixo cru.** `/app` protege `/app` e `/app/...`, nunca `/application`. Um `startsWith` que casa por engano é um redirecionamento inesperado hoje e uma falsa sensação de cobertura amanhã.
3. **Lista de áreas, não lista de rotas.** As áreas são duas e estáveis; as rotas são 24 e crescem por incremento. Enumerar rotas exigiria manutenção a cada página nova — exatamente o que produziu o defeito.
4. **`isAuthEntryPoint` também sai do literal**, pelo mesmo motivo, mas **sem mudança de destino**: quem já tem sessão continua indo para `/app`. Escolher destino por papel exigiria ler capabilities no middleware — decisão de produto (item 3.5) fora deste escopo.
5. **Nada muda para quem tem sessão.** O incremento só acrescenta a barreira externa para sessões ausentes. As checagens de `layout.tsx` **permanecem**: são a defesa que de fato guarda os dados, e o proxy é a camada de cima. Remover uma porque a outra existe seria trocar defesa em profundidade por atalho.
6. **Sem cobertura E2E nova.** Verificar redirecionamento sem sessão de ponta a ponta exige o Supabase de staging (item 1.3 do go-live); os testes unitários das funções puras cobrem a decisão, e a limitação fica registrada.

## Arquivos

- `apps/web/src/lib/protected-areas.ts` (novo) — `AUTHENTICATED_AREAS`, `requiresSession`, `isAuthEntryPoint`.
- `apps/web/src/lib/protected-areas.test.ts` (novo) — segmento vs. prefixo, as duas áreas, rotas públicas, casos de borda.
- `apps/web/src/lib/supabase/proxy.ts` — consome `requiresSession`/`isAuthEntryPoint`.
- `apps/web/src/proxy.ts` — o `catch` de configuração usa `requiresSession`.
- `docs/releases/phase-10-6-protected-areas.md`, `docs/roadmap.md`, `docs/security/security-model.md` — registro.

## Riscos

| Risco                                                         | Mitigação                                                                                                                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Proteger `/cockpit` no proxy quebra o acesso do Especialista  | A condição só dispara **sem** usuário; com sessão o fluxo é idêntico ao de hoje. O `layout.tsx` já redirecionava no mesmo caso                  |
| Match por segmento passa a recusar uma rota que hoje funciona | Nenhuma rota do repositório tem prefixo ambíguo; os testes fixam `/app`, `/app/...` e a recusa de `/application`                                |
| Middleware mais pesado                                        | Duas comparações de string sobre um array de dois elementos; nenhuma I/O acrescentada                                                           |
| Divergência entre a lista nova e a de rotas públicas do E2E   | São conjuntos com propósitos distintos (áreas privadas × páginas públicas varridas); acoplá-los criaria dependência de `e2e/` no runtime do app |

## Critérios de aceite

- `/cockpit` e `/cockpit/...` sem sessão redirecionam para `/entrar?retorno=<rota>`, como `/app` já faz.
- Falha de configuração do Supabase leva `/cockpit` a `/entrar?erro=configuracao`, e não a um erro de servidor.
- Rotas públicas e `/application` seguem livres.
- Sessão válida: comportamento inalterado nas duas áreas.
- Gates locais verdes: `format:check`, `lint`, `typecheck`, `test`, `build`, `test:e2e`.
