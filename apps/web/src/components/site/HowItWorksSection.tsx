'use client';

import { useEffect, useRef, useState } from 'react';

// ─── Etapas da jornada ────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'contato',
    number: '01',
    title: 'Contato unificado',
    description:
      'Mensagens de WhatsApp, formulários e ligações chegam em um único painel. A equipe não precisa alternar entre aplicativos para saber o que está pendente.',
    tag: null,
    mockupKey: 'inbox',
  },
  {
    id: 'qualificacao',
    number: '02',
    title: 'Qualificação da intenção',
    description:
      'A IA identifica se o contato busca agendamento, informação ou suporte e define a próxima ação sem que a recepção precise ler cada mensagem manualmente.',
    tag: null,
    mockupKey: 'qualify',
  },
  {
    id: 'horario',
    number: '03',
    title: 'Proposta de horário',
    description:
      'Com base na disponibilidade da agenda, o sistema sugere opções de horário e conduz a conversa até a confirmação, sem intervenção manual no fluxo padrão.',
    tag: null,
    mockupKey: 'schedule',
  },
  {
    id: 'confirmacao',
    number: '04',
    title: 'Confirmação e lembrete',
    description:
      'O paciente recebe confirmação imediata e lembretes automáticos com antecedência. Cancelamentos disparam o fluxo de reposição sem depender da recepção.',
    tag: null,
    mockupKey: 'confirm',
  },
  {
    id: 'monitoramento',
    number: '05',
    title: 'Monitoramento de comparecimento',
    description:
      'Ausências e cancelamentos de última hora são detectados. O sistema aciona a lista de espera e oferece o horário vago antes que se torne perda definitiva.',
    tag: null,
    mockupKey: 'monitor',
  },
  {
    id: 'retorno',
    number: '06',
    title: 'Próximo passo definido',
    description:
      'Após o atendimento, o ciclo reinicia com um convite de retorno ou reengajamento. Pacientes recorrentes não são esquecidos; cada consulta gera um gatilho para o próximo contato.',
    tag: null,
    mockupKey: 'return',
  },
] as const;

type MockupKey = (typeof STEPS)[number]['mockupKey'];

// ─── Mockups de painel (dados fictícios — não representam pacientes reais) ────

