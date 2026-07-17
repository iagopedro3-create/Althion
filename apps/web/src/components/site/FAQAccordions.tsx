'use client';

import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    q: 'O que é a Althion?',
    a: 'A Althion é uma infraestrutura inteligente de recuperação, relacionamento e performance da agenda para clínicas de saúde. Nós integramos atendimento, CRM e agenda para mapear onde a clínica perde leads ou consultas e tomamos ações para recuperá-los de forma automatizada e acompanhada por especialistas humanos.',
  },
  {
    q: 'A Althion é um CRM?',
    a: 'Não. A Althion não substitui o CRM da clínica (por exemplo, o CRM Helena). Nós nos conectamos aos sistemas existentes da clínica para orquestrar as automações e identificar oportunidades paradas na agenda, gerando inteligência e processos de recuperação que CRMs comuns não realizam.',
  },
  {
    q: 'A Althion substitui a minha equipe?',
    a: 'Absolutamente não. A Althion atua como um assistente de alta velocidade que remove tarefas administrativas repetitivas (como agendamentos simples, triagens e confirmações básicas), permitindo que a sua equipe de recepção foque no atendimento caloroso e em casos complexos de handover.',
  },
  {
    q: 'Cada cliente possui um Especialista de Relacionamento?',
    a: 'Sim. Todo cliente Althion conta com um Especialista de Relacionamento dedicado da nossa equipe. Esse profissional conhece a rotina da sua clínica, analisa os relatórios mensais e ajusta as regras de automação para que o sistema funcione com a máxima eficiência e sem riscos.',
  },
  {
    q: 'A IA fala diretamente com os pacientes?',
    a: 'A IA interage com os pacientes exclusivamente em tarefas administrativas pré-autorizadas (como responder localização, horários disponíveis, valores particulares autorizados e confirmações). Situações complexas, reclamações ou conversas que envolvam termos ou dúvidas clínicas são detectadas pela IA e imediatamente transferidas para uma pessoa.',
  },
  {
    q: 'A Althion realiza orientações médicas?',
    a: 'Não. A Althion atua única e exclusivamente na jornada administrativa do paciente (agendamentos, reagendamentos, confirmações de slots e cancelamentos). A plataforma nunca emite opiniões clínicas, diagnósticos, triagens médicas ou prescrições.',
  },
  {
    q: 'A Althion serve para clínicas odontológicas?',
    a: 'Sim. Possuímos um programa de acesso antecipado voltado especificamente para clínicas odontológicas particulares de médio e grande porte, focado na gestão de orçamentos pendentes, recall de pacientes e otimização de cadeiras clínicas.',
  },
];

export function FAQAccordions() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '800px', margin: '0 auto' }}>
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={item.q}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'all 0.25s ease',
            }}
          >
            <button
              aria-expanded={isOpen}
              onClick={() => toggle(idx)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '20px 24px',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: '600',
                fontSize: '1.05rem',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
              type="button"
            >
              <span>{item.q}</span>
              <span style={{ fontSize: '1.4rem', color: 'var(--muted)', transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease', display: 'inline-block', lineHeight: 1 }}>
                +
              </span>
            </button>

            {isOpen ? (
              <div
                style={{
                  padding: '0 24px 20px 24px',
                  color: 'var(--muted)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  borderTop: '1px solid var(--line)',
                  paddingTop: '16px',
                }}
              >
                {item.a}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
