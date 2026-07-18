# Auditoria da Landing Page Althion — estado atual

> Etapa 1 do redesign. Documento somente de análise. Nenhum arquivo de produção foi alterado.
> Data: 17/07/2026. Branch: `codex/phase-9-google-ads` (mudanças da landing ainda não commitadas).

## 1. Stack

| Camada      | Tecnologia                                                            | Observação                                                                                         |
| ----------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Framework   | Next.js 16.2 (App Router, RSC)                                        | `apps/web`                                                                                         |
| UI          | React 19.2                                                            | Componentes de site em `use client` quando interativos                                             |
| Estilo      | CSS global único (`globals.css`, 3846 linhas) + Tailwind v4 importado | Tailwind praticamente **não é usado** na landing; predominam classes CSS próprias e `style` inline |
| Fontes      | Google Fonts via `@import url()` no topo do CSS                       | Inter + Manrope. Render-blocking, sem `next/font`                                                  |
| Formulários | `react-hook-form` + `zod` + `@hookform/resolvers` disponíveis         | A landing **não os usa**; o formulário de diagnóstico é `useState` manual                          |
| Gráficos    | `recharts`                                                            | Usado no portal, não na landing                                                                    |
| Backend     | Supabase SSR                                                          | Não é exercido pela home; `/contato` tem server action real, `/diagnostico` não                    |

Veredito: a stack é adequada e **não precisa ser trocada**. O problema não é tecnologia, é organização de estilo e consistência de implementação.

## 2. Estrutura de rotas (grupo `(site)`)

```
apps/web/src/app/(site)/
  layout.tsx          Header + footer compartilhados
  page.tsx            Home — 13 "Acts" (seções)
  diagnostico/page.tsx  Formulário multi-etapa (mock)
  contato/            Formulário com server action real
  produto, radar, sobre, seguranca, privacidade, termos
```

Componentes em `apps/web/src/components/site/`:
`SiteHeader`, `HeroInteractiveFlow`, `JourneyLeakStrip`, `ProblemSection`, `HowItWorksSection`,
`AlthionScoreDial`, `RecoveryOpportunityFila`, `CapacityCalor`, `FAQAccordions`,
`ContactDiagnosisForm`, `contact-form`.

## 3. Anatomia da home (`page.tsx`)

| Act | Seção                                | Tema  | Implementação de estilo               |
| --- | ------------------------------------ | ----- | ------------------------------------- |
| 1   | Hero + fluxo interativo              | dark  | **Classe CSS** (bom)                  |
| 2   | Faixa de posicionamento + leak strip | light | **Classe CSS** (bom)                  |
| 3   | Problema (4 cards)                   | light | **Classe CSS** (bom)                  |
| 4   | Althion Radar + Score                | light | **Classe CSS** (bom)                  |
| 5   | Como funciona (scrollytelling)       | light | **SEM CSS — ver problema crítico #1** |
| 6   | Recovery Engine (tabela)             | light | **`style` inline**                    |
| 7   | Capacity Engine                      | light | **`style` inline**                    |
| 8   | IA vs Humano                         | light | **`style` inline**                    |
| 9   | Especialista de Relacionamento       | light | **`style` inline**                    |
| 10  | Segurança & Privacidade              | dark  | **`style` inline** (+ emojis)         |
| 11  | Implantação (3 passos)               | light | **`style` inline**                    |
| 12  | FAQ                                  | light | **`style` inline**                    |
| 13  | CTA final                            | dark  | **`style` inline**                    |

O corte entre "Acts 1–4 bem feitos por classe" e "Acts 5–13 improvisados" é a fratura central da página.

## 4. Problemas técnicos

1. **CRÍTICO — "Como funciona" sem estilo.** `HowItWorksSection` usa classes `how-*` e `hw-mockup-*`
   que **não existem em nenhum CSS** (verificado por busca). O Act 5 renderiza como blocos empilhados
   sem layout — e é exatamente a seção para onde apontam o link de nav "Como funciona" e o CTA
   secundário do hero (`#como-funciona`). É a maior seção da página e está quebrada.
2. **Dois paradigmas de estilo.** Acts 1–4 em classes; Acts 5–13 em `style` inline dentro do JSX.
   Impede tema consistente, reuso, dark/light coerente e manutenção.
3. **`globals.css` monolítico (3846 linhas).** Mistura estilos do portal autenticado com estilos do
   site público. Estilos da landing foram acrescentados em três blocos ad-hoc ("ETAPA 2/3/4") mais
   um bloco "Custom Althion Site Redesign Themes" que redefine variáveis via `.site-shell`.
4. **Duplicações no CSS:** `.site-main` definido duas vezes (l. 2184 e 2460, com `!important`
   conflitante), `.form-grid` duplicado, **dois** blocos `@media (prefers-reduced-motion: reduce)`.
5. **`var(--primary)` inexistente** em `diagnostico/page.tsx` (o eyebrow perde cor). Só existe `--accent`.
6. **Formulário de diagnóstico é mock:** `submit` simula com `setTimeout`, não envia a lugar nenhum, e
   grava PII (nome, e-mail, WhatsApp) em `localStorage`. `/contato` tem server action real; `/diagnostico` não.
7. **Fontes render-blocking** via `@import` de Google Fonts — deveria usar `next/font`.

## 5. Problemas visuais

- Sem sistema de tokens: cores hex repetidas manualmente (`#18A987`, `#10201B`, `#52635D`, `#F8FAF7`…)
  dezenas de vezes em inline styles. Um ajuste de marca exige caça e substituição.
- Ritmo repetitivo: Acts 6–11 são quase todos "texto à esquerda + card à direita", `padding: 100px 0`,
  eyebrow verde + h2 2.8rem. Cansa e dilui a hierarquia.
