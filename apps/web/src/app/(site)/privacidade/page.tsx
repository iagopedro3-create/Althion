import type { Metadata } from 'next';

export const metadata: Metadata = {
  description: 'Política de privacidade da Althion.',
  title: 'Política de privacidade',
};

export default function PrivacidadePage() {
  return (
    <main className="site-main narrow">
      <section className="site-page-header">
        <p className="eyebrow">Privacidade</p>
        <h1>Política de privacidade.</h1>
      </section>
      <section className="site-note-card" role="note">
        <p>
          O texto da política de privacidade — bases legais LGPD, dados coletados, retenção,
          descarte, direitos do titular e encarregado (DPO) — está em preparação com a assessoria
          jurídica e será publicado antes de qualquer coleta real de dados.{' '}
          <span className="marker">[POLÍTICA DE PRIVACIDADE A APROVAR — JURÍDICO]</span>
        </p>
      </section>
    </main>
  );
}
