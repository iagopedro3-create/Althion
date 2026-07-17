import type { Metadata } from 'next';
import Link from 'next/link';

import { HeroInteractiveFlow } from '@/components/site/HeroInteractiveFlow';
import { AlthionScoreDial } from '@/components/site/AlthionScoreDial';
import { RecoveryOpportunityFila } from '@/components/site/RecoveryOpportunityFila';
import { CapacityCalor } from '@/components/site/CapacityCalor';
import { FAQAccordions } from '@/components/site/FAQAccordions';

export const metadata: Metadata = {
  description:
    'Infraestrutura administrativa inteligente para clínicas de saúde. A Althion conecta IA, automações, agenda e Especialistas de Relacionamento para recuperar consultas ociosas e aumentar a previsibilidade operacional.',
  title: 'Althion | Recuperação e Performance da Agenda para Clínicas',
};

export default function SiteHome() {
  return (
    <main className="site-main">
      {/* 1. Header & Hero Section */}
      <section className="hero" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', padding: '100px 0 80px 0' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
            Recuperação e Performance da Agenda
          </p>
          <h1 style={{ fontSize: '3.2rem', lineHeight: '1.15', margin: '20px 0', fontWeight: 'bold', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Transforme oportunidades perdidas em consultas realizadas.
          </h1>
          <p className="hero-copy" style={{ fontSize: '1.2rem', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '36px' }}>
            A Althion conecta inteligência artificial, automações integradas ao WhatsApp, CRM, agenda e um Especialista de Relacionamento para mapear gargalos e preencher horários ociosos de forma previsível e segura.
          </p>
          <div className="hero-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link className="primary-link" href="/diagnostico" style={{ background: 'var(--primary)', color: '#fff', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '1.05rem', transition: 'all 0.2s ease' }}>
              Solicitar Diagnóstico
            </Link>
            <Link href="/produto" style={{ color: 'var(--text)', fontWeight: '600', textDecoration: 'none', fontSize: '1.05rem' }}>
              Ver como funciona →
            </Link>
          </div>
          <small style={{ display: 'block', marginTop: '16px', color: 'var(--muted)', fontSize: '0.85rem' }}>
            🔒 Diagnóstico inicial da operação. Sem compromisso comercial.
          </small>
        </div>

        <div>
          <HeroInteractiveFlow />
        </div>
      </section>

      {/* 2. Faixa de Conexão */}
      <section style={{ padding: '32px', background: 'rgba(30, 58, 138, 0.03)', border: '1px solid var(--line)', borderRadius: '16px', margin: '40px 0 80px 0', textAlign: 'center' }}>
        <p style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' }}>
          Sua clínica não precisa apenas de mais leads. Precisa aproveitar melhor as oportunidades que já chegam.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }}>
          <span>Contato</span>
          <span>→</span>
          <span>Atendimento</span>
          <span>→</span>
          <span>Agendamento</span>
          <span>→</span>
          <span>Confirmação</span>
          <span>→</span>
          <span style={{ color: 'var(--success)' }}>Comparecimento Concluído</span>
        </div>
      </section>

      {/* 3. Seção do Problema (O Custo da Ociosidade) */}
      <section className="site-section" aria-labelledby="problem-title" style={{ padding: '80px 0', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>O Custo da Ociosidade</p>
          <h2 id="problem-title" style={{ fontSize: '2.5rem', margin: '16px 0', fontWeight: 'bold' }}>
            A maior parte das perdas acontece entre uma etapa e outra da recepção.
          </h2>
          <p className="lead-copy" style={{ fontSize: '1.15rem', color: 'var(--muted)', lineHeight: '1.6' }}>
            Mesmo com marketing ativo, as clínicas sofrem com perdas operacionais silenciosas que comprometem o faturamento por dependerem de processos manuais ou da memória da equipe.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ padding: '28px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '16px' }}>⏳</span>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', fontWeight: '600' }}>Tempo de Resposta Alto</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Novos contatos qualificados chegam via redes sociais ou WhatsApp, mas a recepção ocupada demora horas para dar retorno. A lead esfria e agenda com outra clínica.
            </p>
          </div>
          <div style={{ padding: '28px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '16px' }}>📭</span>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', fontWeight: '600' }}>Cancelamentos Ociosos</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Quando um paciente desmarca em cima da hora, a vaga permanece vazia por falta de ferramentas ágeis para contatar a lista de espera ou propor horários de encaixe imediatamente.
            </p>
          </div>
          <div style={{ padding: '28px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '16px' }}>🔄</span>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', fontWeight: '600' }}>Falta de Acompanhamento</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Pacientes que realizaram procedimentos ou consultas de rotina concluem o primeiro ciclo, mas são esquecidos sem um fluxo planejado para retornos periódicos de manutenção.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Althion Radar & Score */}
      <section className="site-section" aria-labelledby="radar-title" style={{ padding: '80px 0', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>Auditoria Operacional</p>
          <h2 id="radar-title" style={{ fontSize: '2.5rem', margin: '16px 0', fontWeight: 'bold' }}>
            Descubra onde sua clínica está perdendo oportunidades.
          </h2>
          <p className="lead-copy" style={{ fontSize: '1.15rem', color: 'var(--muted)', lineHeight: '1.6' }}>
            O Althion Radar mapeia os principais indicadores da agenda e do CRM, avaliando pontos críticos da jornada de atendimento e gerando o **Althion Score** da clínica.
          </p>
        </div>

        <AlthionScoreDial />
      </section>

      {/* 5. Recovery Engine */}
      <section className="site-section" aria-labelledby="recovery-title" style={{ padding: '80px 0', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>Automação Determinística</p>
          <h2 id="recovery-title" style={{ fontSize: '2.5rem', margin: '16px 0', fontWeight: 'bold' }}>
            A Althion não apenas registra perdas. Ela ajuda a agir sobre elas.
          </h2>
          <p className="lead-copy" style={{ fontSize: '1.15rem', color: 'var(--muted)', lineHeight: '1.6' }}>
            Nossas regras determinísticas monitoram incidentes operacionais de agenda vazia e disparam ações ágeis de reengajamento com pacientes.
          </p>
        </div>

        <RecoveryOpportunityFila />
      </section>

      {/* 6. Capacity Engine */}
      <section className="site-section" aria-labelledby="capacity-title" style={{ padding: '80px 0', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>Inteligência de Capacidade</p>
          <h2 id="capacity-title" style={{ fontSize: '2.5rem', margin: '16px 0', fontWeight: 'bold' }}>
            A agenda mostra o espaço. A Althion ajuda a decidir o que fazer.
          </h2>
          <p className="lead-copy" style={{ fontSize: '1.15rem', color: 'var(--muted)', lineHeight: '1.6' }}>
            Conectamos a capacidade ociosa futura de profissionais médicos com a lista de espera compatível e leads do CRM para equilibrar oferta e demanda.
          </p>
        </div>

        <CapacityCalor />
      </section>

      {/* 7. Especialista de Relacionamento */}
      <section className="site-section" aria-labelledby="specialist-title" style={{ padding: '80px 0', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>Acompanhamento Humano</p>
            <h2 id="specialist-title" style={{ fontSize: '2.5rem', margin: '16px 0', fontWeight: 'bold' }}>
              Sua clínica terá tecnologia. E também uma pessoa responsável pela operação.
            </h2>
            <p className="lead-copy" style={{ color: 'var(--muted)', lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '24px' }}>
              Você não precisará lidar com robôs frios ou atendentes de suporte genéricos. Cada clínica conta com um **Especialista de Relacionamento** dedicado da Althion, encarregado de calibrar regras, propor planos de melhoria operacionais e treinar seu time de recepção.
            </p>
            <blockquote style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '16px', margin: '20px 0', fontStyle: 'italic', color: 'var(--muted)' }}>
              "IA para velocidade. Especialistas para confiança. Processos para escala. Dados para performance."
            </blockquote>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px', padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 'bold' }}>Responsabilidades do Especialista</h3>
            <ul style={{ paddingLeft: '20px', display: 'grid', gap: '12px', fontSize: '0.95rem', color: 'var(--text)' }}>
              <li>Auditar e ajustar as respostas e automações da IA da clínica.</li>
              <li>Apresentar relatórios mensais detalhando o funil de agendamento e ROI.</li>
              <li>Montar o plano de melhoria operacional baseado nos gargalos apontados pelo Score.</li>
              <li>Garantir a integridade jurídica e o respeito ao sigilo médico da clínica.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section className="site-section" aria-labelledby="faq-title" style={{ padding: '80px 0', borderTop: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>Dúvidas Frequentes</p>
          <h2 id="faq-title" style={{ fontSize: '2.5rem', margin: '12px 0', fontWeight: 'bold' }}>Perguntas e Respostas</h2>
          <p className="lead-copy" style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
            Saiba mais sobre a implantação, a segurança dos dados e o funcionamento técnico da Althion.
          </p>
        </div>

        <FAQAccordions />
      </section>

      {/* 9. CTA Final */}
      <section className="site-cta" aria-labelledby="cta-final-title" style={{ padding: '100px 0', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '24px', textAlign: 'center', margin: '60px 0' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diagnóstico Althion</p>
          <h2 id="cta-final-title" style={{ fontSize: '2.8rem', margin: '20px 0', fontWeight: 'bold', letterSpacing: '-0.01em' }}>
            Descubra onde sua clínica está perdendo oportunidades.
          </h2>
          <p className="lead-copy" style={{ fontSize: '1.2rem', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '36px' }}>
            Solicite uma análise preliminar da jornada de atendimento, conversão e aproveitamento de agenda da sua clínica de saúde com um especialista.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Link className="primary-link" href="/diagnostico" style={{ background: 'var(--primary)', color: '#fff', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '1.1rem' }}>
              Solicitar Diagnóstico
            </Link>
            <Link className="quiet-button" href="/contato" style={{ border: '1px solid var(--line)', padding: '14px 28px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none', fontSize: '1.1rem', background: '#fff' }}>
              Falar com a Althion
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
