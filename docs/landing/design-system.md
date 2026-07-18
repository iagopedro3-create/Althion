# Design System — Landing Page Althion

> Referência para o redesign. Consolida o que já existe no código e define os tokens-alvo.
> Objetivo de percepção: healthtech premium, sofisticada, confiável — não CRM genérico, não painel técnico.

## 1. Princípios

1. **Um só sistema de estilo:** classes CSS com tokens. Zero `style` inline estrutural nas seções.
2. **Tokens antes de hex:** nenhuma cor hex crua no JSX. Tudo via variável.
3. **Dois temas coexistindo:** faixas `dark` (âncora premium) e `light` (clareza explicativa),
   alternadas com ritmo — não em blocos repetitivos.
4. **Semântica de cor estável:** verde = confirmado/positivo; âmbar = atenção; coral = perda/risco;
   azul = ação/informação. Não usar verde como "destaque genérico".
5. **Sobriedade > efeito.** Motion serve à compreensão, nunca à decoração.

## 2. Cores (extraídas do código atual)

### Tema light (`.site-shell`)
| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#FAF9F6` / `#F5F7F3` | fundo base |
| `--surface` | `#FFFFFF` | cards |
| `--surface-soft` | `#F8FAF7` | faixas alternadas |
| `--text` | `#10201B` | títulos/corpo |
| `--muted` | `#52635D` | texto secundário |
| `--accent` | `#18A987` | marca/ação positiva |
| `--line` | `rgba(16,32,27,0.08)` | bordas |

### Tema dark (`.dark-section`)
| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#061713` | fundo |
| `--surface` | `#0A211B` | cards |
| `--text` | `#F3FAF7` | títulos |
| `--muted` | `#A9BBB4` | secundário |
| `--accent` | `#29C7A1` | marca (mais claro p/ contraste) |
| `--line` | `rgba(243,250,247,0.1)` | bordas |

### Semânticas (status)
| Papel | Cor | Onde |
| --- | --- | --- |
| Positivo / confirmado | `#18A987` (light) / `#29C7A1` (dark) | badges success, saudável |
| Atenção | `#F5A26F` / `#EBB94A` | warning |
| Perda / crítico | `#F47E6B` | danger, gargalos |
| Ação / informação | `#377CF6` | impacto, "em desenvolvimento" |

> Recomendação: validar todos os pares texto/fundo em AA (4.5:1). Notas em opacidade < 0.65 tendem a reprovar.

## 3. Tipografia

- **Display/headings:** Manrope (600–800).
- **Corpo/UI:** Inter (400–700).
- Migrar de `@import` Google Fonts → `next/font/google` (self-host, sem render-block).

Escala atual (manter e tokenizar):
| Papel | Tamanho |
| --- | --- |
| Hero H1 | `clamp(2.4rem, 4.5vw, 3.8rem)` |
| Section H2 | `clamp(1.9rem, 3.2vw, 2.8rem)` |
| Card title | `1.1–1.4rem` |
| Lead | `clamp(0.95rem, 1.4vw, 1.08rem)` |
| Corpo | `0.9–1.15rem` |
| Eyebrow | `0.72rem`, `letter-spacing 0.1em`, uppercase |
| Nota/legenda | `0.68–0.82rem` |

Tracking de títulos: `-0.03em`. Line-height títulos: `1.1`; corpo: `1.6–1.65`.

## 4. Espaçamento

- Container: `min(1120px, calc(100% - 40px))`.
- Padding de seção: `100px 0` desktop → `72px 0` ≤900px. Tokenizar como `--section-y`.
- Gaps de grid: 8 / 12 / 16 / 24 / 32 / 48 / 64px.
- Raios: cards `16–24px`; pills `999px`; botões `10–12px`.

## 5. Componentes-alvo (a extrair)

| Componente | Substitui | Notas |
| --- | --- | --- |
| `SectionHeader` (eyebrow + h2 + lead) | ~8 repetições inline | props: eyebrow, título, lead, alinhamento |
| `SectionShell` (faixa light/dark + padding) | wrappers inline | tema por prop |
| `StatCard` / `ValueCard` | cards inline de Segurança/IA/Implantação | tokens de cor |
| `Badge` | já existe (`.badge` + variantes) | manter, reusar |
| `IllustrativeNote` | notas soltas | rótulo padronizado de dado ilustrativo |

## 6. Botões (já em CSS — manter)

- Primário claro: `.site-cta-primary` (fundo `--accent`, texto escuro, min-height 52px).
- Header CTA: `.site-header-cta` (40px).
- Secundário/quiet: `.quiet-button`.
- Todos com min-height ≥ 44px (alvo de toque). Manter.

## 7. Elevação

- Cards light: `0 8px 32px rgba(0,0,0,0.04)` (sutil).
- Hero flow dark: `0 20px 60px rgba(0,0,0,0.35)`.
- Evitar sombras pesadas em light theme (mantém ar premium/clean).

## 8. Regras invioláveis (do briefing)

Sem emojis. Sem markdown renderizado. Sem dados reais/clínicos. Sem depoimentos/clientes/certificações
inventados. Sem menção à Helena. Sem promessa garantida. Sem afirmação de conformidade jurídica definitiva.
Todo número fictício rotulado como ilustrativo. Módulo não pronto rotulado (Em desenvolvimento / Roadmap /
Acesso antecipado). Respeitar `prefers-reduced-motion`. Preservar acessibilidade e performance.
