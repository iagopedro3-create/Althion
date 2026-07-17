'use client';

import { useEffect, useState } from 'react';

type OpportState = 'identificada' | 'priorizada' | 'acao' | 'recuperada';

interface OpportItem {
  id: string;
  type: string;
  patientInitials: string;
  timeParado: string;
  state: OpportState;
  potencial: string;
}

export function RecoveryOpportunityFila() {
  const [opps, setOpps] = useState<readonly OpportItem[]>([
    { id: '1', type: 'Cancelamento Recente', patientInitials: 'Paciente M. C.', timeParado: '12 minutos', state: 'identificada', potencial: 'Consulta Geral' },
    { id: '2', type: 'Lead sem Acompanhamento', patientInitials: 'Paciente G. S.', timeParado: '2 horas', state: 'priorizada', potencial: 'Retorno Clínico' },
    { id: '3', type: 'Ausência sem Justificativa', patientInitials: 'Paciente A. O.', timeParado: '24 horas', state: 'acao', potencial: 'Procedimento' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOpps((prev) =>
        prev.map((op) => {
          if (op.state === 'identificada') return { ...op, state: 'priorizada' };
          if (op.state === 'priorizada') return { ...op, state: 'acao' };
          if (op.state === 'acao') return { ...op, state: 'recuperada' };
          return { ...op, state: 'identificada', timeParado: 'Poucos segundos' };
        }),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid rgba(16, 32, 27, 0.08)', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.01)', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(16, 32, 27, 0.08)', paddingBottom: '12px', fontSize: '0.75rem', color: '#52635D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <th style={{ padding: '12px 8px' }}>Vazamento Identificado</th>
            <th style={{ padding: '12px 8px' }}>Referência</th>
            <th style={{ padding: '12px 8px' }}>Tempo Ocioso</th>
            <th style={{ padding: '12px 8px' }}>Impacto Mapeado</th>
            <th style={{ padding: '12px 8px' }}>Status Operacional</th>
          </tr>
        </thead>
        <tbody>
          {opps.map((op) => (
            <tr key={op.id} style={{ borderBottom: '1px solid rgba(16, 32, 27, 0.04)', transition: 'all 0.3s ease' }}>
              <td style={{ padding: '20px 8px', fontSize: '0.92rem', fontWeight: '700', color: '#10201B' }}>{op.type}</td>
              <td style={{ padding: '20px 8px', fontSize: '0.9rem', color: '#52635D' }}>{op.patientInitials}</td>
              <td style={{ padding: '20px 8px', fontSize: '0.88rem', color: '#52635D' }}>{op.timeParado}</td>
              <td style={{ padding: '20px 8px', fontSize: '0.92rem', fontWeight: '600', color: '#377CF6' }}>{op.potencial}</td>
              <td style={{ padding: '20px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    {op.state === 'identificada' && 'Identificada'}
                    {op.state === 'priorizada' && 'Priorizada'}
                    {op.state === 'acao' && 'Em andamento'}
                    {op.state === 'recuperada' && 'Recuperada!'}
                  </span>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#377CF6', opacity: 1 }} />
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#377CF6', opacity: op.state !== 'identificada' ? 1 : 0.2 }} />
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#377CF6', opacity: op.state === 'acao' || op.state === 'recuperada' ? 1 : 0.2 }} />
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#29C7A1', opacity: op.state === 'recuperada' ? 1 : 0.2 }} />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#52635D', fontStyle: 'italic', textAlign: 'center' }}>
        * Oportunidades processadas com aprovação humana e limites de frequência de contato.
      </div>
    </div>
  );
}
