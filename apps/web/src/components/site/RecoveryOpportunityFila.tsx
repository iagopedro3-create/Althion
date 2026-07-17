'use client';

import { useEffect, useState } from 'react';

type OpportState = 'identificada' | 'priorizada' | 'acao' | 'recuperada';

interface OpportItem {
  id: string;
  type: string;
  patient: string;
  timeParado: string;
  state: OpportState;
  potencial: string;
}

export function RecoveryOpportunityFila() {
  const [opps, setOpps] = useState<readonly OpportItem[]>([
    { id: '1', type: 'Cancelamento Recente', patient: 'Mariana Costa (Dermatologia)', timeParado: '10 minutos', state: 'identificada', potencial: 'R$ 450,00' },
    { id: '2', type: 'Lead sem Resposta', patient: 'Gustavo Santos (Implante)', timeParado: '2 horas', state: 'priorizada', potencial: 'R$ 3.500,00' },
    { id: '3', type: 'Falta sem Contato', patient: 'Aline Oliveira (Ortodontia)', timeParado: '1 dia', state: 'acao', potencial: 'R$ 180,00' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpps((prev) =>
        prev.map((op) => {
          if (op.state === 'identificada') return { ...op, state: 'priorizada' };
          if (op.state === 'priorizada') return { ...op, state: 'acao' };
          if (op.state === 'acao') return { ...op, state: 'recuperada' };
          return { ...op, state: 'identificada', timeParado: 'Alguns segundos' };
        }),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px', padding: '24px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)', paddingBottom: '8px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
            <th style={{ padding: '12px 8px' }}>Oportunidade</th>
            <th style={{ padding: '12px 8px' }}>Paciente</th>
            <th style={{ padding: '12px 8px' }}>Tempo Ocioso</th>
            <th style={{ padding: '12px 8px' }}>Potencial</th>
            <th style={{ padding: '12px 8px' }}>Progresso Operacional</th>
          </tr>
        </thead>
        <tbody>
          {opps.map((op) => (
            <tr key={op.id} style={{ borderBottom: '1px solid var(--line)', transition: 'all 0.3s ease' }}>
              <td style={{ padding: '16px 8px', fontSize: '0.9rem', fontWeight: '600' }}>{op.type}</td>
              <td style={{ padding: '16px 8px', fontSize: '0.9rem', color: 'var(--text)' }}>{op.patient}</td>
              <td style={{ padding: '16px 8px', fontSize: '0.85rem', color: 'var(--muted)' }}>{op.timeParado}</td>
              <td style={{ padding: '16px 8px', fontSize: '0.9rem', fontWeight: '500', color: 'var(--success)' }}>{op.potencial}</td>
              <td style={{ padding: '16px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className={`badge ${
                      op.state === 'recuperada'
                        ? 'success'
                        : op.state === 'acao'
                        ? 'primary'
                        : op.state === 'priorizada'
                        ? 'warning'
                        : 'muted'
                    }`}
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  >
                    {op.state === 'identificada' && 'Identificada'}
                    {op.state === 'priorizada' && 'Priorizada'}
                    {op.state === 'acao' && 'Em ação'}
                    {op.state === 'recuperada' && 'Recuperada!'}
                  </span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)', opacity: 1 }} />
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)', opacity: op.state !== 'identificada' ? 1 : 0.3 }} />
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)', opacity: op.state === 'acao' || op.state === 'recuperada' ? 1 : 0.3 }} />
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--success)', opacity: op.state === 'recuperada' ? 1 : 0.3 }} />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
