import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  description: 'Formulário público do Radar administrativo da Althion.',
  title: 'Radar público',
};

// O formulário público do Radar faz parte do site (decisão aprovada), mas é o último item a ir
// ao ar: coleta dados de terceiros e exige base legal específica, rate limit, antiabuso e
// segregação. Até esse gate, esta rota é um marcador — não coleta nada.
export default function RadarPublicoPage() {
  return (
    <main className="site-main narrow">
      <section className="site-page-header">
        <p className="eyebrow">Radar público</p>
        <h1>Um diagnóstico inicial da sua agenda.</h1>
        <p className="lead-copy">
          O Radar público permitirá um primeiro diagnóstico administrativo a partir de indicadores
          informados por você.
        </p>
      </section>
      <section className="site-note-card" role="note">
        <p>
          <strong>Ainda não disponível.</strong> Por coletar dados de terceiros, o Radar público só
          será publicado com base legal específica, consentimento, limite de uso e segregação de
          dados aprovados.{' '}
          <span className="marker">
            [FORMULÁRIO PÚBLICO DO RADAR A LIBERAR — JURÍDICO E ANTIABUSO]
          </span>
        </p>
        <p>
          Enquanto isso, você pode <Link href="/contato">agendar uma conversa de diagnóstico</Link>.
        </p>
      </section>
    </main>
  );
}
