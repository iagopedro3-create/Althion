# Diretrizes de Copy — Landing Page Althion

## 1. Voz

- **Consultiva e precisa**, não publicitária. A Althion diagnostica e organiza; não promete milagres.
- Foco no problema do gestor: oportunidades que se perdem entre o primeiro contato e o comparecimento.
- Português do Brasil, formal-acessível. **Sempre com acentuação correta.**

## 2. Posicionamento (fixo)

> Identificar onde a clínica perde oportunidades, organizar ações para recuperá-las e demonstrar o
> impacto na jornada do paciente.

A Althion **é**: healthtech premium, plataforma de recuperação e performance da agenda, nova categoria.
A Althion **não é**: CRM genérico, chatbot, secretária virtual, call center, agência, painel técnico,
sistema hospitalar, protótipo.

## 3. Proibições (do briefing) — checklist de copy

- [ ] Sem emojis no texto visível.
- [ ] Sem sintaxe Markdown exibida.
- [ ] Sem dados reais, clínicos ou de pacientes.
- [ ] Sem depoimentos, clientes, resultados ou certificações inventados.
- [ ] Sem apresentar módulo futuro como disponível.
- [ ] Sem menção à Helena (CRM) na página pública.
- [ ] Sem promessa garantida ("garantimos X% de aumento").
- [ ] Sem conformidade jurídica definitiva ("estamos em conformidade com a LGPD").

## 4. Correções pendentes identificadas na auditoria

| Local                               | Problema                                            | Ação                                       |
| ----------------------------------- | --------------------------------------------------- | ------------------------------------------ |
| Heading do Radar (`page.tsx`)       | acentos ausentes ("operacao", "esta", "dimensoes"…) | reescrever com acento                      |
| `HowItWorksSection` (dataset STEPS) | todo o texto sem acento                             | reescrever                                 |
| `HeroInteractiveFlow` (labels)      | "Acao", "Responsavel", "Proxima"                    | acentuar                                   |
| `AlthionScoreDial` (status)         | "Atenção critica", "Requer atencao", "Saudavel"     | acentuar                                   |
| `CapacityCalor`                     | typo "Saúdável"                                     | → "Saudável"                               |
| `diagnostico/page.tsx`              | "Em conformidade com a LGPD e o sigilo médico"      | trocar por linguagem de intenção           |
| Painel do Especialista              | nome inventado "Juliana S." + "94%" + data          | anonimizar ou rotular claramente como demo |
| Mockups (HowItWorks)                | nomes de pacientes sem disclaimer uniforme          | adicionar nota de dado fictício            |

## 5. Fórmulas de rótulo aprovadas

**Dado ilustrativo:**

- "Dado ilustrativo."
- "Percentuais são dados ilustrativos baseados em padrões operacionais observados no setor."
- "Exemplo de diagnóstico — não representa métricas reais."
- "Estimativa baseada em premissas."

**Módulo futuro:**

- "Em desenvolvimento." / "Em implantação." / "Acesso antecipado." / "Roadmap."
- Nunca: "disponível agora", "já faz", quando não estiver pronto.

**Conformidade (linguagem de intenção, não de fato):**

- "Construída com princípios de segurança, minimização de dados e controle de acesso."
- "A documentação definitiva será revisada juridicamente antes da operação comercial."

## 6. CTAs — padronizar

Usar **um** rótulo primário consistente: **"Receber diagnóstico da operação"** (ou "Solicitar
diagnóstico"). Hoje há três variações. Secundário: "Ver como a Althion funciona".
Microcopy de confiança: "Diagnóstico inicial. Sem compromisso."

## 7. Termos preferidos

- "Recuperação de oportunidades", "jornada do paciente", "aproveitamento da agenda",
  "Especialista de Relacionamento", "jornada administrativa".
- Evitar jargão técnico de produto (Recovery Engine, Capacity Engine, Cockpit) na copy pública —
  ou traduzir para linguagem de benefício.
