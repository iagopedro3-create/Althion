import type { Metadata } from 'next';
import Link from 'next/link';

import { HeroInteractiveFlow } from '@/components/site/HeroInteractiveFlow';
import { JourneyLeakStrip } from '@/components/site/JourneyLeakStrip';
import { ProblemSection } from '@/components/site/ProblemSection';
import { HowItWorksSection } from '@/components/site/HowItWorksSection';
import { AlthionScoreDial } from '@/components/site/AlthionScoreDial';
import { RecoveryOpportunityFila } from '@/components/site/RecoveryOpportunityFila';
import { CapacityCalor } from '@/components/site/CapacityCalor';
import { FAQAccordions } from '@/components/site/FAQAccordions';

export const metadata: Metadata = {
  description:
    'A Althion integra atendimento, CRM e agenda para mapear perdas operacionais, automatizar a recuperação de oportunidades e acompanhar resultados.',
  title: 'Althion | Recuperação e Performance da Agenda para Clínicas',
};

export default function SiteHome() {
  return (
    <main className="site-main">
      {/* Act 1: Hero Section (DARK THEME) */}
      <section
        aria-labelledby="hero-headline"
        className="dark-section hero-section"
        id="inicio"
      >
        <div className="site-container hero-grid">
          {/* Coluna de texto */}
          <div className="hero-text-col">
            <span className="hero-eyebrow">Performance da jornada do paciente</span>

            <h1
              className="hero-headline"
              id="hero-headline"
            >
              Converta mais dos contatos que sua clínica já recebe.
            </h1>

            <p className="hero-subheadline">
              A Althion identifica perdas entre a primeira mensagem e o comparecimento, organiza os
              próximos passos e combina inteligência artificial com acompanhamento humano para tornar
              a agenda mais previsível.
            </p>

            <div className="hero-actions">
              <Link
                className="site-cta-primary"
                href="/diagnostico"
                id="hero-cta-principal"
              >
                Solicitar diagnóstico
              </Link>
              <a
                className="hero-link-secondary"
                href="#como-funciona"
                id="hero-cta-secundario"
              >
                Ver como a Althion funciona
                <span aria-hidden="true"> &#8594;</span>
              </a>
            </div>

            <p className="hero-microcopy">Diagnóstico inicial. Sem compromisso.</p>

            <div className="hero-connections" aria-label="Integrações">
              <span className="hero-connections-label">WhatsApp</span>
              <span aria-hidden="true" className="hero-connections-sep">•</span>
              <span className="hero-connections-label">CRM</span>
              <span aria-hidden="true" className="hero-connections-sep">•</span>
              <span className="hero-connections-label">Agenda</span>
              <span aria-hidden="true" className="hero-connections-sep">•</span>
              <span className="hero-connections-label">IA</span>
              <span aria-hidden="true" className="hero-connections-sep">•</span>
              <span className="hero-connections-label">Especialista de Relacionamento</span>
            </div>
          </div>

          {/* Mockup da jornada */}
          <div className="hero-mockup-col">
            <HeroInteractiveFlow />
          </div>
        </div>
      </section>

      {/* Act 2: Faixa de Posicionamento (LIGHT THEME) */}
      <section
        aria-labelledby="positioning-heading"
        className="positioning-band"
        id="posicionamento"
      >
        <div className="site-container">
          <div className="positioning-header">
            <h2 className="positioning-headline" id="positioning-heading">
              O problema nem sempre é gerar mais demanda.
              <br />
              <span className="positioning-headline-accent">
                É aproveitar melhor o que já chegou.
              </span>
            </h2>
            <p className="positioning-lead">
              A Althion mapeia cada etapa entre o primeiro contato e o comparecimento, identifica
              onde as oportunidades se perdem e fecha esses pontos sistematicamente.
            </p>
          </div>
        </div>

        {/* Strip de vazamentos — scroll horizontal infinito */}
        <div className="positioning-strip-container">
          <div className="positioning-strip-fade positioning-strip-fade--left" aria-hidden="true" />
          <div className="positioning-strip-fade positioning-strip-fade--right" aria-hidden="true" />
          <JourneyLeakStrip />
        </div>

        <div className="site-container">
          <p className="positioning-note" aria-label="Nota sobre dados">
            Percentuais são dados ilustrativos baseados em padrões operacionais observados
            no setor.
          </p>
        </div>
      </section>

      {/* Act 3: Seção do Problema (LIGHT THEME) */}
      <ProblemSection />

      {/* Act 4: Althion Radar & Score (LIGHT THEME) */}
      <section
        aria-labelledby="radar-heading"
        className="radar-section"
        id="radar"
      >
        <div className="site-container">
          <div className="radar-section-header">
            <div>
              <span className="section-eyebrow" aria-hidden="true">
                Althion Radar
              </span>
              <h2 className="section-headline" id="radar-heading">
                Veja onde sua operação está perdendo oportunidades.
              </h2>
            </div>
            <p className="section-lead radar-section-lead">
              O Althion Radar reúne indicadores da jornada, identifica gargalos e transforma
              dados operacionais em prioridades claras. As 8 dimensões abaixo são exemplos
              ilustrativos do tipo de diagnóstico que a plataforma realiza.
            </p>
          </div>

          <AlthionScoreDial />
        </div>
      </section>

      {/* Act 5: Como Funciona (Scrollytelling) */}
      <HowItWorksSection />

      {/* Act 6: Recovery Engine (LIGHT THEME) */}
      <section
        id="recuperacao"
        style={{
          background: '#F8FAF7',
          padding: '100px 0',
          borderTop: '1px solid rgba(16, 32, 27, 0.06)',
        }}
      >
        <div className="site-container">
          <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#18A987',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Recuperação de oportunidades
            </span>
            <h2
              style={{
                fontSize: '2.8rem',
                margin: '12px 0 20px 0',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: '#10201B',
              }}
            >
              Da perda identificada à próxima ação.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#52635D', lineHeight: '1.6', margin: 0 }}>
              A Althion identifica oportunidades paradas e organiza ações aprovadas para que leads,
              cancelamentos, faltas e retornos não fiquem sem acompanhamento.
            </p>
          </div>

          <RecoveryOpportunityFila />
        </div>
      </section>

      {/* Act 7: Capacity Engine (LIGHT THEME) */}
      <section id="capacidade" style={{ background: '#FFFFFF', padding: '100px 0' }}>
        <div className="site-container">
          <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#18A987',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Inteligência de capacidade
            </span>
            <h2
              style={{
                fontSize: '2.8rem',
                margin: '12px 0 20px 0',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: '#10201B',
              }}
            >
              Use a capacidade da agenda para priorizar a operação.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#52635D', lineHeight: '1.6', margin: 0 }}>
              A Althion relaciona horários disponíveis, lista de espera, leads ainda não agendados e
              oportunidades de retorno para sugerir onde a equipe deve agir primeiro.
            </p>
          </div>

          <CapacityCalor />
        </div>
      </section>

      {/* Act 8: IA vs Humano (LIGHT THEME) */}
      <section
        id="ia"
        style={{
          background: '#F8FAF7',
          padding: '100px 0',
          borderTop: '1px solid rgba(16, 32, 27, 0.06)',
        }}
      >
        <div
          className="site-container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '60px',
            alignItems: 'center',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#18A987',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Triagem de Mensagens
            </span>
            <h2
              style={{
                fontSize: '2.8rem',
                margin: '12px 0 20px 0',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: '#10201B',
              }}
            >
              Automação para a rotina. Pessoas para as exceções.
            </h2>
            <p
              style={{
                fontSize: '1.15rem',
                color: '#52635D',
                lineHeight: '1.6',
                marginBottom: '24px',
              }}
            >
              A inteligência artificial cuida de tarefas administrativas repetitivas de forma veloz.
              Quando uma situação exige contexto e sensibilidade humana, a conversa é imediatamente
              direcionada para a equipe da clínica.
            </p>
            <div
              style={{
                borderLeft: '4px solid #10201B',
                paddingLeft: '16px',
                color: '#52635D',
                fontStyle: 'italic',
                fontSize: '0.95rem',
              }}
            >
              A Althion atua na jornada administrativa e não realiza diagnósticos, prescrições ou
              orientações clínicas de saúde.
            </div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(16, 32, 27, 0.08)',
              borderRadius: '24px',
              padding: '32px',
            }}
          >
            <h3
              style={{
                fontSize: '1.2rem',
                marginBottom: '16px',
                fontWeight: '700',
                color: '#10201B',
              }}
            >
              Divisão de Responsabilidades
            </h3>
            <ul
              style={{
                paddingLeft: '20px',
                display: 'grid',
                gap: '12px',
                fontSize: '0.9rem',
                color: '#52635D',
                margin: 0,
              }}
            >
              <li>
                <strong style={{ color: '#10201B' }}>Auxiliado pela IA:</strong> dúvidas
                administrativas, confirmação de horários de agenda, lembretes de retorno, mapa de
                localização e formas de pagamento.
              </li>
              <li>
                <strong style={{ color: '#10201B' }}>Direcionado a Pessoas:</strong> reclamações,
                negociação de valores excepcionais, baixa confiança da IA ou termos sensíveis
                sinalizados.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Act 9: Especialista de Relacionamento (LIGHT THEME) */}
      <section id="especialista" style={{ background: '#FFFFFF', padding: '100px 0' }}>
        <div
          className="site-container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#18A987',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Acompanhamento Humano
            </span>
            <h2
              style={{
                fontSize: '2.8rem',
                margin: '12px 0 20px 0',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: '#10201B',
              }}
            >
              Tecnologia para executar. Uma pessoa responsável para acompanhar.
            </h2>
            <p
              style={{
                fontSize: '1.15rem',
                color: '#52635D',
                lineHeight: '1.6',
                marginBottom: '24px',
              }}
            >
              Cada clínica possui um Especialista de Relacionamento como principal ponto de contato.
              Ele estuda os processos internos da clínica, monitora os indicadores operacionais e
              coordena os planos de melhoria da agenda.
            </p>
          </div>

          <div
            style={{
              background: '#F8FAF7',
              border: '1px solid rgba(16, 32, 27, 0.08)',
              padding: '36px',
              borderRadius: '24px',
            }}
          >
            <h3
              style={{
                fontSize: '1.25rem',
                marginBottom: '20px',
                fontWeight: '700',
                color: '#10201B',
              }}
            >
              Painel do Especialista (Demonstração)
            </h3>
            <ul
              style={{
                padding: 0,
                margin: 0,
                listStyle: 'none',
                display: 'grid',
                gap: '12px',
                fontSize: '0.9rem',
                color: '#52635D',
              }}
            >
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(16, 32, 27, 0.04)',
                  paddingBottom: '8px',
                }}
              >
                <span>Especialista Dedicado</span>
                <strong style={{ color: '#10201B' }}>Juliana S.</strong>
              </li>
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(16, 32, 27, 0.04)',
                  paddingBottom: '8px',
                }}
              >
                <span>Saúde Operacional da Clínica</span>
                <span className="badge success">94%</span>
              </li>
              <li
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(16, 32, 27, 0.04)',
                  paddingBottom: '8px',
                }}
              >
                <span>Próxima Reunião</span>
                <strong style={{ color: '#10201B' }}>27 de Julho, às 14:00</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Aderência à Configuração</span>
                <strong style={{ color: '#18A987' }}>Conforme as diretrizes</strong>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Act 10: Segurança & Termos (DARK THEME) */}
      <section
        id="seguranca"
        className="dark-section"
        style={{ padding: '100px 0', borderTop: '1px solid var(--line)' }}
      >
        <div
          className="site-container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '60px',
            alignItems: 'center',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#29C7A1',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Segurança & Privacidade
            </span>
            <h2
              style={{
                fontSize: '2.8rem',
                margin: '12px 0 20px 0',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: 'var(--text)',
              }}
            >
              Tecnologia responsável começa com limites claros.
            </h2>
            <p
              style={{
                fontSize: '1.15rem',
                color: 'var(--muted)',
                lineHeight: '1.6',
                marginBottom: '24px',
              }}
            >
              Nossos sistemas são construídos adotando isolamento total de dados entre organizações
              e limites rígidos de controle de permissões.
            </p>
            <div
              style={{
                padding: '20px',
                background: 'rgba(243, 250, 247, 0.03)',
                border: '1px solid var(--line)',
                borderRadius: '12px',
                fontSize: '0.85rem',
                color: 'var(--muted)',
                lineHeight: '1.5',
              }}
            >
              A plataforma está sendo desenvolvida com princípios de segurança, minimização de dados
              e controle de acesso. A documentação definitiva deverá ser revisada juridicamente
              antes da operação comercial.
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div
              style={{
                padding: '20px',
                background: '#0A211B',
                border: '1px solid var(--line)',
                borderRadius: '12px',
              }}
            >
              <strong style={{ color: '#F3FAF7', display: 'block', marginBottom: '6px' }}>
                🔒 Isolamento Multitenant
              </strong>
              <small style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                As informações financeiras e logs de cada clínica são blindados a nível de banco de
                dados.
              </small>
            </div>
            <div
              style={{
                padding: '20px',
                background: '#0A211B',
                border: '1px solid var(--line)',
                borderRadius: '12px',
              }}
            >
              <strong>🛡️ Acesso Clínico Restrito</strong>
              <small
                style={{
                  color: 'var(--muted)',
                  fontSize: '0.85rem',
                  display: 'block',
                  marginTop: '6px',
                }}
              >
                Histórico médico ou exames não são processados. As regras focam exclusivamente na
                agenda administrativa.
              </small>
            </div>
          </div>
        </div>
      </section>

      {/* Act 11: Implantação (LIGHT THEME) */}
      <section style={{ background: '#FFFFFF', padding: '100px 0' }}>
        <div className="site-container">
          <div style={{ maxWidth: '800px', marginBottom: '60px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#18A987',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Processo de Ativação
            </span>
            <h2
              style={{
                fontSize: '2.8rem',
                margin: '12px 0 20px 0',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: '#10201B',
              }}
            >
              Comece sem mudar toda a operação de uma vez.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#52635D', lineHeight: '1.6', margin: 0 }}>
              Nossa implantação é modular e gradual, adaptando-se aos sistemas e cronogramas
              específicos de cada clínica para evitar sobrecargas.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            <div
              style={{
                padding: '24px',
                background: '#F8FAF7',
                borderRadius: '16px',
                border: '1px solid rgba(16, 32, 27, 0.04)',
              }}
            >
              <strong
                style={{
                  fontSize: '1.1rem',
                  color: '#10201B',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                1. Diagnóstico
              </strong>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#52635D', lineHeight: '1.5' }}>
                Mapeamos as janelas ociosas históricas e identificamos os pontos de perda da
                recepção.
              </p>
            </div>

            <div
              style={{
                padding: '24px',
                background: '#F8FAF7',
                borderRadius: '16px',
                border: '1px solid rgba(16, 32, 27, 0.04)',
              }}
            >
              <strong
                style={{
                  fontSize: '1.1rem',
                  color: '#10201B',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                2. Configuração
              </strong>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#52635D', lineHeight: '1.5' }}>
                Definimos as regras de reengajamento da IA de acordo com os procedimentos
                autorizados.
              </p>
            </div>

            <div
              style={{
                padding: '24px',
                background: '#F8FAF7',
                borderRadius: '16px',
                border: '1px solid rgba(16, 32, 27, 0.04)',
              }}
            >
              <strong
                style={{
                  fontSize: '1.1rem',
                  color: '#10201B',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                3. Acompanhamento
              </strong>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#52635D', lineHeight: '1.5' }}>
                Seu Especialista de Relacionamento avalia o andamento e apresenta relatórios
                periódicos de melhorias.
              </p>
            </div>
          </div>
          <div
            style={{
              marginTop: '24px',
              fontSize: '0.85rem',
              color: '#52635D',
              textAlign: 'center',
            }}
          >
            * O cronograma final é definido após o diagnóstico da operação de cada clínica.
          </div>
        </div>
      </section>

      {/* Act 12: FAQ (LIGHT THEME) */}
      <section
        id="faq"
        style={{
          background: '#F8FAF7',
          padding: '100px 0',
          borderTop: '1px solid rgba(16, 32, 27, 0.06)',
        }}
      >
        <div className="site-container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#18A987',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              FAQ
            </span>
            <h2
              style={{
                fontSize: '2.8rem',
                margin: '12px 0 20px 0',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: '#10201B',
              }}
            >
              Perguntas e Respostas
            </h2>
            <p style={{ color: '#52635D', fontSize: '1.1rem', margin: 0 }}>
              Esclareça suas dúvidas técnicas operacionais sobre a Althion.
            </p>
          </div>

          <FAQAccordions />
        </div>
      </section>

      {/* Act 13: CTA Final (DARK THEME) */}
      <section
        className="dark-section"
        style={{ padding: '100px 0', borderTop: '1px solid var(--line)' }}
      >
        <div
          className="site-container"
          style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              color: '#29C7A1',
              fontWeight: '700',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Diagnóstico Althion
          </span>
          <h2
            style={{
              fontSize: '2.8rem',
              margin: '20px 0',
              fontWeight: '800',
              color: '#F3FAF7',
              letterSpacing: '-0.02em',
              lineHeight: '1.15',
            }}
          >
            Descubra onde sua clínica está perdendo oportunidades.
          </h2>
          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--muted)',
              lineHeight: '1.6',
              marginBottom: '40px',
            }}
          >
            Receba uma análise inicial detalhada da jornada de atendimento, conversão e
            aproveitamento da agenda da sua clínica.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <Link
              className="primary-link"
              href="/diagnostico"
              style={{
                background: '#29C7A1',
                color: '#061713',
                padding: '14px 28px',
                borderRadius: '8px',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '1.05rem',
              }}
            >
              Solicitar diagnóstico
            </Link>
            <Link
              className="quiet-button"
              href="/contato"
              style={{
                border: '1px solid var(--line)',
                padding: '14px 28px',
                borderRadius: '8px',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '1.05rem',
                background: '#0A211B',
                color: '#F3FAF7',
              }}
            >
              Falar com a Althion
            </Link>
          </div>
          <small
            style={{
              display: 'block',
              marginTop: '20px',
              color: 'var(--muted)',
              fontSize: '0.82rem',
            }}
          >
            Sem compromisso. Informações utilizadas exclusivamente para a análise operacional.
          </small>
        </div>
      </section>
    </main>
  );
}
