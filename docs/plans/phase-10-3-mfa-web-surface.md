# Plano — Fase 10, incremento 10.3: superfície do nível de garantia no web

> Contrapartida no cliente do incremento 10.1 (`docs/releases/phase-10-1-mfa-backend.md`). Escopo: **ler e exibir** o `assuranceLevel` que a API já devolve. Não constrói inscrição TOTP nem enforcement de rota no web.

## Problema

O incremento 10.1 acrescentou `assuranceLevel` (`aal1` | `aal2`) a `/api/v1/me`, mas nenhum consumidor usa o campo. Na prática, hoje é impossível saber — pela interface — se a sessão em uso passou por segundo fator. Isso deixa dois buracos:

1. quem opera o portal não tem como verificar o próprio estado de verificação antes de uma ação sensível;
2. quando o enforcement for ligado (`MFA_ENFORCEMENT=enforced`), o `403 MFA_REQUIRED` apareceria sem que nada na interface tivesse jamais mencionado a existência do segundo fator.

## Objetivo

Fechar o laço de 10.1 no cliente com a menor superfície possível: um bloco **em leitura** na página de Configurações informando o nível de garantia da sessão, sem inventar fluxo que dependa de ambiente real.

## Decisões

1. **Tradução separada da página.** `describeSessionAssurance` é uma função pura em `apps/web/src/lib/session-assurance.ts`, testável sem render nem sessão — mesmo padrão de `parseAccessTokenClaims` no backend. A página só consome a view.
2. **Nenhuma decisão de acesso depende do valor.** A seção é informativa. Autorização continua sendo capability + RLS; o enforcement de MFA é do `MfaGuard` no backend. Uma checagem de `aal` no cliente seria uma falsa barreira.
3. **A seção pertence à sessão, não ao tenant.** Renderiza sempre que o principal está disponível, mesmo quando o painel da clínica falha — o nível de garantia não é um atributo da clínica.
4. **Só dois níveis.** O contrato normaliza ausente/desconhecido para `aal1` (`.default('aal1')`), então a função só distingue `aal1` de `aal2`; não há terceiro estado a representar.
5. **`aal1` diz por que não há mais o que fazer.** O texto declara que a inscrição no segundo fator ainda não está disponível nesta fase, em vez de sugerir uma ação que não existe.

## Arquivos

- `apps/web/src/lib/session-assurance.ts` (novo) — `describeSessionAssurance` e `SessionAssuranceView`.
- `apps/web/src/lib/session-assurance.test.ts` (novo) — casos `aal1` e `aal2`.
- `apps/web/src/app/app/configuracoes/page.tsx` — seção "Segurança da sessão".
- `docs/operations/go-live-checklist.md` — anexo de MFA, passo 1 parcialmente coberto.
- `docs/roadmap.md`, `docs/releases/phase-10-3-mfa-web-surface.md` — registro.

## Riscos

| Risco                                                  | Mitigação                                                                     |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Exibir "Apenas senha" como se fosse defeito do usuário | O texto atribui a ausência à fase do produto, não a uma omissão de quem opera |
| Sugerir que a interface protege a rota                 | Nenhum branch de acesso lê o valor; o guard é do backend                      |
| Caminho `aal2` só exercitado com valor sintético       | Registrado como limitação; validação real depende de Supabase de staging      |

## Critérios de aceite

- Sessão `aal2` mostra "Segundo fator ativo"; `aal1` mostra "Apenas senha" com a ressalva da fase.
- Nenhuma rota muda de comportamento; nenhuma chamada nova à API.
- A seção aparece mesmo quando o painel da clínica não carrega.
- Gates locais verdes: `format:check`, `lint`, `typecheck`, `test`, `build`.
