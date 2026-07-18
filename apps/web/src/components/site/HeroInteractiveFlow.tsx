'use client';

import { useEffect, useReducer } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface JourneyStep {
  id: number;
  label: string;
  status: 'pending' | 'active' | 'done';
  origin: string;
  action: string;
  responsible: 'ia' | 'humano' | 'sistema';
  elapsed: string;
}

// ─── Dados das 10 etapas da jornada ───────────────────────────────────────────

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 1,
    label: 'Novo contato',
    status: 'done',
    origin: 'WhatsApp',
    action: 'Primeiro atendimento iniciado',
    responsible: 'ia',
    elapsed: 'Imediato',
  },
  {
    id: 2,
    label: 'Necessidade identificada',
    status: 'done',
    origin: 'IA',
    action: 'Reagendamento solicitado',
    responsible: 'ia',
    elapsed: '12 s',
  },
  {
    id: 3,
    label: 'Atendimento iniciado',
    status: 'done',
    origin: 'Fluxo IA',
    action: 'Opções de horário apresentadas',
    responsible: 'ia',
    elapsed: '1 min',
  },
  {
    id: 4,
    label: 'Agendamento realizado',
    status: 'done',
    origin: 'Agenda',
    action: 'Vaga confirmada',
    responsible: 'sistema',
    elapsed: '3 min',
  },
  {
    id: 5,
    label: 'Confirmação enviada',
    status: 'done',
    origin: 'WhatsApp',
    action: 'Lembrete automático agendado',
    responsible: 'sistema',
    elapsed: '3 min',
  },
  {
    id: 6,
    label: 'Cancelamento detectado',
    status: 'active',
    origin: 'Agenda',
    action: 'Vaga liberada — recuperação iniciada',
    responsible: 'sistema',
    elapsed: '2 dias',
  },
  {
    id: 7,
    label: 'Reagendamento oferecido',
    status: 'pending',
    origin: 'Recovery Engine',
    action: 'Contato da fila de espera acionado',
    responsible: 'ia',
    elapsed: 'Aguardando',
  },
  {
    id: 8,
    label: 'Horário recuperado',
    status: 'pending',
    origin: 'Agenda',
    action: 'Nova confirmação enviada',
    responsible: 'sistema',
    elapsed: '-',
  },
  {
    id: 9,
    label: 'Especialista informado',
    status: 'pending',
    origin: 'Cockpit',
    action: 'Indicador de recuperação atualizado',
    responsible: 'humano',
    elapsed: '-',
  },
  {
    id: 10,
    label: 'Indicador atualizado',
    status: 'pending',
    origin: 'Radar',
    action: 'Score recalculado',
    responsible: 'sistema',
    elapsed: '-',
  },
];

// ─── Reducer de estado ────────────────────────────────────────────────────────

