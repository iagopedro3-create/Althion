import type { PortalDashboardView } from '@/lib/api/portal';
import type { PortalContext } from '@/lib/portal-context';
import { portalQuery } from '@/lib/portal-context';

import { ScoreTrend } from './score-trend';

const PRIORITY_LABELS = { high: 'Alta', low: 'Baixa', medium: 'Média' } as const;

export function PortalDashboard({
  clinicName,
  context,
  dashboard,
}: Readonly<{
  clinicName: string;
  context: PortalContext;
  dashboard: PortalDashboardView;
}>) {
  const query = portalQuery(context);
  const scoreAvailable = dashboard.score.availability === 'available';
  const generatedAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dashboard.generatedAt));

  return (
    <main className="portal-main portal-dashboard-main">
      <header className="dashboard-heading">
        <div>
          <p className="eyebrow">Centro de performance</p>
          <h1>{clinicName}</h1>
          <p className="lead-copy">Problemas, oportunidades e próximas ações em um só lugar.</p>
        </div>
        <div className="freshness-box">
          <span>Visão gerada em</span>
          <strong>{generatedAt}</strong>
          <a href="/app">Trocar clínica</a>
        </div>
      </header>

      <section className="command-center" aria-labelledby="command-heading">
        <div className="command-score">
          <p className="eyebrow">Althion Score</p>
          <h2 id="command-heading">
            {scoreAvailable
              ? `${dashboard.score.scoreValue}/100`
              : dashboard.score.availability === 'insufficient_data'
                ? 'Dados insuficientes'
                : 'Radar ainda não enviado'}
          </h2>
          <p>
            {dashboard.score.coverage !== undefined
              ? `${dashboard.score.coverage}% de cobertura${
                  dashboard.score.formulaVersion
                    ? ` · fórmula ${dashboard.score.formulaVersion}`
                    : ''
                }`
              : 'Crie o primeiro diagnóstico para estabelecer uma linha de base.'}
          </p>
          <a className="primary-button" href={`/app/radar?${query}`}>
            {dashboard.score.id ? 'Ver evidências' : 'Iniciar Radar'}
          </a>
        </div>
        <div className="command-actions">
          <article>
            <span>Oportunidades prioritárias</span>
            <strong>{dashboard.opportunities.length}</strong>
            <a href={`/app/oportunidades?${query}`}>Revisar recomendações</a>
          </article>
          <article>
            <span>Solicitações abertas</span>
            <strong>{dashboard.requests.open}</strong>
            <a href={`/app/solicitacoes?${query}`}>Acompanhar solicitações</a>
          </article>
          <article>
            <span>Tarefas vencidas</span>
            <strong>{dashboard.plan?.dueTasks ?? 0}</strong>
            <a href={`/app/plano-de-melhoria?${query}`}>Abrir plano</a>
          </article>
        </div>
      </section>

      <div className="portal-dashboard-grid">
        <ScoreTrend points={dashboard.trend} />

        <section className="portal-panel opportunity-panel" aria-labelledby="opportunities-heading">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Prioridade</p>
              <h2 id="opportunities-heading">Onde agir agora</h2>
            </div>
            <a href={`/app/oportunidades?${query}`}>Ver todas</a>
          </div>
          {dashboard.opportunities.length ? (
            <div className="opportunity-stack">
              {dashboard.opportunities.map((opportunity, index) => (
                <article key={opportunity.id}>
                  <span className="opportunity-index">0{index + 1}</span>
                  <div>
                    <span className={`priority ${opportunity.priority}`}>
                      {PRIORITY_LABELS[opportunity.priority]}
                    </span>
                    <h3>{opportunity.title}</h3>
                    <p>{opportunity.rationale}</p>
                    <small>Recomendação do Radar · nenhuma ação automática</small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="compact-empty">
              <strong>Nenhuma recomendação disponível</strong>
              <p>Envie o Radar ou revise a cobertura dos dados.</p>
            </div>
          )}
        </section>

        <section className="portal-panel plan-panel" aria-labelledby="plan-heading">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Execução</p>
              <h2 id="plan-heading">Plano de melhoria</h2>
            </div>
            <a href={`/app/plano-de-melhoria?${query}`}>Gerenciar</a>
          </div>
          {dashboard.plan ? (
            <>
              <div className="plan-progress-number">
                <strong>
                  {dashboard.plan.progress === null ? '—' : `${dashboard.plan.progress}%`}
                </strong>
                <span>{dashboard.plan.title}</span>
              </div>
              <div className="score-bar" aria-hidden="true">
                <span style={{ width: `${dashboard.plan.progress ?? 0}%` }} />
              </div>
              <div className="plan-stats">
                <span>{dashboard.plan.completedTasks} concluídas</span>
                <span>{dashboard.plan.totalTasks} tarefas elegíveis</span>
              </div>
            </>
          ) : (
            <div className="compact-empty">
              <strong>Sem plano ativo</strong>
              <p>Transforme recomendações aprovadas em tarefas administrativas.</p>
            </div>
          )}
        </section>

        <section className="portal-panel relationship-panel" aria-labelledby="specialist-heading">
          <p className="eyebrow">Continuidade</p>
          <h2 id="specialist-heading">Especialista de Relacionamento</h2>
          {dashboard.specialist.availability === 'available' ? (
            <>
              <div className="specialist-identity">
                <span aria-hidden="true">
                  {dashboard.specialist.display_name?.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <strong>{dashboard.specialist.display_name}</strong>
                  <small>Responsável pela evolução da operação</small>
                </div>
              </div>
              <a className="quiet-button" href={`/app/solicitacoes?${query}&category=meeting`}>
                Solicitar alinhamento
              </a>
            </>
          ) : (
            <div className="compact-empty">
              <strong>Especialista ainda não atribuído</strong>
              <p>O Portal não exibirá contato ou SLA inexistente.</p>
            </div>
          )}
        </section>
      </div>

      <section className="source-status-section" aria-labelledby="sources-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Confiança dos dados</p>
            <h2 id="sources-heading">O que alimenta esta visão</h2>
          </div>
          <a href={`/app/integracoes?${query}`}>Detalhes das integrações</a>
        </div>
        <div className="source-status-grid">
          {dashboard.sources.map((source) => (
            <article key={source.key}>
              <span className={`source-dot ${source.availability}`} aria-hidden="true" />
              <div>
                <strong>{source.label}</strong>
                <small>{availabilityLabel(source.availability)}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function availabilityLabel(value: string): string {
  const labels: Record<string, string> = {
    handled_externally: 'Operado pela Helena',
    module_not_available: 'Módulo futuro',
    source_blocked: 'Fonte bloqueada',
    source_not_configured: 'Fonte não configurada',
    stale: 'Atualização atrasada',
  };
  return labels[value] ?? 'Disponível';
}
