import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  description:
    'A Althion é a infraestrutura de Recuperação e Performance da Agenda para clínicas médicas particulares.',
  title: 'Sobre',
};

export default function SobrePage() {
  return (
    <main className="site-main">
      <section className="site-page-header">
        <p className="eyebrow">Sobre</p>
        <h1>Inteligência operacional para a agenda da clínica.</h1>
        <p className="lead-copy">
          A Althion conecta perda, ação, responsável e resultado em uma visão operacional
          explicável. O primeiro recorte atende clínicas médicas particulares — dermatologia,
          estética médica, oftalmologia, ginecologia particular e clínicas multidisciplinares.
        </p>
      </section>

      <section aria-label="O que a Althion é e não é" className="site-two-column">
        <article>
          <h2>O que a Althion é</h2>
          <p>
            Uma camada de inteligência operacional, governança, recuperação, capacidade, qualidade e
            mensuração sobre a operação administrativa da clínica, com acompanhamento humano
            especializado.
          </p>
        </article>
        <article>
          <h2>O que a Althion não é</h2>
          <p>
            Não é CRM genérico, agenda, chatbot, call center, secretária virtual, agência ou
            terceirização de mão de obra. Também não substitui o julgamento clínico do profissional.
          </p>
        </article>
      </section>

      <section className="site-note-card">
        <p>
          <strong>Empresa e equipe.</strong> Informações institucionais — razão social, endereço,
          time e contato oficial — serão publicadas com a identidade da marca.{' '}
          <span className="marker">[DADOS INSTITUCIONAIS E MARCA A DEFINIR]</span>
        </p>
      </section>

      <section aria-labelledby="sobre-cta" className="site-cta">
        <div>
          <p className="eyebrow">Próximo passo</p>
          <h2 id="sobre-cta">Vamos conversar sobre a sua operação?</h2>
        </div>
        <Link className="primary-link" href="/contato">
          Agendar um diagnóstico
        </Link>
      </section>
    </main>
  );
}
