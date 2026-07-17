'use client';

import { useEffect, useState } from 'react';

type FlowStep = 'incoming' | 'parse' | 'funnel' | 'alerts' | 'recovered';

export function HeroInteractiveFlow() {
  const [step, setStep] = useState<FlowStep>('incoming');

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev === 'incoming') return 'parse';
        if (prev === 'parse') return 'funnel';
        if (prev === 'funnel') return 'alerts';
        if (prev === 'alerts') return 'recovered';
        return 'incoming';
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: '16px',
        padding: '24px',
        height: '100%',
        minHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: '600', textTransform: 'uppercase' }}>
          Visualização do Fluxo Althion
        </span>
        <span
          className="badge"
          style={{
            background: step === 'recovered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 58, 138, 0.1)',
            color: step === 'recovered' ? 'var(--success)' : 'var(--primary)',
          }}
        >
          {step === 'incoming' && 'Novo contato'}
          {step === 'parse' && 'Análise de IA'}
          {step === 'funnel' && 'Funil atualizado'}
          {step === 'alerts' && 'Ação inteligente'}
          {step === 'recovered' && 'Agenda recuperada!'}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px', margin: '20px 0' }}>
        {/* Step 1: Incoming Patient Msg */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '12px 16px',
            transform: `translateY(${step === 'incoming' ? '0' : '-8px'})`,
            opacity: step === 'incoming' ? 1 : 0.6,
            transition: 'all 0.4s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <strong style={{ fontSize: '0.9rem' }}>💬 Paciente via WhatsApp</strong>
            <small style={{ color: 'var(--muted)' }}>Agora mesmo</small>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)' }}>
            "Queria remarcar minha consulta de implante para terça à tarde..."
          </p>
        </div>

        {/* Step 2: AI Parsing & Intent */}
        <div
          style={{
            background: 'rgba(30, 58, 138, 0.05)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '12px 16px',
            transform: `translateY(${step === 'parse' ? '0' : '-8px'})`,
            opacity: step === 'parse' ? 1 : 0.4,
            transition: 'all 0.4s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>🤖 Inteligência Artificial (Triagem)</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Confiança 98%</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--muted)' }}>
            <li>Intenção detectada: **Reagendamento**</li>
            <li>Procedimento: **Implante Dentário**</li>
            <li>Ação recomendada: **Consultar vagas na terça**</li>
          </ul>
        </div>

        {/* Step 3: CRM Funnel & Agenda Check */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '12px 16px',
            transform: `translateY(${step === 'funnel' ? '0' : '-8px'})`,
            opacity: step === 'funnel' ? 1 : 0.4,
            transition: 'all 0.4s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <strong style={{ fontSize: '0.9rem' }}>📅 Agenda & Oportunidades</strong>
            <small style={{ color: 'var(--muted)' }}>Integrado</small>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text)' }}>
            Vaga identificada: **Terça-feira às 14:30**. Oportunidade movida para **Negociação de Horário**.
          </p>
        </div>

        {/* Step 4: Alerts & Human specialist */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            transform: `translateY(${step === 'alerts' ? '0' : '-8px'})`,
            opacity: step === 'alerts' ? 1 : 0.4,
            transition: 'all 0.4s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <strong style={{ fontSize: '0.9rem', color: 'var(--danger)' }}>👤 Especialista & Alertas</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>Alta Prioridade</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
            Paciente confirmou interesse. Especialista de Relacionamento notificado para validação da prioridade médica.
          </p>
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Passo {step === 'incoming' && '1'} {step === 'parse' && '2'} {step === 'funnel' && '3'} {step === 'alerts' && '4'} {step === 'recovered' && '5'} de 5</span>
        <span>Acompanhamento integrado</span>
      </div>
    </div>
  );
}
