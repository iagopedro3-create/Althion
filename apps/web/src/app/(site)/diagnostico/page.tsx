import type { Metadata } from 'next';

import { ContactDiagnosisForm } from '@/components/site/ContactDiagnosisForm';
import { DIAGNOSIS_CHANNEL_CONFIGURED } from '@/lib/site/diagnosis';

export const metadata: Metadata = {
  description:
    'Solicite contato com a equipe Althion. O diagnóstico é conduzido internamente após o alinhamento inicial.',
  title: 'Solicitar diagnóstico da operação | Althion',
};

export default function DiagnosticoPage() {
  return (
    <main className="diagnosis-capture-page">
      <div className="diagnosis-capture-layout">
        <section className="diagnosis-capture-intro">
          <p className="eyebrow">Diagnóstico Althion</p>
          <h1>Descubra por onde começar a recuperar oportunidades.</h1>
          <p>
            Você envia apenas o contexto inicial. A equipe Althion entra em contato, orienta a
            coleta das informações necessárias e conduz o diagnóstico internamente.
          </p>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Você envia o contexto inicial</strong>
                <p>Dados básicos sobre o perfil e o momento da clínica.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>A equipe Althion entra em contato</strong>
                <p>Alinhamos objetivos, escopo e os materiais necessários.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>A Althion conduz o diagnóstico</strong>
                <p>Nossa equipe analisa a operação e prepara os próximos passos.</p>
              </div>
            </li>
          </ol>
        </section>

        <ContactDiagnosisForm channelConfigured={DIAGNOSIS_CHANNEL_CONFIGURED} />
      </div>
    </main>
  );
}
