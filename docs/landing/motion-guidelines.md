# Diretrizes de Motion — Landing Page Althion

## 1. Princípio

Motion serve à compreensão (mostrar fluxo, revelar hierarquia, dar feedback), nunca à decoração.
Premium = contido. Preferir poucas animações bem executadas a muitas competindo.

## 2. `prefers-reduced-motion` (obrigatório — rule 19)

Estado atual:
- CSS: coberto por dois blocos `@media (prefers-reduced-motion: reduce)` (consolidar em um).
- `HeroInteractiveFlow`: respeita — desliga autoplay. ✔
- `ProblemSection` / `HowItWorksSection`: respeitam via checagem de `matchMedia`. ✔
- **`RecoveryOpportunityFila`: NÃO respeita** — cicla estado a cada 5s independente da preferência. ✗ corrigir.

Regra: todo autoplay/loop/transição não essencial deve parar (ou virar estático) sob reduced-motion,
tanto no CSS quanto nos timers JS.

## 3. Curvas e durações

- Easing padrão: `cubic-bezier(0.16, 1, 0.3, 1)` (já em uso — manter).
- Micro-interações (hover, foco): 120–200ms.
- Transições de estado/entrada: 350–550ms.
- Evitar > 600ms em qualquer transição de UI.

## 4. Padrões aprovados (já existentes)

| Padrão | Onde | Manter? |
| --- | --- | --- |
| Fade-in on scroll (IntersectionObserver) | ProblemSection | sim |
| Sticky + troca de mockup por scroll | HowItWorksSection | sim (após ganhar CSS) |
| Header shrink/blur ao rolar | SiteHeader | sim |
| Anel de score animado (stroke-dasharray) | AlthionScoreDial | sim |
| Barra de progresso do formulário | ContactDiagnosisForm | sim |

## 5. Padrões a revisar

| Padrão | Problema | Ação |
| --- | --- | --- |
| Leak strip scroll infinito (38s) | ok, mas competindo com o hero acima | manter, garantir pausa em reduced-motion (já via CSS) |
| Hero autoplay 3,5s + Fila 5s | **dois loops simultâneos** na mesma página | escalonar: só um elemento em auto-movimento por viewport; Fila só anima quando visível e sem reduced-motion |

## 6. Regra de "um movimento por viewport"

Em qualquer dobra visível, no máximo **um** elemento com movimento contínuo/autoplay. Isso evita a
sensação de protótipo agitado e preserva foco. Interações disparadas pelo usuário (hover, clique,
abrir FAQ) não contam nesse limite.

## 7. Foco e feedback

- `:focus-visible` global já existe (outline 3px `--accent`). Manter e garantir contraste do outline
  em ambos os temas.
- Estados hover/active dos CTAs (translateY -1/-2px) — manter, sutis.
