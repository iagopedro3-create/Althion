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
  { day: 'Seg', date: '20 Jul', occupancy: 85, status: 'optimal', leadsWaiting: 2, recommendation: 'Ocupação ideal. Nenhuma ação recomendada.' },
  { day: 'Ter', date: '21 Jul', occupancy: 42, status: 'low', leadsWaiting: 6, recommendation: 'Baixa ocupação detectada. Sugerido acionar 6 pacientes da fila de espera do tratamento de Implante.' },
  { day: 'Qua', date: '22 Jul', occupancy: 60, status: 'moderate', leadsWaiting: 1, recommendation: 'Ocupação média. 1 lead qualificado aguardando resposta rápida no CRM.' },
  { day: 'Qui', date: '23 Jul', occupancy: 90, status: 'optimal', leadsWaiting: 0, recommendation: 'Ocupação ideal. Priorizar estabilidade do fluxo.' },
  { day: 'Sex', date: '24 Jul', occupancy: 35, status: 'low', leadsWaiting: 8, recommendation: 'Alerta de ociosidade na sexta. Há 8 indicações de retorno estético pendentes.' },
];

export function CapacityCalor() {
  const [selectedIdx, setSelectedIdx] = useState(1); // Default to Terça-feira
  const current = (WEEK_DATA[selectedIdx] ?? WEEK_DATA[0])!;

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px', padding: '28px' }}>
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
          Módulo em evolução
        </span>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Monitor de Capacidade Futura</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {WEEK_DATA.map((day, idx) => (
          <button
            key={day.day}
            onClick={() => setSelectedIdx(idx)}
            style={{
              background: selectedIdx === idx ? 'rgba(30, 58, 138, 0.05)' : 'transparent',
              border: selectedIdx === idx ? '2px solid var(--primary)' : '1px solid var(--line)',
              borderRadius: '12px',
              padding: '16px 8px',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            type="button"
          >
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--muted)' }}>{day.day}</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{day.date}</span>
            {/* Heat dot */}
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: day.status === 'optimal' ? 'var(--success)' : day.status === 'moderate' ? 'var(--warning)' : 'var(--danger)',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: '500' }}>{day.occupancy}%</span>
          </button>
        ))}
      </div>

      <div style={{ background: 'rgba(30, 58, 138, 0.02)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <strong style={{ fontSize: '0.9rem' }}>Ações Inteligentes para {current.day} ({current.date})</strong>
          <span
            className="badge"
            style={{
              background: current.status === 'optimal' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: current.status === 'optimal' ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {current.status === 'optimal' && 'Capacidade Otimizada'}
            {current.status === 'moderate' && 'Capacidade Moderada'}
            {current.status === 'low' && 'Alerta de Ociosidade'}
          </span>
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.5' }}>
          {current.recommendation}
        </p>
        {current.leadsWaiting > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)' }} />
            <small style={{ fontWeight: '600', color: 'var(--danger)' }}>
              {current.leadsWaiting} paciente(s) da fila de espera possuem preferência por esse dia.
            </small>
          </div>
        ) : null}
      </div>
    </div>
  );
}
