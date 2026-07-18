# Plano de Redesign — Landing Page Althion

> Trabalho dividido em etapas independentes. **Parar ao fim de cada uma para aprovação.**
> Um commit por etapa. Não avançar automaticamente.

## Sequência de etapas e commits

| #   | Etapa                   | Commit                                               | Escopo                                                                                            |
| --- | ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | Auditoria               | `landing: audit current experience`                  | **Este documento + docs/landing/**. Sem alterar produção.                                         |
| 2   | Header + Hero           | `landing: redesign header and hero`                  | Refino do hero/nav (já em bom estado); padronizar CTA; migrar fontes p/ `next/font`.              |
| 3   | Narrativa do problema   | `landing: improve problem narrative`                 | Faixa de posicionamento + leak strip + ProblemSection: copy, acentuação, contraste.               |
| 4   | Althion Radar           | `landing: redesign althion radar`                    | Polir Radar/Score; corrigir acentos do heading; tokenizar cores.                                  |
| 5   | Storytelling de produto | `landing: add product storytelling`                  | **Criar o CSS ausente de `HowItWorksSection`** (crítico) + acentuação do dataset.                 |
| 6   | Recovery/Capacity       | `landing: redesign recovery engines`                 | Extrair Acts 6–7 de inline p/ classes; responsivo; reduced-motion na Fila.                        |
| 7   | Confiança               | `landing: improve trust sections`                    | Acts 8–10 (IA, Especialista, Segurança): remover emojis, corrigir dado fabricado e copy jurídica. |
| 8   | Conversão               | `landing: optimize conversion flow`                  | Acts 11–13 (Implantação, FAQ, CTA) + formulário `/diagnostico`: a11y do FAQ, decisão sobre mock.  |
| 9   | Motion                  | `landing: implement motion system`                   | Consolidar reduced-motion, "um movimento por viewport", tokens de easing.                         |
| 10  | A11y + performance      | `landing: final accessibility and performance audit` | Auditoria final, contraste, SEO/OG, Lighthouse, testes em todos os tamanhos.                      |

## Fluxo obrigatório por etapa

Antes: analisar componentes → listar problemas → plano curto → arquivos a alterar → dependências →
critérios de aceite. Depois: implementar só a etapa. Ao concluir: listar arquivos, explicar mudanças,
`lint` → `typecheck` → testes relacionados → `build` de produção → subir app → verificar visual →
testar desktop e mobile → registrar limitações → **commit** → **parar**.

## Tamanhos de teste (todas as etapas com UI)

1440×900 · 1280×800 · 1024×768 · 768×1024 · 430×932 · 390×844 · 360×800.

## Decisões transversais (aplicar ao longo das etapas, não numa só)

1. **Arquitetura de CSS:** extrair estilos da landing de `globals.css` para um arquivo/estratégia
   dedicada (ex.: `site.css` importado no `(site)/layout`), sem quebrar o portal. Introduzir tokens.
2. **Zero `style` inline estrutural:** migrar Acts 5–13 para classes.
3. **Zero novas dependências.** Reusar `next/font`, `react-hook-form`/`zod` (se formos ativar o form).
4. **Semântica de cor** conforme design-system.md.

## Riscos

- **`globals.css` compartilhado com o portal:** refatorar estilos do site pode afetar telas autenticadas.
  Mitigar: mover só o que está sob `.site-shell`/`(site)`; validar portal após cada mudança de CSS.
- **Gate de Docker:** pgTAP e `pnpm db:*` seguem pendentes de CI — não bloqueia a landing (front puro),
  mas `build` deve ser rodado por etapa.
- **Branch atual é `codex/phase-9-google-ads`** com muitas mudanças não commitadas (Google Ads/Quality +
  o site). Definir se o redesign vai numa branch própria (`codex/landing-redesign`) para não misturar
  com a Fase 9. **Recomendação: branch dedicada.**
- **Formulário `/diagnostico` é mock:** decidir na Etapa 8 entre (a) integração real via server action
  como em `/contato`, ou (b) manter mock com rótulo honesto e sem gravar PII em localStorage.
- **Regressão de acessibilidade** ao trocar layout — reexecutar checagens por etapa.

## Critérios para iniciar o redesign (gate da Etapa 2)

1. Auditoria aprovada por Iago.
2. Decisão sobre a branch (dedicada vs. atual).
3. Decisão sobre a arquitetura de CSS (extrair p/ `site.css` com tokens) confirmada.
4. Confirmação de que **não** haverá novas dependências sem justificativa.
5. Confirmação do rótulo de CTA único e da estratégia do formulário de diagnóstico.
