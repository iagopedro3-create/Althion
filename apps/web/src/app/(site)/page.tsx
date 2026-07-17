import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  description:
    'Infraestrutura administrativa que identifica perdas na agenda de clínicas, orienta ações e demonstra impacto — sem tocar no domínio clínico.',
  title: 'Recuperação e Performance da Agenda para clínicas',
};

// Copy fundamentada em docs/product/vision.md (posicionamento aprovado do produto).
// Nenhuma prova, número de resultado ou depoimento é exibido sem lastro: usar marcadores.
const PILLARS = [
  {
    body: 'Diagnostica onde a clínica perde oportunidades e recomenda um plano inicial.',
    title: 'Radar',
  },
  {
    body: 'Mede a eficiência operacional com fórmula versionada, explicável e cobertura de dados.',
    title: 'Score',
  },
  {
    body: 'Transforma indicadores em problemas, oportunidades e próximas ações.',
    title: 'Portal',
  },
  {
    body: 'Dá contexto, capacidade e governança à gestão da carteira de contas.',
    title: 'Especialista',
  },
  {
    body: 'Identifica perdas com regras determinísticas, auditáveis e consentidas.',
    title: 'Recovery',
  },
] as const;

export default function SiteHome() {
  return (
    <main className="site-main">
      <section className="hero">
        <div>
          <p className="eyebrow">Recuperação e Performance da Agenda</p>
          <h1>Transforme oportunidades administrativas em consultas realizadas.</h1>
          <p className="hero-copy">
            A Althion conecta atendimento, leads, agenda, relacionamento e dados para identificar
            onde a clínica perde oportunidades, orientar ações e demonstrar o impacto em cada etapa
            — sempre na jornada administrativa, nunca na decisão clínica.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/contato">
              Agendar um diagnóstico
            </Link>
            <Link href="/produto">Ver como funciona</Link>
          </div>
        </div>
        <aside className="foundation-panel" aria-label="Princípios da plataforma">
          <div className="panel-signal">
            <span />
            Fundação segura
          </div>
          <ul>
            <li>Isolamento por organização</li>
            <li>Decisões administrativas explicáveis</li>
            <li>Helena como provedor substituível</li>
            <li>Nenhuma orientação clínica</li>
          </ul>
        </aside>
      </section>

      <section aria-labelledby="pilares-title" className="site-section">
        <p className="eyebrow">Como funciona</p>
        <h2 id="pilares-title">Da perda identificada à ação com resultado conhecido.</h2>
        <p className="lead-copy">
          Cada pilar mostra perda, ação e impacto — não apenas métricas passivas. O que é fato,
          cálculo e estimativa aparece de forma distinta, e recomendações sempre trazem sua
          explicação.
        </p>
        <div className="site-card-grid">
          {PILLARS.map((pillar) => (
            <article className="site-card" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
        <p className="site-note">
          O estágio atual de cada pilar está descrito com honestidade na página de{' '}
          <Link href="/produto">Produto</Link>.
        </p>
      </section>

      <section aria-labelledby="cta-title" className="site-cta">
        <div>
          <p className="eyebrow">Próximo passo</p>
          <h2 id="cta-title">Quer entender onde sua agenda perde oportunidades?</h2>
          <p className="lead-copy">
            Comece por uma conversa de diagnóstico. O primeiro contato serve para entender a
            operação da clínica — sem compromisso de contratação.
          </p>
        </div>
        <Link className="primary-link" href="/contato">
          Agendar um diagnóstico
        </Link>
      </section>
    </main>
  );
}
