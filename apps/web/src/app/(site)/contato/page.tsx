import type { Metadata } from 'next';

import { ContactForm } from '@/components/site/contact-form';
import { CONTACT_CHANNEL_CONFIGURED } from '@/lib/site/contact';

export const metadata: Metadata = {
  description:
    'Agende uma conversa de diagnóstico com a Althion. O primeiro contato serve para entender a operação da clínica, sem compromisso.',
  title: 'Contato',
};

export default function ContatoPage() {
  return (
    <main className="site-main narrow">
      <section className="site-page-header">
        <p className="eyebrow">Contato</p>
        <h1>Agende uma conversa de diagnóstico.</h1>
        <p className="lead-copy">
          Conte um pouco sobre a clínica e o momento atual. O primeiro contato serve para entender a
          operação — não representa compromisso de contratação.
        </p>
      </section>

      {CONTACT_CHANNEL_CONFIGURED ? null : (
        <section className="site-note-card" role="note">
          <p>
            <strong>Canal em preparação.</strong> O formulário abaixo demonstra o fluxo, mas o canal
            de contato ainda não está ativo e <strong>nenhum dado é armazenado</strong> até a marca
            e a política de privacidade serem publicadas.{' '}
            <span className="marker">[CANAL E BASE LEGAL A APROVAR]</span>
          </p>
        </section>
      )}

      <section aria-label="Formulário de contato">
        <ContactForm />
      </section>
    </main>
  );
}
