import type { Metadata } from 'next';
import Link from 'next/link';

import { MarketingHeader } from '@/components/site/MarketingHeader';

export const metadata: Metadata = {
  title: 'Recuperação e performance da jornada administrativa',
  description:
    'Descubra onde sua clínica perde oportunidades e por onde começar a recuperá-las com o diagnóstico Althion.',
};

const JOURNEY = [
  'Contato',
  'Atendimento',
  'Agendamento',
  'Confirmação',
  'Comparecimento',
  'Retorno',
] as const;

const PLATFORM_CAPABILITIES = [
  {
    number: '01',
    title: 'Nenhum contato sem contexto',
    text: 'Atendimento e histórico centralizados preservam o que já aconteceu e o que precisa acontecer depois.',
  },
  {
    number: '02',
    title: 'Cada oportunidade com responsável e próxima ação',
    text: 'CRM, etapas e responsáveis dão clareza sobre quem conduz cada oportunidade e qual é o próximo passo.',
  },
  {
    number: '03',
    title: 'Menos tarefas dependentes da memória da equipe',
    text: 'Automações e IA apoiam rotinas repetitivas sem retirar o controle humano da operação.',
  },
  {
    number: '04',
    title: 'Follow-up que não termina no primeiro contato',
    text: 'Sequências, mensagens programadas e carteiras ajudam a sustentar a continuidade do relacionamento.',
  },
  {
    number: '05',
    title: 'Sistemas trabalhando juntos',
    text: 'Integrações reduzem a fragmentação e aproximam atendimento, agenda, relacionamento e dados.',
  },
  {
    number: '06',
    title: 'Decisão baseada no que aconteceu',
    text: 'Ações e resultados formam uma linha de base para orientar prioridades e decisões futuras.',
  },
] as const;

const RECOVERY_CASES = [
  {
    signal: 'Lead sem resposta',
    opportunity: 'Contato ainda elegível',
    action: 'Retomar',
  },
  {
    signal: 'Conversa sem agendamento',
    opportunity: 'Intenção não convertida',
    action: 'Fazer follow-up',
  },
  {
    signal: 'Cancelamento',
    opportunity: 'Paciente e horário perdidos',
    action: 'Reagendar',
  },
  { signal: 'Falta', opportunity: 'Jornada interrompida', action: 'Recuperar' },
  {
    signal: 'Agenda ociosa',
    opportunity: 'Capacidade disponível',
    action: 'Priorizar elegíveis',
  },
] as const;

const FAQ = [
  {
    question: 'A Althion é um CRM?',
    answer:
      'Não. A Althion estrutura os recursos de CRM, atendimento, automação e relacionamento necessários a cada plano, mas seu foco é recuperar oportunidades e melhorar a performance da jornada administrativa.',
  },
  {
    question: 'Preciso trocar as ferramentas que minha clínica já usa?',
    answer:
      'Depende da operação. O diagnóstico identifica o que pode ser integrado, mantido, reorganizado ou substituído antes de qualquer mudança de tecnologia.',
  },
  {
    question: 'A Althion substitui minha recepção ou secretária?',
    answer:
      'Não. A tecnologia organiza tarefas, informações e automações para que a equipe tenha mais contexto, continuidade e clareza de prioridade.',
  },
  {
    question: 'Existe acompanhamento humano?',
    answer:
      'Sim. A tecnologia é combinada com acompanhamento da operação, revisão de indicadores e planos de melhoria junto à equipe da clínica.',
  },
  {
    question: 'Como a Althion recupera oportunidades?',
    answer:
      'Identificamos rupturas administrativas, organizamos oportunidades elegíveis e estruturamos ações de follow-up e recuperação com responsável, contexto e rastreabilidade.',
  },
  {
    question: 'Como começamos?',
    answer:
      'Pelo diagnóstico. Ele mostra os principais gargalos, a maturidade da operação e as prioridades iniciais antes de estruturar tecnologia e processos.',
  },
] as const;

