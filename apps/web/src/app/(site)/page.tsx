import type { Metadata } from 'next';
import Link from 'next/link';

import { HeroInteractiveFlow } from '@/components/site/HeroInteractiveFlow';
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
      <section className="dark-section" style={{ padding: '100px 0 80px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="site-container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <span
              className="badge primary"
              style={{
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                marginBottom: '20px',
              }}
            >
              Performance da jornada do paciente
            </span>
            <h1 style={{ fontSize: '3.6rem', lineHeight: '1.1', margin: '16px 0 24px 0', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text)' }}>
              Converta mais da demanda que sua clínica já recebe.
            </h1>
            <p className="hero-copy" style={{ fontSize: '1.2rem', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '40px' }}>
              A Althion identifica perdas entre a primeira mensagem e o comparecimento, automatiza os próximos passos administrativos e coloca um Especialista de Relacionamento à frente da operação.
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link className="primary-link" href="/diagnostico" style={{ background: '#18A987', color: '#061713', padding: '14px 28px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '1.05rem', transition: 'all 0.2s ease' }}>
                Receber diagnóstico da operação
              </Link>
              <Link href="/produto" style={{ color: 'var(--text)', fontWeight: '700', textDecoration: 'none', fontSize: '1.05rem' }}>
                Ver como a Althion funciona →
              </Link>
            </div>
            <small style={{ display: 'block', marginTop: '20px', color: 'var(--muted)', fontSize: '0.82rem' }}>
              Diagnóstico inicial da operação. Sem compromisso.
            </small>

            <div style={{ marginTop: '48px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', opacity: 0.85, borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conexões:</span>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }}>
                <span>WhatsApp</span>
                <span>•</span>
                <span>CRM</span>
                <span>•</span>
                <span>Agenda</span>
                <span>•</span>
                <span>IA</span>
                <span>•</span>
                <span>Especialista</span>
              </div>
            </div>
          </div>

          <div>
            <HeroInteractiveFlow />
          </div>
        </div>
      </section>

      {/* Act 2: Faixa de Posicionamento (LIGHT THEME) */}
      <section style={{ background: '#F8FAF7', padding: '60px 0', borderBottom: '1px solid rgba(16, 32, 27, 0.06)' }}>
        <div className="site-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#10201B', margin: '0 0 16px 0', letterSpacing: '-0.01em' }}>
            O problema nem sempre é gerar mais demanda. É aproveitar melhor o que já chegou.
          </h2>
          <p style={{ color: '#52635D', fontSize: '1.05rem', margin: '0 auto 28px', maxWidth: '800px', lineHeight: '1.6' }}>
            A Althion mapeia a conversão e identifica lacunas na recepção para fechar os vazamentos operacionais da sua clínica.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#52635D', fontWeight: '700' }}>
            <span>Contato Inicial</span>
            <span>→</span>
            <span>Atendimento</span>
            <span>→</span>
            <span>Agendamento</span>
            <span>→</span>
            <span>Confirmação</span>
            <span>→</span>
            <span style={{ color: '#18A987' }}>Comparecimento Concluído</span>
          </div>
        </div>
      </section>

      {/* Act 3: Seção do Problema (LIGHT THEME) */}
      <section style={{ background: '#FFFFFF', padding: '100px 0' }}>
        <div className="site-container">
          <div style={{ maxWidth: '800px', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.75rem', color: '#18A987', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Os vazamentos invisíveis da operação
            </span>
            <h2 style={{ fontSize: '2.8rem', margin: '12px 0 20px 0', fontWeight: '800', letterSpacing: '-0.02em', color: '#10201B' }}>
              Oportunidades são perdidas entre a primeira mensagem e o comparecimento.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#52635D', lineHeight: '1.6', margin: 0 }}>
              Leads esfriam, cancelamentos viram horários vazios e pacientes deixam de retornar quando a operação depende de tarefas manuais, informações espalhadas e acompanhamentos sem próxima ação definida.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '28px' }}>
            <div style={{ padding: '32px', background: '#F8FAF7', border: '1px solid rgba(16, 32, 27, 0.04)', borderRadius: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(244, 126, 107, 0.1)', color: '#F47E6B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', fontWeight: '700', color: '#10201B' }}>Resposta Demorada</h3>
              <p style={{ color: '#52635D', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                Quando a recepção está sobrecarregada, mensagens acumuladas no WhatsApp demoram horas para receber retorno, fazendo com que o interessado agende na concorrência.
              </p>
            </div>

            <div style={{ padding: '32px', background: '#F8FAF7', border: '1px solid rgba(16, 32, 27, 0.04)', borderRadius: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(245, 162, 111, 0.1)', color: '#F5A26F', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', fontWeight: '700', color: '#10201B' }}>Lead sem Acompanhamento</h3>
              <p style={{ color: '#52635D', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                Pacientes que demonstram interesse mas não fecham o horário de imediato são esquecidos nas conversas antigas por falta de um lembrete ativo de follow-up.
              </p>
            </div>

            <div style={{ padding: '32px', background: '#F8FAF7', border: '1px solid rgba(16, 32, 27, 0.04)', borderRadius: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(244, 126, 107, 0.1)', color: '#F47E6B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', fontWeight: '700', color: '#10201B' }}>Vagas Ociosas</h3>
              <p style={{ color: '#52635D', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                Cancelamentos de última hora ocorrem sem tempo de resposta ágil para oferecer o horário vago a outros pacientes na lista de espera.
              </p>
            </div>

            <div style={{ padding: '32px', background: '#F8FAF7', border: '1px solid rgba(16, 32, 27, 0.04)', borderRadius: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(55, 124, 246, 0.1)', color: '#377CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', fontWeight: '700', color: '#10201B' }}>Ausência de Retorno</h3>
              <p style={{ color: '#52635D', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                Pacientes de procedimentos recorrentes concluem uma etapa mas a clínica não realiza o agendamento preventivo de retorno, gerando inatividade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Act 4: Althion Radar & Score (LIGHT THEME) */}
      <section style={{ background: '#F8FAF7', padding: '100px 0', borderTop: '1px solid rgba(16, 32, 27, 0.06)' }}>
        <div className="site-container">
          <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
            <span style={{ fontSize: '0.75rem', color: '#18A987', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Diagnóstico da jornada
            </span>
            <h2 style={{ fontSize: '2.8rem', margin: '12px 0 20px 0', fontWeight: '800', letterSpacing: '-0.02em', color: '#10201B' }}>
              Veja exatamente onde sua operação está perdendo oportunidades.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#52635D', lineHeight: '1.6', margin: 0 }}>
              O Althion Radar reúne os principais indicadores da jornada, identifica gargalos e transforma dados operacionais em prioridades claras e auditáveis para a clínica.
            </p>
          </div>

          <AlthionScoreDial />
        </div>
      </section>

      {/* Act 5: Como Funciona (Storytelling) */}
      <section style={{ background: '#FFFFFF', padding: '100px 0' }}>
        <div className="site-container">
          <div style={{ maxWidth: '800px', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.75rem', color: '#18A987', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Storytelling Operacional
            </span>
            <h2 style={{ fontSize: '2.8rem', margin: '12px 0 20px 0', fontWeight: '800', letterSpacing: '-0.02em', color: '#10201B' }}>
              Uma operação conectada, do primeiro contato à próxima ação.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#52635D', lineHeight: '1.6', margin: 0 }}>
              Entenda como a Althion simplifica a rotina e garante que nenhuma oportunidade administrativa de agendamento passe em branco.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px', alignItems: 'start' }}>
            {/* Steps text list */}
            <div style={{ display: 'grid', gap: '32px' }}>
              <div style={{ borderLeft: '3px solid #10201B', paddingLeft: '24px' }}>
                <span style={{ fontSize: '0.8rem', color: '#18A987', fontWeight: '700', textTransform: 'uppercase' }}>Etapa 1</span>
                <h4 style={{ margin: '4px 0 8px 0', fontSize: '1.25rem', fontWeight: '700', color: '#10201B' }}>Identificar</h4>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#52635D', lineHeight: '1.5' }}>
                  A Althion organiza o fluxo de contatos vindos de todos os canais e reconhece a sua real intenção administrativa.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid rgba(16, 32, 27, 0.08)', paddingLeft: '24px' }}>
                <span style={{ fontSize: '0.8rem', color: '#52635D', fontWeight: '600', textTransform: 'uppercase' }}>Etapa 2</span>
                <h4 style={{ margin: '4px 0 8px 0', fontSize: '1.25rem', fontWeight: '700', color: '#10201B' }}>Atender</h4>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#52635D', lineHeight: '1.5' }}>
                  A inteligência artificial ou a recepção assume a resposta de forma imediata, segundo as regras de negócio da clínica.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid rgba(16, 32, 27, 0.08)', paddingLeft: '24px' }}>
                <span style={{ fontSize: '0.8rem', color: '#52635D', fontWeight: '600', textTransform: 'uppercase' }}>Etapa 3</span>
                <h4 style={{ margin: '4px 0 8px 0', fontSize: '1.25rem', fontWeight: '700', color: '#10201B' }}>Agendar</h4>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#52635D', lineHeight: '1.5' }}>
                  O fluxo avança até a consolidação da vaga, gerando as mensagens automáticas de confirmação e lembrete.
                </p>
              </div>

              <div style={{ borderLeft: '3px solid rgba(16, 32, 27, 0.08)', paddingLeft: '24px' }}>
                <span style={{ fontSize: '0.8rem', color: '#52635D', fontWeight: '600', textTransform: 'uppercase' }}>Etapa 4</span>
                <h4 style={{ margin: '4px 0 8px 0', fontSize: '1.25rem', fontWeight: '700', color: '#10201B' }}>Recuperar</h4>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#52635D', lineHeight: '1.5' }}>
                  Contatos parados e cancelamentos disparam o motor de reengajamento, ocupando vagas livres de forma inteligente.
                </p>
              </div>
            </div>

            {/* Side visual Mockup */}
            <div style={{ background: '#FAF9F6', border: '1px solid rgba(16, 32, 27, 0.08)', padding: '32px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(16, 32, 27, 0.06)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10201B' }}>Visão Geral de Acompanhamento</span>
                <span className="badge success" style={{ fontSize: '0.7rem' }}>Sincronizado</span>
              </div>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: '16px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(16, 32, 27, 0.04)', paddingBottom: '10px' }}>
                  <span style={{ color: '#52635D', fontSize: '0.88rem' }}>Agendamentos Confirmados</span>
                  <strong style={{ color: '#10201B', fontSize: '0.9rem' }}>42 consultas</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(16, 32, 27, 0.04)', paddingBottom: '10px' }}>
                  <span style={{ color: '#52635D', fontSize: '0.88rem' }}>Janelas Vagas Detectadas</span>
                  <strong style={{ color: '#F47E6B', fontSize: '0.9rem' }}>6 slots ociosos</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(16, 32, 27, 0.04)', paddingBottom: '10px' }}>
                  <span style={{ color: '#52635D', fontSize: '0.88rem' }}>Recuperações Iniciadas</span>
                  <strong style={{ color: '#377CF6', fontSize: '0.9rem' }}>4 contatos</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#52635D', fontSize: '0.88rem' }}>Eficiência Mapeada</span>
                  <strong style={{ color: '#18A987', fontSize: '0.9rem' }}>92% de conversão</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Act 6: Recovery Engine (LIGHT THEME) */}
      <section style={{ background: '#F8FAF7', padding: '100px 0', borderTop: '1px solid rgba(16, 32, 27, 0.06)' }}>
        <div className="site-container">
          <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
            <span style={{ fontSize: '0.75rem', color: '#18A987', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Recuperação de oportunidades
            </span>
            <h2 style={{ fontSize: '2.8rem', margin: '12px 0 20px 0', fontWeight: '800', letterSpacing: '-0.02em', color: '#10201B' }}>
              Da perda identificada à próxima ação.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#52635D', lineHeight: '1.6', margin: 0 }}>
              A Althion identifica oportunidades paradas e organiza ações aprovadas para que leads, cancelamentos, faltas e retornos não fiquem sem acompanhamento.
            </p>
          </div>

          <RecoveryOpportunityFila />
        </div>
      </section>

      {/* Act 7: Capacity Engine (LIGHT THEME) */}
      <section style={{ background: '#FFFFFF', padding: '100px 0' }}>
        <div className="site-container">
          <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
            <span style={{ fontSize: '0.75rem', color: '#18A987', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Inteligência de capacidade
            </span>
            <h2 style={{ fontSize: '2.8rem', margin: '12px 0 20px 0', fontWeight: '800', letterSpacing: '-0.02em', color: '#10201B' }}>
              Use a capacidade da agenda para priorizar a operação.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#52635D', lineHeight: '1.6', margin: 0 }}>
              A Althion relaciona horários disponíveis, lista de espera, leads ainda não agendados e oportunidades de retorno para sugerir onde a equipe deve agir primeiro.
            </p>
          </div>

          <CapacityCalor />
        </div>
      </section>

      {/* Act 8: IA vs Humano (LIGHT THEME) */}
      <section style={{ background: '#F8FAF7', padding: '100px 0', borderTop: '1px solid rgba(16, 32, 27, 0.06)' }}>
        <div className="site-container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#18A987', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Triagem de Mensagens
            </span>
            <h2 style={{ fontSize: '2.8rem', margin: '12px 0 20px 0', fontWeight: '800', letterSpacing: '-0.02em', color: '#10201B' }}>
              Automação para a rotina. Pessoas para as exceções.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#52635D', lineHeight: '1.6', marginBottom: '24px' }}>
              A inteligência artificial cuida de tarefas administrativas repetitivas de forma veloz. Quando uma situação exige contexto e sensibilidade humana, a conversa é imediatamente direcionada para a equipe da clínica.
            </p>
            <div style={{ borderLeft: '4px solid #10201B', paddingLeft: '16px', color: '#52635D', fontStyle: 'italic', fontSize: '0.95rem' }}>
              A Althion atua na jornada administrativa e não realiza diagnósticos, prescrições ou orientações clínicas de saúde.
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid rgba(16, 32, 27, 0.08)', borderRadius: '24px', padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: '700', color: '#10201B' }}>Divisão de Responsabilidades</h3>
            <ul style={{ paddingLeft: '20px', display: 'grid', gap: '12px', fontSize: '0.9rem', color: '#52635D', margin: 0 }}>
              <li>
                <strong style={{ color: '#10201B' }}>Auxiliado pela IA:</strong> dúvidas administrativas, confirmação de horários de agenda, lembretes de retorno, mapa de localização e formas de pagamento.
              </li>
              <li>
                <strong style={{ color: '#10201B' }}>Direcionado a Pessoas:</strong> reclamações, negociação de valores excepcionais, baixa confiança da IA ou termos sensíveis sinalizados.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Act 9: Especialista de Relacionamento (LIGHT THEME) */}
      <section style={{ background: '#FFFFFF', padding: '100px 0' }}>
        <div className="site-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#18A987', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Acompanhamento Humano
            </span>
            <h2 style={{ fontSize: '2.8rem', margin: '12px 0 20px 0', fontWeight: '800', letterSpacing: '-0.02em', color: '#10201B' }}>
              Tecnologia para executar. Uma pessoa responsável para acompanhar.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#52635D', lineHeight: '1.6', marginBottom: '24px' }}>
              Cada clínica possui um Especialista de Relacionamento como principal ponto de contato. Ele estuda os processos internos da clínica, monitora os indicadores operacionais e coordena os planos de melhoria da agenda.
            </p>
          </div>

          <div style={{ background: '#F8FAF7', border: '1px solid rgba(16, 32, 27, 0.08)', padding: '36px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: '700', color: '#10201B' }}>
              Painel do Especialista (Demonstração)
            </h3>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: '12px', fontSize: '0.9rem', color: '#52635D' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(16, 32, 27, 0.04)', paddingBottom: '8px' }}>
                <span>Especialista Dedicado</span>
                <strong style={{ color: '#10201B' }}>Juliana S.</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(16, 32, 27, 0.04)', paddingBottom: '8px' }}>
                <span>Saúde Operacional da Clínica</span>
                <span className="badge success">94%</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(16, 32, 27, 0.04)', paddingBottom: '8px' }}>
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
      <section className="dark-section" style={{ padding: '100px 0', borderTop: '1px solid var(--line)' }}>
        <div className="site-container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#29C7A1', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Segurança & Privacidade
            </span>
            <h2 style={{ fontSize: '2.8rem', margin: '12px 0 20px 0', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text)' }}>
              Tecnologia responsável começa com limites claros.
            </h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '24px' }}>
              Nossos sistemas são construídos adotando isolamento total de dados entre organizações e limites rígidos de controle de permissões.
            </p>
            <div style={{ padding: '20px', background: 'rgba(243, 250, 247, 0.03)', border: '1px solid var(--line)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.5' }}>
              A plataforma está sendo desenvolvida com princípios de segurança, minimização de dados e controle de acesso. A documentação definitiva deverá ser revisada juridicamente antes da operação comercial.
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ padding: '20px', background: '#0A211B', border: '1px solid var(--line)', borderRadius: '12px' }}>
              <strong style={{ color: '#F3FAF7', display: 'block', marginBottom: '6px' }}>🔒 Isolamento Multitenant</strong>
              <small style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>As informações financeiras e logs de cada clínica são blindados a nível de banco de dados.</small>
            </div>
            <div style={{ padding: '20px', background: '#0A211B', border: '1px solid var(--line)', borderRadius: '12px' }}>
              <strong>🛡️ Acesso Clínico Restrito</strong>
              <small style={{ color: 'var(--muted)', fontSize: '0.85rem', display: 'block', marginTop: '6px' }}>Histórico médico ou exames não são processados. As regras focam exclusivamente na agenda administrativa.</small>
            </div>
          </div>
        </div>
      </section>

      {/* Act 11: Implantação (LIGHT THEME) */}
      <section style={{ background: '#FFFFFF', padding: '100px 0' }}>
        <div className="site-container">
          <div style={{ maxWidth: '800px', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.75rem', color: '#18A987', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Processo de Ativação
            </span>
            <h2 style={{ fontSize: '2.8rem', margin: '12px 0 20px 0', fontWeight: '800', letterSpacing: '-0.02em', color: '#10201B' }}>
              Comece sem mudar toda a operação de uma vez.
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#52635D', lineHeight: '1.6', margin: 0 }}>
              Nossa implantação é modular e gradual, adaptando-se aos sistemas e cronogramas específicos de cada clínica para evitar sobrecargas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ padding: '24px', background: '#F8FAF7', borderRadius: '16px', border: '1px solid rgba(16, 32, 27, 0.04)' }}>
              <strong style={{ fontSize: '1.1rem', color: '#10201B', display: 'block', marginBottom: '8px' }}>1. Diagnóstico</strong>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#52635D', lineHeight: '1.5' }}>
                Mapeamos as janelas ociosas históricas e identificamos os pontos de perda da recepção.
              </p>
            </div>

            <div style={{ padding: '24px', background: '#F8FAF7', borderRadius: '16px', border: '1px solid rgba(16, 32, 27, 0.04)' }}>
              <strong style={{ fontSize: '1.1rem', color: '#10201B', display: 'block', marginBottom: '8px' }}>2. Configuração</strong>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#52635D', lineHeight: '1.5' }}>
                Definimos as regras de reengajamento da IA de acordo com os procedimentos autorizados.
              </p>
            </div>

            <div style={{ padding: '24px', background: '#F8FAF7', borderRadius: '16px', border: '1px solid rgba(16, 32, 27, 0.04)' }}>
              <strong style={{ fontSize: '1.1rem', color: '#10201B', display: 'block', marginBottom: '8px' }}>3. Acompanhamento</strong>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#52635D', lineHeight: '1.5' }}>
                Seu Especialista de Relacionamento avalia o andamento e apresenta relatórios periódicos de melhorias.
              </p>
            </div>
          </div>
          <div style={{ marginTop: '24px', fontSize: '0.85rem', color: '#52635D', textAlign: 'center' }}>
            * O cronograma final é definido após o diagnóstico da operação de cada clínica.
          </div>
        </div>
      </section>

      {/* Act 12: FAQ (LIGHT THEME) */}
      <section style={{ background: '#F8FAF7', padding: '100px 0', borderTop: '1px solid rgba(16, 32, 27, 0.06)' }}>
        <div className="site-container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.75rem', color: '#18A987', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>FAQ</span>
            <h2 style={{ fontSize: '2.8rem', margin: '12px 0 20px 0', fontWeight: '800', letterSpacing: '-0.02em', color: '#10201B' }}>Perguntas e Respostas</h2>
            <p style={{ color: '#52635D', fontSize: '1.1rem', margin: 0 }}>
              Esclareça suas dúvidas técnicas operacionais sobre a Althion.
            </p>
          </div>

          <FAQAccordions />
        </div>
      </section>

      {/* Act 13: CTA Final (DARK THEME) */}
      <section className="dark-section" style={{ padding: '100px 0', borderTop: '1px solid var(--line)' }}>
        <div className="site-container" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.75rem', color: '#29C7A1', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Diagnóstico Althion
          </span>
          <h2 style={{ fontSize: '2.8rem', margin: '20px 0', fontWeight: '800', color: '#F3FAF7', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
            Descubra onde sua clínica está perdendo oportunidades.
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '40px' }}>
            Receba uma análise inicial detalhada da jornada de atendimento, conversão e aproveitamento da agenda da sua clínica.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <Link className="primary-link" href="/diagnostico" style={{ background: '#29C7A1', color: '#061713', padding: '14px 28px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '1.05rem' }}>
              Solicitar diagnóstico
            </Link>
            <Link className="quiet-button" href="/contato" style={{ border: '1px solid var(--line)', padding: '14px 28px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '1.05rem', background: '#0A211B', color: '#F3FAF7' }}>
              Falar com a Althion
            </Link>
          </div>
          <small style={{ display: 'block', marginTop: '20px', color: 'var(--muted)', fontSize: '0.82rem' }}>
            Sem compromisso. Informações utilizadas exclusivamente para a análise operacional.
          </small>
        </div>
      </section>
    </main>
  );
}
