import type { Metadata } from 'next';

export const metadata: Metadata = {
  description: 'Termos de uso da Althion.',
  title: 'Termos de uso',
};

export default function TermosPage() {
  return (
    <main className="site-main narrow">
      <section className="site-page-header">
        <p className="eyebrow">Termos</p>
        <h1>Termos de uso.</h1>
      </section>
      <section className="site-note-card" role="note">
        <p>
          Os termos de uso estão em preparação com a assessoria jurídica e serão publicados antes do
          lançamento do site. <span className="marker">[TERMOS DE USO A APROVAR — JURÍDICO]</span>
        </p>
      </section>
    </main>
  );
}