export default function Home() {
  return (
    <div className="marketing-site">
      <MarketingHeader />
      <main>
        <section className="marketing-hero" id="inicio">
          <div className="marketing-container marketing-hero-grid">
            <div className="marketing-hero-copy">
              <p className="marketing-eyebrow">Diagnóstico operacional para clínicas</p>
              <h1>
                Sua clínica já recebe oportunidades.
                <br /> Descubra onde elas se perdem.
              </h1>
              <p className="marketing-hero-lead">
                A Althion identifica os gargalos da jornada administrativa e mostra por onde começar
                a recuperar oportunidades.
              </p>
              <div className="marketing-actions">
                <Link className="marketing-button marketing-button-primary" href="/diagnostico">
                  Receber diagnóstico da operação
                </Link>
                <a className="marketing-button marketing-button-quiet" href="#como-funciona">
                  Entender como a Althion funciona
                </a>
              </div>
              <p className="marketing-microcopy">Diagnóstico inicial. Sem compromisso.</p>
            </div>

            <div className="journey-visual" aria-label="Visão da jornada administrativa Althion">
              <div className="journey-visual-header">
                <div>
                  <span>Operação Althion</span>
                  <strong>Da oportunidade à performance</strong>
                </div>
                <span className="marketing-badge marketing-badge-live">Ciclo acompanhado</span>
              </div>
              <ol className="journey-visual-list">
                {JOURNEY.map((stage, index) => (
                  <li
                    className={`journey-visual-stage journey-state-${index < 2 ? 'observed' : index < 4 ? 'attention' : 'unknown'}`}
                    key={stage}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{stage}</strong>
                    <small>{index < 2 ? 'Organizar' : index < 4 ? 'Acompanhar' : 'Medir'}</small>
                  </li>
                ))}
              </ol>
              <p>Representação conceitual da jornada — não apresenta métricas reais.</p>
            </div>
          </div>
        </section>

        <section className="journey-band" aria-label="Etapas acompanhadas pela Althion">
          <div className="marketing-container journey-band-track">
            {JOURNEY.map((stage, index) => (
              <div key={stage}>
                <span>{stage}</span>
                {index < JOURNEY.length - 1 ? <i aria-hidden="true">→</i> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="marketing-section marketing-section-light" id="problema">
          <div className="marketing-container">
            <header className="marketing-section-heading marketing-section-heading-split">
              <div>
                <p className="marketing-eyebrow">O problema</p>
                <h2>Nem toda agenda vazia começa com falta de demanda.</h2>
              </div>
              <p>
                Oportunidades se perdem em pequenas rupturas — e sistemas isolados impedem que a
                gestão enxergue a jornada inteira.
              </p>
            </header>
            <div className="loss-card-grid loss-card-grid-four">
              <article>
                <span>01</span>
                <h3>Contatos sem continuidade</h3>
                <p>Conversas iniciadas não avançam e não deixam uma próxima ação rastreável.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Agenda sem contexto</h3>
                <p>Cancelamentos, faltas e capacidade ficam separados da rotina de atendimento.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Sistemas desconectados</h3>
                <p>
                  Atendimento, agenda, CRM e dados vivem separados — sem uma visão completa da
                  jornada.
                </p>
              </article>
              <article>
                <span>04</span>
                <h3>Gestão sem linha de base</h3>
                <p>A equipe sente os gargalos, mas não consegue provar onde agir primeiro.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-section-dark" id="como-funciona">
          <div className="marketing-container">
            <header className="marketing-section-heading">
              <p className="marketing-eyebrow">Como a Althion funciona</p>
              <h2>Uma operação completa, explicada em quatro movimentos.</h2>
              <p>
                O diagnóstico mostra onde agir. A infraestrutura operacional é estruturada para
                executar o plano. O acompanhamento sustenta a evolução.
              </p>
            </header>
            <div className="method-steps method-steps-four">
              <article>
                <span>Diagnosticar</span>
                <strong>01</strong>
                <h3>Descobrir onde estão as perdas</h3>
                <p>
                  Radar, evidências, indicadores e Score mostram os principais gargalos da jornada,
                  respeitando a cobertura disponível.
                </p>
              </article>
              <article>
                <span>Estruturar</span>
                <strong>02</strong>
                <h3>Dar infraestrutura à operação</h3>
                <p>
                  Os recursos adequados à realidade da clínica são organizados para conectar
                  processos, responsáveis e informações.
                </p>
              </article>
              <article>
                <span>Recuperar</span>
                <strong>03</strong>
                <h3>Transformar perdas em ações</h3>
                <p>
                  Leads sem continuidade, cancelamentos, faltas e oportunidades esquecidas entram em
                  processos rastreáveis.
                </p>
              </article>
              <article>
                <span>Evoluir</span>
                <strong>04</strong>
                <h3>Medir e melhorar continuamente</h3>
                <p>
                  A Althion acompanha indicadores, prioridades e execução junto à equipe da clínica.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-section-ivory" id="diagnostico">
          <div className="marketing-container diagnostic-showcase">
            <div className="diagnostic-showcase-copy">
              <p className="marketing-eyebrow">Diagnóstico Althion</p>
              <h2>O diagnóstico mostra onde começar.</h2>
              <p>
                Antes de implantar tecnologia ou mudar processos, a Althion identifica os pontos de
                perda, a maturidade da operação e as prioridades dos próximos 90 dias.
              </p>
              <ul className="marketing-check-list">
                <li>Evidências observadas e nível de confiança</li>
                <li>Maturidade e principais gargalos operacionais</li>
                <li>Oportunidades prioritárias de melhoria</li>
                <li>Indicadores a estruturar e plano inicial de 90 dias</li>
              </ul>
              <Link className="marketing-button marketing-button-dark" href="/diagnostico">
                Testar o diagnóstico
              </Link>
            </div>
            <div
              className="report-preview-card"
              aria-label="Prévia ilustrativa do diagnóstico executivo"
            >
              <div className="report-preview-topline">
                <span>Diagnóstico Executivo</span>
                <small>Exemplo ilustrativo</small>
              </div>
              <h3>Onde a operação precisa agir primeiro</h3>
              <div className="report-preview-summary">
                <div className="report-preview-radar">
                  <span>Radar qualitativo</span>
                  <strong>Leitura inicial</strong>
                  <small>Baseada na amostra</small>
                </div>
                <div className="report-preview-score">
                  <span>Althion Score</span>
                  <strong>Não disponível</strong>
                  <small>Cobertura insuficiente</small>
                </div>
              </div>
              <div className="report-preview-bars">
                <div>
                  <span>Atendimento</span>
                  <i>
                    <b className="preview-bar-64" />
                  </i>
                  <small>Observado</small>
                </div>
                <div>
                  <span>Processos</span>
                  <i>
                    <b className="preview-bar-46" />
                  </i>
                  <small>Parcial</small>
                </div>
                <div>
                  <span>Tecnologia</span>
                  <i>
                    <b className="preview-bar-28" />
                  </i>
                  <small>A validar</small>
                </div>
                <div>
                  <span>Dados e gestão</span>
                  <i>
                    <b className="preview-bar-20" />
                  </i>
                  <small>A validar</small>
                </div>
              </div>
              <p>Composição ilustrativa — não representa resultados ou métricas reais.</p>
            </div>
          </div>
        </section>

        <aside className="marketing-manifesto">
          <div className="marketing-container">
            <span>A tecnologia é o meio.</span>
            <strong>Performance é o produto.</strong>
          </div>
        </aside>

        <section className="marketing-section platform-section" id="plataforma">
          <div className="marketing-container">
            <header className="marketing-section-heading marketing-section-heading-split">
              <div>
                <p className="marketing-eyebrow">Infraestrutura operacional</p>
                <h2>Diagnóstico sem execução vira apenas um relatório.</h2>
              </div>
              <p>
                A infraestrutura operacional da Althion conecta os recursos necessários para
                executar o plano de melhoria e transformar prioridades em ações rastreáveis.
              </p>
            </header>
            <div
              className="platform-architecture"
              aria-label="Arquitetura conceitual da plataforma Althion"
            >
              <div className="platform-core">
                <span>A</span>
                <div>
                  <small>Infraestrutura</small>
                  <strong>PLATAFORMA ALTHION</strong>
                </div>
              </div>
              <div className="platform-systems">
                <span>Atendimento</span>
                <span>CRM</span>
                <span>Automação</span>
                <span>IA</span>
                <span>Relacionamento</span>
                <span>Dados</span>
              </div>
              <div className="platform-connector" aria-hidden="true">
                <i />
                <b />
              </div>
              <div className="platform-journey">
                <strong>Jornada administrativa</strong>
                <div>
                  {JOURNEY.map((stage) => (
                    <span key={stage}>{stage}</span>
                  ))}
                </div>
              </div>
              <p className="platform-availability-note">
                A composição da infraestrutura é definida após o diagnóstico, conforme as
                necessidades, ferramentas e integrações viáveis em cada operação.
              </p>
            </div>
            <div className="platform-capability-grid">
              {PLATFORM_CAPABILITIES.map((item) => (
                <article key={item.number}>
                  <span>{item.number}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-section-light" id="recuperacao">
          <div className="marketing-container recovery-layout">
            <header className="marketing-section-heading">
              <p className="marketing-eyebrow">Recuperação de oportunidades</p>
              <h2>Toda perda identificada precisa virar uma próxima ação.</h2>
              <p>
                A recuperação começa como método: identificar rupturas, organizar oportunidades
                elegíveis e definir ações com contexto, responsável e rastreabilidade.
              </p>
            </header>
            <div
              className="recovery-table"
              role="table"
              aria-label="Exemplos de recuperação operacional"
            >
              <div className="recovery-table-head" role="row">
                <span role="columnheader">Sinal</span>
                <span role="columnheader">Oportunidade</span>
                <span role="columnheader">Próxima ação</span>
              </div>
              {RECOVERY_CASES.map((item) => (
                <div className="recovery-table-row" role="row" key={item.signal}>
                  <strong role="cell">{item.signal}</strong>
                  <span role="cell">{item.opportunity}</span>
                  <b role="cell">{item.action} →</b>
                </div>
              ))}
            </div>
            <div className="recovery-flow" aria-label="Ciclo de recuperação">
              <article>
                <span>01</span>
                <h3>Detectar</h3>
                <p>Identificar a ruptura.</p>
              </article>
              <i aria-hidden="true">→</i>
              <article>
                <span>02</span>
                <h3>Priorizar</h3>
                <p>Definir o que merece atenção.</p>
              </article>
              <i aria-hidden="true">→</i>
              <article>
                <span>03</span>
                <h3>Acionar</h3>
                <p>Organizar ação e responsável.</p>
              </article>
              <i aria-hidden="true">→</i>
              <article>
                <span>04</span>
                <h3>Medir</h3>
                <p>Devolver o resultado ao ciclo.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="marketing-section specialist-section" id="especialista">
          <div className="marketing-container specialist-grid">
            <div>
              <p className="marketing-eyebrow">Acompanhamento</p>
              <h2>Tecnologia organiza a operação. Pessoas ajudam a transformá-la.</h2>
              <p>
                Na fase de acompanhamento, o Especialista Althion revisa os indicadores disponíveis,
                organiza prioridades e mantém o plano de ação visível para a clínica.
              </p>
              <blockquote>
                Você não recebe apenas acesso a uma plataforma. Recebe uma operação acompanhada.
              </blockquote>
            </div>
            <div className="specialist-panel">
              <div className="specialist-panel-header">
                <span>Especialista Althion</span>
                <small>O que acompanha</small>
              </div>
              <article>
                <span>01</span>
                <div>
                  <h3>Performance</h3>
                  <p>Leitura dos indicadores e pontos de perda disponíveis.</p>
                </div>
              </article>
              <article>
                <span>02</span>
                <div>
                  <h3>Prioridades</h3>
                  <p>Plano de ação e ordem do que merece atenção primeiro.</p>
                </div>
              </article>
              <article>
                <span>03</span>
                <div>
                  <h3>Execução</h3>
                  <p>Responsáveis, próximos passos e pendências acordadas.</p>
                </div>
              </article>
              <article>
                <span>04</span>
                <div>
                  <h3>Evolução</h3>
                  <p>Aprendizados e ajustes necessários no ciclo seguinte.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-section-ivory" id="performance">
          <div className="marketing-container performance-grid">
            <header className="marketing-section-heading">
              <p className="marketing-eyebrow">Performance contínua</p>
              <h2>Performance não é uma implantação. É um ciclo.</h2>
              <p>
                A operação muda, os gargalos mudam e as oportunidades também. A Althion acompanha
                esse movimento continuamente.
              </p>
            </header>
            <div className="performance-cycle" aria-label="Ciclo contínuo de performance">
              {[
                ['01', 'Diagnosticar'],
                ['02', 'Estruturar'],
                ['03', 'Recuperar'],
                ['04', 'Medir'],
                ['05', 'Evoluir'],
              ].map(([number, label], index) => (
                <div className={`performance-cycle-step cycle-step-${index + 1}`} key={label}>
                  <span>{number}</span>
                  <strong>{label}</strong>
                </div>
              ))}
              <div className="performance-cycle-core">
                <span>A</span>
                <strong>Melhoria contínua</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-compact" id="seguranca">
          <div className="marketing-container trust-compact-grid">
            <div>
              <p className="marketing-eyebrow">Segurança e limites</p>
              <h2>Tecnologia responsável começa com escopo claro.</h2>
            </div>
            <ul>
              <li>Minimização e mascaramento de dados</li>
              <li>Escopo exclusivamente administrativo</li>
              <li>Revisão humana e incerteza explícita</li>
            </ul>
          </div>
        </section>

        <section className="marketing-section marketing-section-light" id="como-comeca">
          <div className="marketing-container getting-started-layout">
            <header className="marketing-section-heading">
              <p className="marketing-eyebrow">Como começa</p>
              <h2>O diagnóstico abre uma jornada clara de evolução.</h2>
              <p>
                Você não precisa contratar toda a transformação de uma vez. O primeiro passo é
                entender o problema e definir por onde começar.
              </p>
            </header>
            <div className="getting-started-steps">
              <article>
                <span>01</span>
                <h3>Diagnóstico</h3>
                <p>Entendemos a jornada atual e identificamos os principais pontos de perda.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Plano</h3>
                <p>Definimos prioridades, indicadores e processos que precisam ser estruturados.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Implantação</h3>
                <p>
                  Configuramos a infraestrutura operacional necessária para executar o plano
                  aprovado.
                </p>
              </article>
              <article>
                <span>04</span>
                <h3>Acompanhamento</h3>
                <p>
                  Indicadores, prioridades e próximos passos passam a ser revistos ao longo da
                  evolução.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="marketing-section marketing-section-ivory" id="faq">
          <div className="marketing-container faq-layout">
            <header className="marketing-section-heading">
              <p className="marketing-eyebrow">Perguntas frequentes</p>
              <h2>O essencial antes de começar.</h2>
            </header>
            <div className="faq-list">
              {FAQ.map((item) => (
                <details key={item.question}>
                  <summary>
                    {item.question}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="marketing-final-cta">
          <div className="marketing-container marketing-final-cta-inner">
            <p className="marketing-eyebrow">Diagnóstico Althion</p>
            <h2>
              Descubra onde sua operação perde oportunidades — e por onde começar a recuperá-las.
            </h2>
            <p>
              O diagnóstico inicial mostra os principais gargalos, prioridades e próximos passos
              para evoluir sua jornada administrativa.
            </p>
            <Link className="marketing-button marketing-button-primary" href="/diagnostico">
              Receber diagnóstico da operação
            </Link>
            <small>Diagnóstico inicial. Sem compromisso.</small>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <div className="marketing-container marketing-footer-inner">
          <div>
            <strong>Althion</strong>
            <span>Recuperação e performance da jornada administrativa.</span>
          </div>
          <nav aria-label="Links do rodapé">
            <a href="#como-funciona">Como funciona</a>
            <a href="#plataforma">Plataforma</a>
            <a href="#recuperacao">Recuperação</a>
            <a href="#especialista">Especialista</a>
            <Link href="/diagnostico">Diagnóstico</Link>
          </nav>
          <small>© 2026 Althion. MVP em validação.</small>
        </div>
      </footer>
    </div>
  );
}
