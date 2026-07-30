# Fase 10, incremento 10.4 — acessibilidade em todas as rotas públicas

## Resultado

Implementado em 30 de julho de 2026 no branch `security/a11y-public-routes`. Todas as **12 rotas públicas** passam por verificação automatizada de acessibilidade (`axe-core`, tags `wcag2a`/`wcag2aa`), a partir de uma **lista canônica única** que também alimenta a varredura de CSP.

Antes deste incremento, cinco rotas não tinham verificação alguma: `/definir-senha`, `/privacidade`, `/radar`, `/recuperar-acesso` e `/termos`. Três delas são caminhos de autenticação — onde uma barreira de acessibilidade custa mais caro, porque não existe alternativa para quem precisa entrar.

## Escopo entregue

### A lista duplicada era o defeito de origem

`e2e/site.spec.ts` mantinha 6 rotas para o axe; `e2e/foundation.spec.ts` mantinha 12 para a CSP e verificava `/entrar` isoladamente. Nada ligava uma lista à outra, então qualquer rota nova nascia fora da cobertura. `e2e/public-routes.ts` passa a ser a única fonte: acrescentar uma rota ali a coloca sob CSP **e** sob axe, sem editar dois arquivos.

### Um teste por rota

`e2e/accessibility.spec.ts` gera um `test()` por rota em vez de um laço dentro de um teste único. O relatório passa a nomear a página que falhou; num laço, a primeira falha esconderia as demais.

### O teste de login afirma uma coisa só

A asserção de axe saiu do teste de `/entrar`, que voltou a tratar apenas do formulário (rótulos, ausência de cadastro público). A rota continua verificada — no conjunto compartilhado.

## Evidências

- `test:e2e` verde: **23 testes passaram, 1 pulado** (o exclusivo de CSP de produção), contra 17+1 antes.
- As 12 rotas públicas foram verificadas e **nenhuma apresentou violação `critical` ou `serious`** — a ampliação não exigiu correção de marcação.
- `format:check`, `lint` e `typecheck` verdes.

## Limitações

- O filtro segue em `critical`/`serious`, o critério já em uso no repositório. Violações `minor`/`moderate` aparecem no relatório do axe mas não reprovam o conjunto.
- A verificação é automatizada: cobre o que o axe detecta estaticamente, não substitui teste com leitor de tela nem navegação real por teclado ponta a ponta.
- Rotas autenticadas do portal continuam fora — dependem de sessão real (item 2.5 do go-live checklist, bloqueado por Supabase de staging).
