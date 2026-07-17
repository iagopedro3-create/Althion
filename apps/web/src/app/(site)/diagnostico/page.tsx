import type { Metadata } from 'next';

import { ContactDiagnosisForm } from '@/components/site/ContactDiagnosisForm';

export const metadata: Metadata = {
  description:
    'Solicite um diagnóstico preliminar e gratuito da operação de atendimento e aproveitamento de agenda da sua clínica.',
  title: 'Solicitar Diagnóstico Operacional | Althion',
};

export default function DiagnosticoPage() {
  return (
    <main className="site-main narrow" style={{ padding: '80px 0' }}>
      <section className="site-page-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>Auditoria Gratuita</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '12px 0' }}>Diagnóstico Operacional da Agenda</h1>
        <p className="lead-copy" style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Responda a este breve formulário operacional para que nossa inteligência identifique vazamentos silenciosos na jornada do paciente da sua clínica.
        </p>
      </section>

      <section aria-label="Formulário do Diagnóstico">
        <ContactDiagnosisForm />
      </section>

      <section style={{ marginTop: '48px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.5' }}>
        <strong>🔒 Nota de Privacidade e Segurança (LGPD):</strong>
        <p style={{ margin: '6px 0 0 0' }}>
          As informações fornecidas são tratadas em sigilo administrativo absoluto e utilizadas unicamente para estimar gargalos de agendamento. Em conformidade com a LGPD e o sigilo médico, o formulário não solicita informações clínicas de saúde dos seus pacientes.
        </p>
      </section>
    </main>
  );
}
