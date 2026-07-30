# Plano — Fase 10, incremento 10.4: cobertura de acessibilidade em todas as rotas públicas

> Escopo: fechar a lacuna entre as rotas públicas que existem e as que passam por verificação automatizada de acessibilidade. Não redesenha componentes; corrige o que a verificação apontar.

## Problema

O repositório já roda `axe-core` no E2E, mas em duas listas diferentes e incompletas:

- `e2e/site.spec.ts` verifica 6 rotas (`/`, `/produto`, `/seguranca`, `/sobre`, `/contato`, `/diagnostico`);
- `e2e/foundation.spec.ts` verifica `/entrar` dentro de um teste sobre o formulário de login, e mantém a lista canônica de **12** rotas públicas para o teste de CSP.

Ficam **cinco rotas públicas sem nenhuma verificação**: `/definir-senha`, `/privacidade`, `/radar`, `/recuperar-acesso` e `/termos`. Três delas são caminhos de autenticação — exatamente onde uma barreira de acessibilidade custa mais caro, porque não há alternativa para quem precisa entrar. Pior: a lista duplicada garante que qualquer rota nova nasça fora da cobertura, já que nada liga uma lista à outra.

## Objetivo

Uma única lista de rotas públicas, compartilhada, com verificação de acessibilidade em **todas** elas — de modo que acrescentar uma rota ao site a coloque automaticamente sob CSP **e** sob axe.

## Decisões

1. **Lista única em módulo próprio** (`e2e/public-routes.ts`), importada pelos dois specs. Duplicar a lista é o defeito de origem; corrigi-lo é o que dá durabilidade ao incremento.
2. **Um teste por rota, não um laço dentro de um teste.** Com `test()` por rota, o relatório aponta a página que falhou; num laço único, a primeira falha esconde as demais.
3. **Manter o filtro em `critical`/`serious`.** É o critério já em uso no repositório; mudá-lo no mesmo incremento que amplia a cobertura misturaria duas variáveis e tornaria impossível saber o que quebrou.
4. **Verificação de acessibilidade sai do teste de login.** O teste de `/entrar` volta a afirmar só o comportamento do formulário; a acessibilidade passa a vir do conjunto compartilhado. Um teste que afirma duas coisas falha sem dizer qual.
5. **Correções de marcação, não de design.** Se o axe apontar violação, a correção é semântica (rótulo, contraste, hierarquia de cabeçalho, landmark). Redesenho fica fora do incremento.

## Arquivos

- `e2e/public-routes.ts` (novo) — lista canônica.
- `e2e/accessibility.spec.ts` (novo) — um teste axe por rota pública.
- `e2e/foundation.spec.ts` — consome a lista; teste de login perde a asserção de axe.
- `e2e/site.spec.ts` — perde o laço de axe (agora coberto pelo spec dedicado).
- Correções pontuais de marcação nas páginas que falharem.
- `docs/releases/phase-10-4-accessibility.md`, `docs/roadmap.md` — registro.

## Riscos

| Risco                                                       | Mitigação                                                                                                            |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Rotas novas sob axe revelam violações e travam o incremento | São correções de marcação; se alguma exigir redesenho, fica registrada como limitação explícita em vez de silenciada |
| Mais testes E2E aumentam o tempo do CI                      | Cada teste axe é uma navegação curta; o conjunto roda com os dois workers já configurados                            |
| Perder a asserção de axe no teste de login                  | A rota `/entrar` continua na lista canônica, então segue verificada — só que num teste próprio                       |

## Critérios de aceite

- As 12 rotas públicas têm verificação de acessibilidade; nenhuma violação `critical`/`serious`.
- Acrescentar uma rota à lista canônica passa a cobri-la em CSP e em axe, sem editar dois arquivos.
- Gates locais verdes: `format:check`, `lint`, `typecheck`, `test`, `build`, `test:e2e`.
