'use client';

import { useState } from 'react';

interface ScoreDimension {
  title: string;
  score: number;
  description: string;
  problem: string;
  recommendation: string;
  badge: string;
}

const DIMENSIONS: Record<'velocidade' | 'conversao' | 'comparecimento' | 'recuperacao', ScoreDimension> = {
  velocidade: {
    title: 'Velocidade de Resposta',
    score: 64,
    description: 'Mede o tempo médio entre o primeiro contato do paciente via WhatsApp/redes sociais e o primeiro retorno qualificado da recepção.',
    problem: 'Tempo médio de resposta atual de 3 horas e 45 minutos. Leads esfriam após 15 minutos.',
    recommendation: 'Ativar triagem automática de IA para responder dúvidas administrativas frequentes em menos de 2 minutos.',
    badge: 'Atenção',
  },
  conversao: {
    title: 'Conversão de Leads',
    score: 72,
    description: 'Mapeia a porcentagem de contatos qualificados com intenção de agendamento que realmente chegam a agendar uma consulta.',
    problem: '35% dos contatos iniciam intenção de consulta mas são abandonados sem proposta de horários específicos.',
    recommendation: 'Implementar fluxo de follow-up guiado no Portal do Cliente com sugestões de agenda vazia.',
    badge: 'Saudável',
  },
  comparecimento: {
    title: 'Taxa de Comparecimento',
    score: 82,
    description: 'Analisa o índice de faltas e desmarcações em cima da hora (No-Show) e a eficácia das mensagens de confirmação.',
    problem: 'Mensagens de confirmação enviadas muito tarde, sem tempo hábil para realocação de horários cancelados.',
    recommendation: 'Configurar régua de confirmação inteligente com 48h e 24h de antecedência pelo WhatsApp.',
    badge: 'Saudável',
  },
  recuperacao: {
    title: 'Recuperação de Ociosidade',
    score: 45,
    description: 'Avalia a agilidade da equipe em reocupar vagas abertas por cancelamentos recentes ou reativar pacientes sumidos.',
    problem: 'Quando um paciente cancela, a vaga permanece ociosa na maioria das vezes, pois a fila de espera não é acionada.',
    recommendation: 'Ativar o Recovery Engine para disparar convites automáticos e restritos à lista de espera da clínica.',
    badge: 'Crítico',
  },
};

export function AlthionScoreDial() {
  const [selected, setSelected] = useState<keyof typeof DIMENSIONS>('velocidade');
  const current = DIMENSIONS[selected];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px', padding: '32px' }}>
      {/* Visual Dial Column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '0.05em' }}>
          Althion Score — Demonstração
        </h3>

        <div style={{ position: 'relative', width: '200px', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden' }}>
          {/* SVG Gauge Background arc */}
          <svg width="200" height="200" style={{ position: 'absolute', bottom: 0 }}>
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="var(--line)"
              strokeWidth="14"
              strokeDasharray="251 251"
              strokeDashoffset="251"
              transform="rotate(-180 100 100)"
            />
            {/* SVG Active Score arc */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="14"
              strokeDasharray="251 251"
              strokeDashoffset={251 - (251 * (current.score / 100))}
              transform="rotate(-180 100 100)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '10px' }}>
            <span style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: '1', color: 'var(--text)' }}>
              {current.score}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: '600' }}>pontos</span>
          </div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.9rem', fontWeight: '600', color: current.score < 50 ? 'var(--danger)' : current.score < 70 ? 'var(--warning)' : 'var(--success)' }}>
          Status: {current.badge}
        </div>
      </div>

      {/* Interactive Details Column */}
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {(Object.keys(DIMENSIONS) as Array<keyof typeof DIMENSIONS>).map((key) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              style={{
                background: selected === key ? 'var(--primary)' : 'transparent',
                color: selected === key ? '#fff' : 'var(--text)',
                border: '1px solid var(--line)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              type="button"
            >
              {DIMENSIONS[key].title.split(' ')[0]}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 'bold' }}>{current.title}</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.5' }}>{current.description}</p>
          </div>

          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.04)', borderLeft: '3px solid var(--danger)', borderRadius: '4px' }}>
            <strong style={{ fontSize: '0.8rem', color: 'var(--danger)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Problema Identificado (Exemplo)
            </strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)' }}>{current.problem}</p>
          </div>

          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.04)', borderLeft: '3px solid var(--success)', borderRadius: '4px' }}>
            <strong style={{ fontSize: '0.8rem', color: 'var(--success)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Recomendação Recomendada
            </strong>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)' }}>{current.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
