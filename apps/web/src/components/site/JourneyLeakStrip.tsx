'use client';

// ─── Pontos de vazamento da jornada do paciente ──────────────────────────────
// Todos os percentuais são dados ilustrativos — não representam métricas reais.

const LEAK_POINTS = [
  {
    id: 1,
    stage: 'Primeiro contato',
    loss: '28%',
    label: 'dos contatos não recebem retorno em até 10 min.',
    color: '#A83C32',
    severity: 'high',
  },
  {
    id: 2,
    stage: 'Atendimento inicial',
    loss: '19%',
    label: 'das conversas não chegam a uma proposta de horário.',
    color: '#8A4B16',
    severity: 'medium',
  },
  {
    id: 3,
    stage: 'Oferta de agendamento',
    loss: '14%',
    label: 'dos interessados abandonam antes de confirmar.',
    color: '#8A4B16',
    severity: 'medium',
  },
  {
    id: 4,
    stage: 'Confirmação',
    loss: '11%',
    label: 'dos agendados não recebem lembrete ativo.',
    color: '#755B00',
    severity: 'medium',
  },
  {
    id: 5,
    stage: 'Dia do atendimento',
    loss: '8%',
    label: 'de cancelamentos na véspera sem oferta de reposição.',
    color: '#755B00',
    severity: 'low',
  },
  {
    id: 6,
    stage: 'Pós-atendimento',
    loss: '22%',
    label: 'de pacientes recorrentes não recebem convite de retorno.',
    color: '#A83C32',
    severity: 'high',
  },
  {
    id: 7,
    stage: 'Fila de espera',
    loss: '31%',
    label: 'das vagas canceladas não são recuperadas no mesmo dia.',
    color: '#A83C32',
    severity: 'high',
  },
] as const;

export function JourneyLeakStrip() {
  return (
    <div className="leak-strip-wrapper">
      {/* Conteúdo acessível: o carrossel animado abaixo é aria-hidden */}
      <ul className="sr-only">
        <li>Pontos de perda da jornada do paciente — dados ilustrativos:</li>
        {LEAK_POINTS.map((point) => (
          <li key={point.id}>
            {point.stage}: {point.loss} {point.label}
          </li>
        ))}
      </ul>
      {/* Primeira passagem */}
      <div className="leak-strip" aria-hidden="true">
        {LEAK_POINTS.map((point) => (
          <article className="leak-card" key={`a-${point.id}`} data-severity={point.severity}>
            <header className="leak-card-header">
              <span className="leak-card-stage">{point.stage}</span>
              <span className="leak-card-loss" style={{ color: point.color }}>
                {point.loss}
              </span>
            </header>
            <p className="leak-card-label">{point.label}</p>
          </article>
        ))}
      </div>
      {/* Segunda passagem (loop infinito) */}
      <div className="leak-strip leak-strip--clone" aria-hidden="true">
        {LEAK_POINTS.map((point) => (
          <article className="leak-card" key={`b-${point.id}`} data-severity={point.severity}>
            <header className="leak-card-header">
              <span className="leak-card-stage">{point.stage}</span>
              <span className="leak-card-loss" style={{ color: point.color }}>
                {point.loss}
              </span>
            </header>
            <p className="leak-card-label">{point.label}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
