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
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        background: '#0A211B',
        border: '1px solid rgba(243, 250, 247, 0.1)',
        borderRadius: '24px',
        padding: '32px',
        height: '100%',
        minHeight: '420px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(243, 250, 247, 0.08)', paddingBottom: '16px' }}>
        <span style={{ fontSize: '0.75rem', color: '#A9BBB4', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Fluxo de Jornada Administrativa
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className={`badge ${step === 'recovered' ? 'success' : 'primary'}`}
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            {step === 'incoming' && 'Novo Contato'}
            {step === 'parse' && 'Análise de Necessidade'}
            {step === 'funnel' && 'Funil Integrado'}
            {step === 'alerts' && 'Oportunidade Ativa'}
            {step === 'recovered' && 'Recuperação Concluída'}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', margin: '24px 0' }}>
        {/* Step 1: Incoming Contact */}
        <div
          style={{
            background: '#081C17',
            border: '1px solid rgba(243, 250, 247, 0.06)',
            borderRadius: '16px',
            padding: '16px 20px',
            transform: `translateY(${step === 'incoming' ? '0' : '-6px'}) scale(${step === 'incoming' ? '1' : '0.98'})`,
            opacity: step === 'incoming' ? 1 : 0.4,
            boxShadow: step === 'incoming' ? '0 10px 20px rgba(0,0,0,0.15)' : 'none',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#F3FAF7' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Mensagem de Contato
            </span>
            <small style={{ color: '#A9BBB4', fontSize: '0.75rem' }}>Agora mesmo</small>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#A9BBB4', fontStyle: 'italic', lineHeight: '1.4' }}>
            "Olá, preciso reagendar meu retorno administrativo da próxima semana."
          </p>
        </div>

        {/* Step 2: Intent Classification */}
        <div
          style={{
            background: 'rgba(41, 199, 161, 0.04)',
            border: `1px solid ${step === 'parse' ? 'rgba(41, 199, 161, 0.3)' : 'rgba(243, 250, 247, 0.06)'}`,
            borderRadius: '16px',
            padding: '16px 20px',
            transform: `translateY(${step === 'parse' ? '0' : '-6px'}) scale(${step === 'parse' ? '1' : '0.98'})`,
            opacity: step === 'parse' ? 1 : 0.3,
            boxShadow: step === 'parse' ? '0 10px 20px rgba(0,0,0,0.15)' : 'none',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#29C7A1' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              Identificação da Necessidade
            </span>
            <span style={{ fontSize: '0.75rem', color: '#29C7A1', fontWeight: '600' }}>Processado</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#A9BBB4', lineHeight: '1.4' }}>
            Ação mapeada: <strong style={{ color: '#F3FAF7' }}>Reagendamento de Consulta</strong>. Detalhes repassados à esteira de confirmações.
          </p>
        </div>

        {/* Step 3: Action & Resolution */}
        <div
          style={{
            background: '#081C17',
            border: '1px solid rgba(243, 250, 247, 0.06)',
            borderRadius: '16px',
            padding: '16px 20px',
            transform: `translateY(${step === 'recovered' ? '0' : '-6px'}) scale(${step === 'recovered' ? '1' : '0.98'})`,
            opacity: step === 'recovered' ? 1 : 0.3,
            boxShadow: step === 'recovered' ? '0 10px 20px rgba(41, 199, 161, 0.1)' : 'none',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#F3FAF7' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Oportunidade Recuperada
            </span>
            <small style={{ color: '#29C7A1', fontSize: '0.75rem', fontWeight: '600' }}>Fila de Espera Atualizada</small>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#A9BBB4', lineHeight: '1.4' }}>
            Vaga liberada foi realocada para paciente **M. C.** da fila de espera. Novo agendamento confirmado no Portal.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(243, 250, 247, 0.08)', paddingTop: '16px', fontSize: '0.75rem', color: '#A9BBB4' }}>
        <span>Etapa {step === 'incoming' ? '1' : step === 'parse' ? '2' : step === 'funnel' ? '3' : step === 'alerts' ? '4' : '5'} de 5</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['incoming', 'parse', 'funnel', 'alerts', 'recovered'] as const).map((s) => (
            <span
              key={s}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: step === s ? '#29C7A1' : 'rgba(243, 250, 247, 0.2)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
