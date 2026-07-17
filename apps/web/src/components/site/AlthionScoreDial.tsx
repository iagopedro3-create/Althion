'use client';

import { useState } from 'react';

interface ScoreDimension {
  title: string;
  score: number;
  description: string;
  problem: string;
  recommendation: string;
  badge: 'success' | 'warning' | 'danger';
  badgeText: string;
}

const DIMENSIONS: Record<'velocidade' | 'conversao' | 'comparecimento' | 'recuperacao', ScoreDimension> = {
  velocidade: {
    title: 'Velocidade de Resposta',
    score: 64,
    description: 'Avalia o tempo de resposta aos contatos iniciados. A demora no retorno administrativo reduz drasticamente a chance de agendamento.',
    problem: 'O tempo médio atual de resposta ultrapassa 3 horas em períodos de pico de atendimento.',
    recommendation: 'Encaminhar fluxos de perguntas frequentes para a triagem administrativa automática.',
    badge: 'warning',
    badgeText: 'Atenção',
  },
  conversao: {
    title: 'Conversão em Agendamento',
    score: 72,
    description: 'Analisa a porcentagem de contatos qualificados que manifestam interesse em agendar e concluem o processo.',
    problem: 'Muitos contatos interessados são abandonados após a primeira cotação de horários.',
    recommendation: 'Utilizar lembretes automáticos e ofertas ativas de encaixes disponíveis na agenda.',
    badge: 'success',
    badgeText: 'Saudável',
  },
  comparecimento: {
    title: 'Taxa de Comparecimento',
    score: 82,
    description: 'Mede o índice de ausências e cancelamentos de última hora sem a devida realocação de horários.',
    problem: 'As confirmações são coletadas tardiamente, inviabilizando encaixes rápidos.',
    recommendation: 'Disparar mensagens de confirmação integradas via WhatsApp com 48h de antecedência.',
    badge: 'success',
    badgeText: 'Saudável',
  },
  recuperacao: {
    title: 'Recuperação de Oportunidades',
    score: 45,
    description: 'Mede a capacidade de identificar leads frios e cancelamentos recentes e convertê-los de volta à agenda.',
    problem: 'Os cancelamentos diários viram vagas vazias sem tentativa estruturada de contato.',
    recommendation: 'Ativar o acionamento imediato da lista de espera pré-cadastrada.',
    badge: 'danger',
    badgeText: 'Atenção Crítica',
  },
};

export function AlthionScoreDial() {
  const [selected, setSelected] = useState<keyof typeof DIMENSIONS>('velocidade');
  const current = DIMENSIONS[selected] ?? DIMENSIONS.velocidade;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '40px',
        alignItems: 'center',
        background: '#FFFFFF',
        border: '1px solid rgba(16, 32, 27, 0.08)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Visual Dial Column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#52635D', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '24px' }}>
          Althion Score — Exemplo de Diagnóstico
        </span>

        <div style={{ position: 'relative', width: '200px', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden' }}>
          <svg width="200" height="200" style={{ position: 'absolute', bottom: 0 }}>
            {/* Background Arc */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#F5F7F3"
              strokeWidth="12"
              strokeDasharray="251 251"
              strokeDashoffset="251"
              transform="rotate(-180 100 100)"
            />
            {/* Active Arc */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={current.badge === 'danger' ? '#F47E6B' : current.badge === 'warning' ? '#F5A26F' : '#18A987'}
              strokeWidth="12"
              strokeDasharray="251 251"
              strokeDashoffset={251 - (251 * (current.score / 100))}
              transform="rotate(-180 100 100)"
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease' }}
            />
          </svg>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '10px' }}>
            <span style={{ fontSize: '3.2rem', fontWeight: '800', lineHeight: '1', color: '#10201B' }}>
              {current.score}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#52635D', fontWeight: '600' }}>pontos</span>
          </div>
        </div>

        <span
          className={`badge ${current.badge}`}
          style={{ marginTop: '20px', fontSize: '0.75rem' }}
        >
          {current.badgeText}
        </span>
      </div>

      {/* Details Column */}
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
          {(Object.keys(DIMENSIONS) as Array<keyof typeof DIMENSIONS>).map((key) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              style={{
                background: selected === key ? '#10201B' : '#FFFFFF',
                color: selected === key ? '#FFFFFF' : '#10201B',
                border: '1px solid rgba(16, 32, 27, 0.08)',
                padding: '10px 18px',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              type="button"
            >
              {DIMENSIONS[key].title.split(' ')[0]}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '700', color: '#10201B' }}>
              {current.title}
            </h4>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#52635D', lineHeight: '1.6' }}>
              {current.description}
            </p>
          </div>

          <div style={{ padding: '14px 18px', background: '#FFF7F6', borderLeft: '4px solid #F47E6B', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#F47E6B', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '0.05em' }}>
              Gargalo Identificado
            </span>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#10201B', lineHeight: '1.5' }}>
              {current.problem}
            </p>
          </div>

          <div style={{ padding: '14px 18px', background: '#F4FAF7', borderLeft: '4px solid #18A987', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#18A987', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '0.05em' }}>
              Próxima Ação Sugerida
            </span>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#10201B', lineHeight: '1.5' }}>
              {current.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