function stepsReducer(
  state: { active: number; paused: boolean },
  action: { type: 'advance' | 'pause' | 'resume' | 'jump'; payload?: number },
) {
  switch (action.type) {
    case 'advance':
      if (state.paused) return state;
      return { ...state, active: (state.active + 1) % JOURNEY_STEPS.length };
    case 'pause':
      return { ...state, paused: true };
    case 'resume':
      return { ...state, paused: false };
    case 'jump':
      return { active: action.payload ?? 0, paused: true };
    default:
      return state;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RESPONSIBLE_LABEL: Record<JourneyStep['responsible'], string> = {
  ia: 'Inteligência artificial',
  humano: 'Especialista',
  sistema: 'Sistema',
};

const STATUS_COLOR: Record<JourneyStep['status'], string> = {
  done: '#18A987',
  active: '#F5A26F',
  pending: 'rgba(169, 187, 180, 0.3)',
};

const STATUS_LABEL: Record<JourneyStep['status'], string> = {
  done: 'Concluído',
  active: 'Em andamento',
  pending: 'Aguardando',
};

// ─── Componente principal ─────────────────────────────────────────────────────

export function HeroInteractiveFlow() {
  const [state, dispatch] = useReducer(stepsReducer, { active: 5, paused: false });

  // Avança automaticamente a cada 3.5 s (respeita reduced-motion suspendendo)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return; // Sem auto-play em reduced-motion

    const timer = setInterval(() => dispatch({ type: 'advance' }), 3500);
    return () => clearInterval(timer);
  }, []);

  // state.active is always within [0, JOURNEY_STEPS.length) — bounded by modulo in the reducer
  const activeStep = JOURNEY_STEPS[state.active] as JourneyStep;
  const visibleIndices = getVisibleWindow(state.active, JOURNEY_STEPS.length, 3);

  return (
    <div
      className="hero-flow"
      onMouseEnter={() => dispatch({ type: 'pause' })}
      onMouseLeave={() => dispatch({ type: 'resume' })}
      onFocus={() => dispatch({ type: 'pause' })}
      onBlur={() => dispatch({ type: 'resume' })}
      aria-label="Demonstração do fluxo da jornada administrativa"
    >
      {/* Cabeçalho */}
      <div className="hero-flow-header">
        <span className="hero-flow-eyebrow">Jornada administrativa — dado ilustrativo</span>
        <span
          className={`badge ${activeStep.status === 'active' ? 'warning' : activeStep.status === 'done' ? 'success' : 'muted'}`}
          style={{ fontSize: '0.72rem' }}
        >
          {STATUS_LABEL[activeStep.status]}
        </span>
      </div>

      {/* Card principal ativo */}
      <div className="hero-flow-main-card" aria-live="polite" aria-atomic="true">
        <div className="hero-flow-step-badge">
          Etapa {activeStep.id} de {JOURNEY_STEPS.length}
        </div>
        <h3 className="hero-flow-step-title">{activeStep.label}</h3>
        <div className="hero-flow-meta">
          <div className="hero-flow-meta-row">
            <span className="hero-flow-meta-label">Ação</span>
            <span className="hero-flow-meta-value">{activeStep.action}</span>
          </div>
          <div className="hero-flow-meta-row">
            <span className="hero-flow-meta-label">Origem</span>
            <span className="hero-flow-meta-value">{activeStep.origin}</span>
          </div>
          <div className="hero-flow-meta-row">
            <span className="hero-flow-meta-label">Responsável</span>
            <span className="hero-flow-meta-value">
              {RESPONSIBLE_LABEL[activeStep.responsible]}
            </span>
          </div>
          <div className="hero-flow-meta-row">
            <span className="hero-flow-meta-label">Tempo</span>
            <span className="hero-flow-meta-value">{activeStep.elapsed}</span>
          </div>
        </div>
      </div>

      {/* Miniaturas das etapas adjacentes */}
      <div className="hero-flow-steps" aria-label="Etapas da jornada">
        {visibleIndices.map((idx) => {
          const step = JOURNEY_STEPS[idx]!;
          const isActive = idx === state.active;
          return (
            <button
              aria-label={`Ir para etapa ${step.id}: ${step.label}`}
              aria-pressed={isActive}
              className={`hero-flow-step-btn${isActive ? ' hero-flow-step-btn--active' : ''}`}
              key={step.id}
              onClick={() => dispatch({ type: 'jump', payload: idx })}
              type="button"
            >
              <span
                className="hero-flow-step-dot"
                style={{ background: STATUS_COLOR[step.status] }}
              />
              <span className="hero-flow-step-label">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Barra de progresso e navegação */}
      <div className="hero-flow-footer">
        <div
          className="hero-flow-progress"
          role="progressbar"
          aria-valuenow={state.active + 1}
          aria-valuemin={1}
          aria-valuemax={JOURNEY_STEPS.length}
          aria-label="Progresso da jornada"
        >
          {JOURNEY_STEPS.map((s, i) => (
            <button
              aria-label={`Etapa ${s.id}`}
              className={`hero-flow-dot${i === state.active ? ' hero-flow-dot--active' : ''}`}
              key={s.id}
              onClick={() => dispatch({ type: 'jump', payload: i })}
              type="button"
            />
          ))}
        </div>
        <div className="hero-flow-nav">
          <button
            aria-label="Etapa anterior"
            className="hero-flow-nav-btn"
            onClick={() =>
              dispatch({
                type: 'jump',
                payload: (state.active - 1 + JOURNEY_STEPS.length) % JOURNEY_STEPS.length,
              })
            }
            type="button"
          >
            &#8592;
          </button>
          <button
            aria-label="Próxima etapa"
            className="hero-flow-nav-btn"
            onClick={() =>
              dispatch({ type: 'jump', payload: (state.active + 1) % JOURNEY_STEPS.length })
            }
            type="button"
          >
            &#8594;
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Utilitário: janela deslizante de índices visíveis ────────────────────────

function getVisibleWindow(active: number, total: number, window: number): number[] {
  const half = Math.floor(window / 2);
  return Array.from({ length: window }, (_, i) => {
    const raw = active - half + i;
    return ((raw % total) + total) % total;
  });
}