- Verde usado como cor genérica de destaque (eyebrows, valores, badges). O design system interno
  (memória do projeto) reserva verde para "confirmado" — há risco de conflito semântico.
- Emojis como ícones (🔒 🛡️) destoam do restante, que usa SVG stroke consistente.

## 6. Problemas de UX

- **Página muito longa** (13 seções) sem âncoras de navegação para metade delas (nav tem 6 links).
- **Dois timers automáticos simultâneos:** hero avança a cada 3,5s; fila de recuperação a cada 5s.
  Competem pela atenção e a fila **ignora `prefers-reduced-motion`**.
- CTA duplicado e disperso: "Solicitar diagnóstico" / "Receber diagnóstico" / "Solicitar Diagnóstico"
  com rótulos e destinos ligeiramente diferentes.
- Formulário de diagnóstico dá falsa sensação de conclusão ("Informações Recebidas") sem enviar nada.

## 7. Problemas de copy

- **Acentuação ausente/quebrada** em várias strings: heading do Radar ("operacao", "esta", "reune",
  "dimensoes", "sao", "diagnostico"); todo o dataset de `HowItWorksSection` ("formularios",
  "ligacoes", "unico", "Qualificacao", "intencao", "proxima acao"); rótulos do hero flow
  ("Acao", "Responsavel", "Proxima"); status do Radar ("Atenção critica", "Requer atencao",
  "Saudavel"); typo "Saúdável" em `CapacityCalor`.
- **Rule 18 (conformidade jurídica definitiva):** `diagnostico/page.tsx` afirma "Em conformidade com
  a LGPD e o sigilo médico". A seção de Segurança já usa hedge correto ("deverá ser revisada
  juridicamente"); o formulário não.
- **Especialista fabricado:** painel "Demonstração" exibe "Juliana S.", "94%" e reunião "27 de Julho,
  às 14:00" — pessoa nomeada inventada. Ainda que rotulado como demo, tangencia rules 8/10.
- Nomes de pacientes fictícios nos mockups (Ana Clara, Roberto S., Patricia R.…). Só um mockup tem
  a nota "não representam pacientes reais".

## 8. Problemas de responsividade

- Seções inline (Acts 6–13) usam `gridTemplateColumns` fixos (`1.2fr 1fr`, `1fr 1fr`) **sem breakpoint**.
  Em 768px e abaixo elas **não colapsam** para uma coluna — texto e cards espremem. Só as seções por
  classe (Acts 1–4) têm media queries.
- A tabela de recuperação usa `minWidth: 600px` + scroll (ok), mas as duas colunas de Segurança/IA/
  Especialista/Implantação não têm fallback mobile.
- Testes nos tamanhos exigidos (1440, 1280, 1024, 768, 430, 390, 360) ainda não executados —
  serão feitos por etapa a partir da Etapa 2.

## 9. Problemas de acessibilidade

- `HowItWorksSection` sem CSS compromete ordem visual/foco além do previsto.
- **FAQ:** botão sem `aria-controls`; painel sem `id`/`role="region"`.
- **Leak strip** inteiro `aria-hidden` — decorativo, aceitável, mas os dados não chegam a leitores de tela.
- Emoji usado como ícone dentro de `<strong>` sem tratamento para AT.
- Contraste: `#52635D` sobre `#F8FAF7` ≈ 5,8:1 (ok); notas em `rgba(82,99,93,0.6)` provavelmente
  reprovam AA — validar por etapa.
- Pontos positivos: `:focus-visible` global, menu mobile com Escape/click-fora, `aria-live` nos
  componentes que atualizam, `prefers-reduced-motion` coberto no CSS e no hero (mas não na fila).

## 10. Problemas de performance

- Google Fonts via `@import` (render-blocking; sem `next/font`/self-host).
- Dois `setInterval` ativos na home simultaneamente.
- Objetos de `style` inline recriados a cada render nas seções grandes.
- CSS de 3846 linhas servido inteiro para a landing (inclui todo o portal).

## 11. Dados ilustrativos e módulos futuros — conformidade

- **Bom:** a maioria dos números tem rótulo ("Dado ilustrativo", "dado ilustrativo baseado em padrões",
  "Mockup ilustrativo — interface em desenvolvimento", "Em Desenvolvimento" no Capacity).
- **A corrigir:** especialista nomeado (Juliana S.) sem rótulo suficiente; afirmação de conformidade LGPD;
  alguns mockups de paciente sem disclaimer.

## 12. Dependências

Nenhuma dependência nova é necessária para o redesign. Já disponíveis e subutilizadas:
`react-hook-form`, `zod`, `@hookform/resolvers` (formulário), `next/font` (nativo do Next, para fontes).
Recomendação: **zero novas dependências**; usar o que já existe.

## 13. Código duplicado / reutilizável

- Padrão "eyebrow + h2 + lead" repetido inline em ~8 seções → deve virar componente/classe única
  (`SectionHeader`).
- Cards de valor/estatística repetidos com hex fixos → tokens + classe.
- `.site-main`, `.form-grid`, blocos de reduced-motion duplicados no CSS → consolidar.

## 14. Componentes por decisão

**Preservar (bem construídos, por classe):** `SiteHeader`, `HeroInteractiveFlow`, `JourneyLeakStrip`,
`ProblemSection`, `AlthionScoreDial`.

**Ajustar:** seções inline de `page.tsx` (extrair para classes + responsivo), acentuação de copy,
remoção de emojis, copy jurídica, `ContactDiagnosisForm`.

**Redesenhar:** `HowItWorksSection` (sem CSS), Acts 6–11 (unificar em sistema de storytelling coeso),
painel do Especialista (dado fabricado), arquitetura de CSS da landing.
