import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="home-shell">
      <nav className="public-nav" aria-label="Navegação principal">
        <Link className="brand" href="/">
          <span className="brand-mark">A</span>
          <span>Althion</span>
        </Link>
        <Link className="quiet-button" href="/entrar">
          Acessar plataforma
        </Link>
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">Recuperação e Performance da Agenda</p>
          <h1>Transforme oportunidades em consultas realizadas.</h1>
          <p className="hero-copy">
            Uma infraestrutura inteligente que conecta atendimento, leads, agenda, relacionamento e
            dados para identificar perdas, orientar ações e demonstrar impacto.
          </p>
          <div className="hero-actions">
            <Link className="primary-link" href="/entrar">
              Entrar no ambiente
            </Link>
            <span>IA para velocidade. Especialistas para confiança.</span>
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
    </main>
  );
}
