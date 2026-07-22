'use client';

import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    q: 'O que é a Althion?',
    a: 'A Althion é uma infraestrutura de relacionamento, recuperação e performance da agenda desenvolvida especificamente para clínicas médicas e odontológicas particulares. Nós monitoramos o fluxo de atendimento, sugerimos planos de melhoria operacionais e reocupamos horários ociosos da agenda.',
  },
  {
    q: 'A Althion é apenas um CRM?',
    a: 'Não. Nós não substituímos o CRM ou o sistema de agendamento que sua clínica já utiliza. A Althion se conecta via integração a essas ferramentas para orquestrar as automações administrativas e identificar leads e oportunidades ociosas que ficam perdidas no dia a dia.',
  },
  {
    q: 'A Althion substitui a equipe da clínica?',
    a: 'Não. A Althion foi desenhada para apoiar a recepção. A plataforma remove tarefas burocráticas repetitivas (como a checagem manual de fila de espera ou lembretes iniciais de retorno), permitindo que a sua equipe foque no atendimento de casos complexos e acolhimento presencial.',
  },
  {
    q: 'Cada cliente possui um Especialista de Relacionamento?',
    a: 'Sim. Todo cliente Althion conta com o acompanhamento de um Especialista de Relacionamento dedicado da nossa equipe. Esse profissional conhece a rotina da sua clínica, analisa os relatórios mensais e auxilia no treinamento operacional da recepção.',
  },
  {
    q: 'A IA fala diretamente com os pacientes?',
    a: 'A IA interage com pacientes unicamente em tarefas administrativas pré-definidas (como tirar dúvidas sobre localização, horários disponíveis e formas de pagamento). Assuntos complexos, reclamações ou dúvidas de caráter clínico são identificados e direcionados imediatamente para a equipe humana da clínica.',
  },
  {
    q: 'A Althion realiza orientações médicas?',
    a: 'Não. A Althion atua exclusivamente na jornada administrativa de suporte à agenda. A plataforma não emite diagnósticos, prescrições, triagens médicas ou qualquer modalidade de orientação clínica.',
  },
  {
    q: 'Como funciona a implantação?',
    a: 'Nossa implantação é dividida em etapas (Diagnóstico, Mapeamento, Configuração, Validação, Ativação e Acompanhamento). Nós nos adaptamos aos seus sistemas atuais para iniciar a operação sem gerar atritos na rotina da clínica.',
  },
];

export function FAQAccordions() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div
      style={{ display: 'grid', gap: '16px', width: '100%', maxWidth: '720px', margin: '0 auto' }}
    >
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={item.q}
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(16, 32, 27, 0.06)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)',
              transition: 'all 0.2s ease',
            }}
          >
            <button
              aria-expanded={isOpen}
              onClick={() => toggle(idx)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '24px 28px',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: '700',
                fontSize: '1.05rem',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
              type="button"
            >
              <span>{item.q}</span>
              <span
                style={{
                  fontSize: '1.2rem',
                  color: 'var(--muted)',
                  transform: isOpen ? 'rotate(45deg)' : 'none',
                  transition: 'transform 0.2s ease',
                  display: 'inline-block',
                  lineHeight: 1,
                }}
              >
                +
              </span>
            </button>

            {isOpen ? (
              <div
                style={{
                  padding: '0 28px 24px 28px',
                  color: 'var(--muted)',
                  fontSize: '0.95rem',
                  lineHeight: '1.65',
                  borderTop: '1px solid rgba(16, 32, 27, 0.04)',
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
