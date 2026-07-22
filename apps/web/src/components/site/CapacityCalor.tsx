'use client';

import { useState } from 'react';

interface DayCapacity {
  day: string;
  date: string;
  occupancy: number; // 0-100
  status: 'low' | 'moderate' | 'optimal';
  leadsWaiting: number;
  recommendation: string;
}

const WEEK_DATA: DayCapacity[] = [
  {
    day: 'Segunda',
    date: '20/07',
    occupancy: 85,
    status: 'optimal',
    leadsWaiting: 2,
    recommendation: 'Ocupação da agenda está dentro da meta saudável da clínica.',
  },
  {
    day: 'Terça',
    date: '21/07',
    occupancy: 42,
    status: 'low',
    leadsWaiting: 5,
    recommendation:
      'Baixa ocupação detectada na terça-feira. Mapeados 5 leads na fila de espera com preferência por este dia.',
  },
  {
    day: 'Quarta',
    date: '22/07',
    occupancy: 60,
    status: 'moderate',
    leadsWaiting: 1,
    recommendation: 'Ocupação média. 1 contato em aberto aguardando retorno.',
  },
  {
    day: 'Quinta',
    date: '23/07',
    occupancy: 90,
    status: 'optimal',
    leadsWaiting: 0,
    recommendation: 'Ocupação ideal. Nenhuma oportunidade de reativação necessária.',
  },
  {
    day: 'Sexta',
    date: '24/07',
    occupancy: 35,
    status: 'low',
    leadsWaiting: 7,
    recommendation:
      'Janelas ociosas identificadas. Há 7 pacientes elegíveis para contato de acompanhamento periódico.',
  },
];

const STATUS_LABEL: Record<DayCapacity['status'], string> = {
  low: 'Ocupação baixa',
  moderate: 'Ocupação média',
  optimal: 'Ocupação saudável',
};

export function CapacityCalor() {
  const [selectedIdx, setSelectedIdx] = useState(1);
  const current = (WEEK_DATA[selectedIdx] ?? WEEK_DATA[0])!;

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(16, 32, 27, 0.08)',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.01)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              color: '#2055A6',
              fontWeight: '700',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            Em Desenvolvimento
          </span>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--text)' }}>
            Monitor de Ocupação da Agenda
          </h3>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#29C7A1' }}
            />{' '}
            Saúdável
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8A4B16' }}
            />{' '}
            Médio
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#A83C32' }}
            />{' '}
            Ocioso
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {WEEK_DATA.map((day, idx) => (
          <button
            key={day.day}
            aria-pressed={selectedIdx === idx}
            onClick={() => setSelectedIdx(idx)}
            style={{
              background: selectedIdx === idx ? '#F5F7F3' : '#FFFFFF',
              border:
                selectedIdx === idx ? '2px solid var(--text)' : '1px solid rgba(16, 32, 27, 0.08)',
              borderRadius: '16px',
              padding: '20px 12px',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            type="button"
          >
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--muted)' }}>
              {day.day}
            </span>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text)' }}>
              {day.date}
            </span>
            <span
              aria-hidden="true"
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background:
                  day.status === 'optimal'
                    ? '#29C7A1'
                    : day.status === 'moderate'
                      ? '#8A4B16'
                      : '#A83C32',
              }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '700' }}>
              {day.occupancy}%
            </span>
            <span className="sr-only">{STATUS_LABEL[day.status]}</span>
          </button>
        ))}
      </div>

      <div
        style={{
          background: '#F5F7F3',
          border: '1px solid rgba(16, 32, 27, 0.04)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <strong style={{ fontSize: '0.95rem', color: 'var(--text)' }}>
            Auditoria da Ocupação ({current.day} — {current.date})
          </strong>
          <span
            className={`badge ${current.status === 'optimal' ? 'success' : current.status === 'moderate' ? 'warning' : 'danger'}`}
            style={{ fontSize: '0.75rem' }}
          >
            {current.status === 'optimal' && 'Capacidade Otimizada'}
            {current.status === 'moderate' && 'Capacidade Moderada'}
            {current.status === 'low' && 'Baixa Ocupação'}
          </span>
        </div>
        <p
          style={{
            margin: '0 0 16px 0',
            fontSize: '0.9rem',
            color: 'var(--muted)',
            lineHeight: '1.6',
          }}
        >
          {current.recommendation}
        </p>
        {current.leadsWaiting > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#A83C32' }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <small style={{ fontWeight: '700', fontSize: '0.85rem' }}>
              Há {current.leadsWaiting} paciente(s) elegíveis na fila de espera prioritária para
              reocupação.
            </small>
          </div>
        ) : null}
      </div>
    </div>
  );
}