function MockupInbox() {
  const items = [
    { label: 'Ana Clara', msg: 'Boa tarde, gostaria de agendar...', time: '14:02', dot: '#18A987' },
    { label: 'Roberto S.', msg: 'Vocês atendem sábado?', time: '13:47', dot: '#F5A26F' },
    { label: 'Mariana F.', msg: 'Preciso remarcar minha consulta', time: '13:11', dot: '#F47E6B' },
    { label: 'Carlos M.', msg: 'Olá, vi no Instagram...', time: '12:58', dot: '#18A987' },
  ];
  return (
    <div className="hw-mockup-panel">
      <div className="hw-mockup-bar">
        <span className="hw-mockup-bar-title">Caixa de entrada unificada</span>
        <span className="badge success" style={{ fontSize: '0.65rem' }}>
          4 novos
        </span>
      </div>
      <ul className="hw-mockup-list">
        {items.map((item) => (
          <li className="hw-mockup-item" key={item.label}>
            <span className="hw-mockup-dot" style={{ background: item.dot }} />
            <div className="hw-mockup-item-body">
              <span className="hw-mockup-item-name">{item.label}</span>
              <span className="hw-mockup-item-msg">{item.msg}</span>
            </div>
            <span className="hw-mockup-item-time">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MockupQualify() {
  return (
    <div className="hw-mockup-panel">
      <div className="hw-mockup-bar">
        <span className="hw-mockup-bar-title">Triagem automática</span>
        <span className="badge warning" style={{ fontSize: '0.65rem' }}>
          Em análise
        </span>
      </div>
      <div className="hw-mockup-qualify-card">
        <p className="hw-mockup-qualify-msg">
          &ldquo;Boa tarde, gostaria de agendar uma consulta com a doutora para a próxima
          semana.&rdquo;
        </p>
        <div className="hw-mockup-qualify-tags">
          <span className="hw-mockup-tag hw-mockup-tag--green">Intenção: Agendamento</span>
          <span className="hw-mockup-tag hw-mockup-tag--grey">Canal: WhatsApp</span>
          <span className="hw-mockup-tag hw-mockup-tag--grey">Prioridade: Alta</span>
        </div>
        <div className="hw-mockup-qualify-action">
          <span className="hw-mockup-qualify-action-label">Próxima ação sugerida</span>
          <span className="hw-mockup-qualify-action-value">Oferecer horário disponível</span>
        </div>
      </div>
    </div>
  );
}

function MockupSchedule() {
  const slots = [
    { day: 'Seg 21', time: '09:00', available: true },
    { day: 'Seg 21', time: '11:30', available: true },
    { day: 'Ter 22', time: '08:00', available: false },
    { day: 'Ter 22', time: '15:00', available: true },
    { day: 'Qua 23', time: '10:00', available: true },
    { day: 'Qua 23', time: '14:00', available: false },
  ];
  return (
    <div className="hw-mockup-panel">
      <div className="hw-mockup-bar">
        <span className="hw-mockup-bar-title">Horários disponíveis</span>
        <span className="badge success" style={{ fontSize: '0.65rem' }}>
          Dado ilustrativo
        </span>
      </div>
      <div className="hw-mockup-slots">
        {slots.map((slot) => (
          <div
            className={`hw-mockup-slot${slot.available ? ' hw-mockup-slot--open' : ' hw-mockup-slot--taken'}`}
            key={`${slot.day}-${slot.time}`}
          >
            <span className="hw-mockup-slot-day">{slot.day}</span>
            <span className="hw-mockup-slot-time">{slot.time}</span>
            <span className="hw-mockup-slot-status">
              {slot.available ? 'Disponível' : 'Ocupado'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupConfirm() {
  return (
    <div className="hw-mockup-panel">
      <div className="hw-mockup-bar">
        <span className="hw-mockup-bar-title">Fluxo de confirmação</span>
        <span className="badge success" style={{ fontSize: '0.65rem' }}>
          Automático
        </span>
      </div>
      <div className="hw-mockup-timeline">
        {[
          { label: 'Agendamento confirmado', time: 'Agora', done: true, color: '#18A987' },
          { label: 'Lembrete: 48h antes', time: 'Seg, 09:00', done: true, color: '#18A987' },
          { label: 'Lembrete: 2h antes', time: 'Qua, 08:00', done: false, color: '#F5A26F' },
          { label: 'Pós-atendimento', time: 'Qua, 14:00', done: false, color: '#A0AEA9' },
        ].map((evt) => (
          <div className="hw-mockup-tl-row" key={evt.label}>
            <div className="hw-mockup-tl-dot" style={{ background: evt.color }} />
            <div className="hw-mockup-tl-body">
              <span className="hw-mockup-tl-label">{evt.label}</span>
              <span className="hw-mockup-tl-time">{evt.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupMonitor() {
  return (
    <div className="hw-mockup-panel">
      <div className="hw-mockup-bar">
        <span className="hw-mockup-bar-title">Alerta de cancelamento</span>
        <span className="badge danger" style={{ fontSize: '0.65rem' }}>
          Ação necessária
        </span>
      </div>
      <div className="hw-mockup-alert-card">
        <div className="hw-mockup-alert-header">
          <span className="hw-mockup-alert-icon" aria-hidden="true">
            !
          </span>
          <span className="hw-mockup-alert-title">Vaga liberada detectada</span>
        </div>
        <p className="hw-mockup-alert-desc">
          Quarta-feira, 10:00 — Dr. Oliveira
          <br />
          Cancelamento registrado. Lista de espera acionada.
        </p>
        <div className="hw-mockup-alert-candidates">
          <span className="hw-mockup-alert-candidates-label">Contatos na lista de espera</span>
          <div className="hw-mockup-candidate-pills">
            <span className="hw-mockup-pill hw-mockup-pill--green">Patricia R.</span>
            <span className="hw-mockup-pill hw-mockup-pill--grey">Fernando A.</span>
            <span className="hw-mockup-pill hw-mockup-pill--grey">Juliana C.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockupReturn() {
  return (
    <div className="hw-mockup-panel">
      <div className="hw-mockup-bar">
        <span className="hw-mockup-bar-title">Gatilho de retorno</span>
        <span className="badge success" style={{ fontSize: '0.65rem' }}>
          Ativo
        </span>
      </div>
      <div className="hw-mockup-return-card">
        <div className="hw-mockup-return-row">
          <span className="hw-mockup-return-label">Paciente</span>
          <span className="hw-mockup-return-value">Mariana F.</span>
        </div>
        <div className="hw-mockup-return-row">
          <span className="hw-mockup-return-label">Último atendimento</span>
          <span className="hw-mockup-return-value">07/06/2026</span>
        </div>
        <div className="hw-mockup-return-row">
          <span className="hw-mockup-return-label">Ciclo estimado</span>
          <span className="hw-mockup-return-value">30 dias</span>
        </div>
        <div className="hw-mockup-return-row hw-mockup-return-row--highlight">
          <span className="hw-mockup-return-label">Status</span>
          <span className="hw-mockup-return-value hw-mockup-return-value--green">
            Lembrete enviado
          </span>
        </div>
        <p className="hw-mockup-return-note">Dados de exemplo — não representam pacientes reais</p>
      </div>
    </div>
  );
}

const MOCKUPS: Record<MockupKey, React.ReactNode> = {
  inbox: <MockupInbox />,
  qualify: <MockupQualify />,
  schedule: <MockupSchedule />,
  confirm: <MockupConfirm />,
  monitor: <MockupMonitor />,
  return: <MockupReturn />,
};

// ─── Componente principal ─────────────────────────────────────────────────────

export function HowItWorksSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, idx) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setActiveIndex(idx);
          }
        },
        // Trigger ao centro da viewport
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    // Com reduced-motion, nao precisa de observer — mostra tudo estatico
    if (mq.matches) {
      observers.forEach((obs) => obs.disconnect());
    }

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const activeMockupKey = STEPS[activeIndex]?.mockupKey ?? 'inbox';

  return (
    <section aria-labelledby="how-heading" className="how-section" id="como-funciona">
      <div className="site-container">
        {/* Cabeçalho */}
        <div className="how-header">
          <div>
            <span className="section-eyebrow" aria-hidden="true">
              Como funciona
            </span>
            <h2 className="section-headline" id="how-heading">
              Uma operação conectada, do primeiro contato à próxima ação.
            </h2>
          </div>
          <p className="section-lead how-lead">
            Entenda como a Althion organiza o fluxo administrativo da clínica, etapa por etapa, sem
            depender de processos manuais ou controles paralelos.
          </p>
        </div>

        {/* Corpo: etapas + mockup sticky */}
        <div className="how-body">
          {/* Coluna de etapas */}
          <div className="how-steps-col">
            {STEPS.map((step, idx) => (
              <article
                aria-current={idx === activeIndex ? 'step' : undefined}
                className={`how-step${idx === activeIndex ? ' how-step--active' : ''}`}
                key={step.id}
                ref={(el) => {
                  stepRefs.current[idx] = el;
                }}
              >
                <div className="how-step-number" aria-hidden="true">
                  {step.number}
                </div>
                <div className="how-step-body">
                  <h3 className="how-step-title">{step.title}</h3>
                  <p className="how-step-desc">{step.description}</p>
                </div>
                {/* Mockup inline — visível apenas no mobile (coluna sticky é ocultada) */}
                <div className="how-step-mockup-inline">{MOCKUPS[step.mockupKey]}</div>
              </article>
            ))}
          </div>

          {/* Mockup sticky */}
          <div className="how-mockup-col" aria-live="polite" aria-atomic="true">
            <div className="how-mockup-sticky">
              <div className="how-mockup-step-indicator">
                {STEPS.map((step, idx) => (
                  <button
                    aria-label={`Ir para etapa ${idx + 1}: ${step.title}`}
                    className={`how-mockup-pip${idx === activeIndex ? ' how-mockup-pip--active' : ''}`}
                    key={step.id}
                    onClick={() => {
                      setActiveIndex(idx);
                      stepRefs.current[idx]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      });
                    }}
                    type="button"
                  />
                ))}
              </div>
              <div className="how-mockup-frame" key={activeMockupKey}>
                {MOCKUPS[activeMockupKey]}
              </div>
              <p className="how-mockup-note">Mockup ilustrativo — interface em desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
