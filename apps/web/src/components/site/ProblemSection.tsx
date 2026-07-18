'use client';

import { useEffect, useRef, useState } from 'react';

// ─── Dados dos problemas ──────────────────────────────────────────────────────

const PROBLEMS = [
  {
    id: 'resposta',
    title: 'Resposta demorada',
    description:
      'Quando a recepção está sobrecarregada, mensagens no WhatsApp aguardam horas por retorno. O interessado agenda na concorrência antes de receber um atendimento.',
    lossLabel: 'Queda estimada de conversão',
    lossValue: '28%',
    lossColor: '#F47E6B',
    icon: (
      <svg
        aria-hidden="true"
        fill="none"
        height="20"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="20"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    iconBg: 'rgba(244, 126, 107, 0.1)',
    iconColor: '#F47E6B',
  },
  {
    id: 'followup',
    title: 'Lead sem acompanhamento',
    description:
      'Pacientes que demonstram interesse sem confirmar imediatamente são esquecidos nas conversas antigas. Sem seguimento ativo, o contato esfria e a oportunidade se perde.',
    lossLabel: 'Contatos que não retornam',
    lossValue: '19%',
    lossColor: '#F5A26F',
    icon: (
      <svg
        aria-hidden="true"
        fill="none"
        height="20"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="20"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    iconBg: 'rgba(245, 162, 111, 0.1)',
    iconColor: '#F5A26F',
  },
  {
    id: 'vagas',
    title: 'Vagas sem preenchimento',
    description:
      'Cancelamentos de última hora geram lacunas na agenda sem resposta ágil. A fila de espera existe, mas raramente é acionada em tempo hábil para reposição.',
    lossLabel: 'Vagas não recuperadas no mesmo dia',
    lossValue: '31%',
    lossColor: '#F47E6B',
    icon: (
      <svg
        aria-hidden="true"
        fill="none"
        height="20"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="20"
      >
        <rect height="18" rx="2" ry="2" width="18" x="3" y="4" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    iconBg: 'rgba(244, 126, 107, 0.1)',
    iconColor: '#F47E6B',
  },
  {
    id: 'retorno',
    title: 'Ausência de retorno',
    description:
      'Pacientes de procedimentos recorrentes concluem uma etapa, mas a clínica não realiza o agendamento preventivo do retorno, gerando inatividade desnecessária.',
    lossLabel: 'Pacientes recorrentes sem convite',
    lossValue: '22%',
    lossColor: '#F5A26F',
    icon: (
      <svg
        aria-hidden="true"
        fill="none"
        height="20"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="20"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" x2="20" y1="8" y2="14" />
        <line x1="23" x2="17" y1="11" y2="11" />
      </svg>
    ),
    iconBg: 'rgba(245, 162, 111, 0.1)',
    iconColor: '#F5A26F',
  },
] as const;

// ─── Hook de intersection observer para fade-in ────────────────────────────────

function useFadeIn() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Sob prefers-reduced-motion, o CSS força visibilidade (sem transição);
    // o observer permanece inofensivo nesse caso.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ─── Componente de card de problema ───────────────────────────────────────────

function ProblemCard({ problem, index }: { problem: (typeof PROBLEMS)[number]; index: number }) {
  const { ref, visible } = useFadeIn();

  return (
    <article
      className={`problem-card${visible ? ' problem-card--visible' : ''}`}
      ref={ref as React.RefObject<HTMLElement>}
      style={{ transitionDelay: `${index * 80}ms` }}
      aria-labelledby={`problem-title-${problem.id}`}
    >
      {/* Ícone */}
      <div
        className="problem-card-icon"
        style={{ background: problem.iconBg, color: problem.iconColor }}
      >
        {problem.icon}
      </div>

      {/* Conteúdo */}
      <div className="problem-card-body">
        <h3 className="problem-card-title" id={`problem-title-${problem.id}`}>
          {problem.title}
        </h3>
        <p className="problem-card-desc">{problem.description}</p>

        {/* Indicador de perda */}
        <div
          className="problem-card-loss"
          aria-label={`${problem.lossLabel}: ${problem.lossValue} — dado ilustrativo`}
        >
          <span className="problem-card-loss-value" style={{ color: problem.lossColor }}>
            {problem.lossValue}
          </span>
          <div className="problem-card-loss-meta">
            <span className="problem-card-loss-label">{problem.lossLabel}</span>
            <span className="problem-card-loss-note">Dado ilustrativo</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ProblemSection() {
  const { ref: headingRef, visible: headingVisible } = useFadeIn();

  return (
    <section aria-labelledby="problem-section-heading" className="problem-section" id="problema">
      <div className="site-container problem-section-inner">
        {/* Coluna esquerda — heading e chamada */}
        <div
          className={`problem-heading-col${headingVisible ? ' problem-heading-col--visible' : ''}`}
          ref={headingRef as React.RefObject<HTMLDivElement>}
        >
          <span className="problem-eyebrow" aria-hidden="true">
            Os vazamentos invisíveis da operação
          </span>

          <h2 className="problem-headline" id="problem-section-heading">
            Oportunidades são perdidas entre a primeira mensagem e o comparecimento.
          </h2>

          <p className="problem-lead">
            Leads esfriam, cancelamentos viram horários vazios e pacientes deixam de retornar quando
            a operação depende de tarefas manuais, informações dispersas e acompanhamentos sem
            próxima ação definida.
          </p>

          {/* Linha conectora visual */}
          <div className="problem-connector" aria-hidden="true">
            <span className="problem-connector-dot" />
            <span className="problem-connector-line" />
            <span className="problem-connector-label">A Althion fecha cada um desses pontos.</span>
          </div>
        </div>

        {/* Coluna direita — cards de problema */}
        <div className="problem-cards-col">
          {PROBLEMS.map((problem, i) => (
            <ProblemCard index={i} key={problem.id} problem={problem} />
          ))}
        </div>
      </div>
    </section>
  );
}
