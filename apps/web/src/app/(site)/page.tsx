import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  description:
    'Infraestrutura administrativa para clínicas particulares. Identifique perdas silenciosas na agenda, automatize a recuperação de pacientes e aumente a eficiência operacional — com segurança e conformidade à LGPD.',
  title: 'Althion | Recuperação e Performance de Agenda para Clínicas',
};

export default function SiteHome() {
  return (
    <main className="site-main">
      {/* 1. Hero Section */}
      <section className="hero" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', padding: '80px 0' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Performance Administrativa para Clínicas
          </p>
          <h1 style={{ fontSize: '3rem', lineHeight: '1.2', margin: '16px 0', fontWeight: 'bold' }}>
            Recupere horários ociosos e transforme leads em consultas realizadas.
          </h1>
          <p className="hero-copy" style={{ fontSize: '1.15rem', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '32px' }}>
            A Althion integra seu CRM, canais de atendimento e agenda para monitorar gargalos operacionais em tempo real. Identificamos onde sua clínica perde oportunidades, orientamos a equipe e automatizamos a recuperação de pacientes ociosos — sem interferir na decisão médica.
          </p>
          <div className="hero-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link className="primary-link" href="/contato" style={{ background: 'var(--primary)', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>
              Agendar um Diagnóstico
            </Link>
            <Link href="/produto" style={{ color: 'var(--text)', fontWeight: '600', textDecoration: 'none' }}>
              Ver como funciona →
            </Link>
          </div>
        </div>

        <aside className="foundation-panel" aria-label="Princípios da plataforma" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '32px', borderRadius: '16px' }}>
          <div className="panel-signal" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: 'var(--success)', marginBottom: '20px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }} />
            Fundação Segura e Homologada
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '16px' }}>
            <li style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <strong>Isolamento Multitenant Absoluto</strong>
              <small style={{ color: 'var(--muted)' }}>Banco de dados estruturado para garantir que as informações da sua clínica estejam blindadas e isoladas.</small>
            </li>
            <li style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <strong>Decisões 100% Explicáveis</strong>
              <small style={{ color: 'var(--muted)' }}>Nenhum algoritmo "caixa-preta". Todas as métricas de performance e recomendações trazem justificativas claras e auditáveis.</small>
            </li>
            <li style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <strong>Zero Interferência Clínica</strong>
              <small style={{ color: 'var(--muted)' }}>Atuamos exclusivamente na jornada administrativa. Não tocamos em diagnósticos, prescrições ou prontuários.</small>
            </li>
            <li style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <strong>Integração via CRM (Helena)</strong>
              <small style={{ color: 'var(--muted)' }}>Substituição modular e transparente com o CRM Helena para sincronizar leads e contatos sem fricção.</small>
            </li>
          </ul>
        </aside>
      </section>

      {/* 2. O Problema Section */}
      <section className="site-section" aria-labelledby="problem-title" style={{ padding: '72px 0', borderTop: '1px solid var(--line)' }}>
        <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>O Custo da Ociosidade</p>
        <h2 id="problem-title" style={{ fontSize: '2.2rem', margin: '16px 0', fontWeight: 'bold' }}>
          Onde a sua clínica perde receita todos os dias de forma silenciosa?
        </h2>
        <p className="lead-copy" style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '800px', marginBottom: '40px' }}>
          Muitas clínicas investem milhares de reais em marketing para atrair novos pacientes, mas sofrem com falhas no fluxo administrativo que destroem o retorno financeiro.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontWeight: '600' }}>1. Leads sem Resposta</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Contatos de potenciais pacientes chegam via redes sociais ou WhatsApp, mas demoram horas (ou dias) para receber um retorno da recepção. A maior parte desiste ou agenda com o concorrente.
            </p>
          </div>
          <div style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontWeight: '600' }}>2. Desistências de Última Hora</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Pacientes cancelam de véspera ou simplesmente faltam à consulta (no-show). O horário fica vago e a equipe não possui tempo ou ferramentas ágeis para encaixar outra pessoa da fila de espera.
            </p>
          </div>
          <div style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', fontWeight: '600' }}>3. Pacientes Esquecidos (Inatividade)</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Pacientes que realizaram procedimentos estéticos ou consultas de rotina concluem o tratamento, mas nunca mais são contatados para retorno ou manutenção preventiva periódica.
            </p>
          </div>
        </div>
      </section>

      {/* 3. A Solução (Os 5 Pilares) */}
      <section className="site-section" aria-labelledby="pilares-title" style={{ padding: '72px 0', borderTop: '1px solid var(--line)' }}>
        <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>O Método Althion</p>
        <h2 id="pilares-title" style={{ fontSize: '2.2rem', margin: '16px 0', fontWeight: 'bold' }}>
          Uma infraestrutura de performance em 5 pilares complementares.
        </h2>
        <p className="lead-copy" style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: '800px', marginBottom: '48px' }}>
          Ao invés de planilhas complexas e processos manuais de cobrança, a Althion cria uma trilha automatizada e auditável de ponta a ponta.
        </p>

        <div className="site-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <article className="site-card" style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '600' }}>Pilar 1</span>
            <h3 style={{ margin: '8px 0 12px', fontSize: '1.3rem', fontWeight: '700' }}>Radar</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Varre sua agenda e o CRM em busca de vazamentos de receita (leads frios, no-shows sem remarcação e janelas ociosas).
            </p>
          </article>

          <article className="site-card" style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '600' }}>Pilar 2</span>
            <h3 style={{ margin: '8px 0 12px', fontSize: '1.3rem', fontWeight: '700' }}>Score</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Mede a saúde operacional da sua clínica em uma nota consolidada baseada em dados reais e fórmulas matemáticas versionadas.
            </p>
          </article>

          <article className="site-card" style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '600' }}>Pilar 3</span>
            <h3 style={{ margin: '8px 0 12px', fontSize: '1.3rem', fontWeight: '700' }}>Portal</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Dashboard completo para gestores e proprietários visualizarem o funil de atração, conversões e os planos de melhoria sugeridos.
            </p>
          </article>

          <article className="site-card" style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '600' }}>Pilar 4</span>
            <h3 style={{ margin: '8px 0 12px', fontSize: '1.3rem', fontWeight: '700' }}>Especialista</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Sua clínica conta com um especialista em relacionamento humano dedicado para apoiar o treinamento da equipe e calibrar a ferramenta.
            </p>
          </article>

          <article className="site-card" style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '600' }}>Pilar 5</span>
            <h3 style={{ margin: '8px 0 12px', fontSize: '1.3rem', fontWeight: '700' }}>Recovery</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Dispara contatos de reengajamento automatizados para pacientes baseando-se em regras determinísticas e consentidas.
            </p>
          </article>
        </div>

        <p className="site-note" style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--muted)' }}>
          * O nível de desenvolvimento e disponibilidade operacional de cada pilar da Althion está detalhado em nossa página de <Link href="/produto" style={{ color: 'var(--primary)' }}>Produto</Link>.
        </p>
      </section>

      {/* 4. Segurança e Privacidade por Design */}
      <section className="site-section" aria-labelledby="security-title" style={{ padding: '72px 0', borderTop: '1px solid var(--line)', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>Segurança & LGPD</p>
            <h2 id="security-title" style={{ fontSize: '2.2rem', margin: '16px 0', fontWeight: 'bold' }}>
              Privacidade em primeiro lugar. RLS e barreiras de acesso clínico.
            </h2>
            <p className="lead-copy" style={{ color: 'var(--muted)', lineHeight: '1.6', fontSize: '1.05rem', marginBottom: '24px' }}>
              Garantir a conformidade legal e o sigilo de dados é um compromisso da nossa fundação tecnológica. Desenvolvemos o sistema respeitando o sigilo médico e as normas éticas.
            </p>
            <Link className="primary-link" href="/seguranca" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
              Leia nossa política de segurança →
            </Link>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px' }}>
              <strong>🔒 RLS (Row Level Security) Multi-Inquilino</strong>
              <p style={{ margin: '6px 0 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                Os dados financeiros e de performance de anúncios de cada inquilino são separados no nível do banco de dados, impedindo acessos cruzados.
              </p>
            </div>
            <div style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px' }}>
              <strong>🛡️ Barreiras de Acesso para Conteúdo Médico</strong>
              <p style={{ margin: '6px 0 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                Somente profissionais médicos autenticados e autorizados podem acessar flags clínicos contendo informações de saúde de pacientes. Gestores administrativos visualizam apenas números consolidados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section aria-labelledby="cta-title" className="site-cta" style={{ textAlign: 'center', padding: '80px 0', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>Dê o primeiro passo</p>
          <h2 id="cta-title" style={{ fontSize: '2.5rem', margin: '16px 0', fontWeight: 'bold' }}>
            Vamos mapear as perdas administrativas da sua clínica?
          </h2>
          <p className="lead-copy" style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '32px' }}>
            Agende uma conversa inicial para entender se o método Althion faz sentido para a estrutura atual da sua clínica médica. É rápido, consultivo e sem compromisso comercial.
          </p>
          <Link className="primary-link" href="/contato" style={{ background: 'var(--primary)', color: '#fff', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '1.1rem' }}>
            Agendar Conversa de Diagnóstico
          </Link>
        </div>
      </section>
    </main>
  );
}
