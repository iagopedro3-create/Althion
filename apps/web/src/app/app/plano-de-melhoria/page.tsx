import { PlanForm } from '@/components/improvement-plans/plan-form';
import { TaskForm } from '@/components/improvement-plans/task-form';
import { PlanActions, TaskActions } from '@/components/improvement-plans/workflow-actions';
import { fetchPrincipal } from '@/lib/api/principal';
import { fetchImprovementPlan, fetchPortalPeople } from '@/lib/api/portal';
import { requirePortalPage } from '@/lib/portal-page';
import { getPortalPermissions } from '@/lib/portal-permissions';
import { portalQuery } from '@/lib/portal-context';

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  archived: 'Arquivado',
  blocked: 'Bloqueada',
  cancelled: 'Cancelada',
  completed: 'Concluída',
  draft: 'Rascunho',
  in_progress: 'Em andamento',
  todo: 'A fazer',
};

export default async function ImprovementPlanPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const { context, token } = await requirePortalPage(searchParams);
  const [result, people, principal] = await Promise.all([
    fetchImprovementPlan(token, context),
    fetchPortalPeople(token, context),
    fetchPrincipal(token),
  ]);
  const permissions = getPortalPermissions(
    principal.kind === 'success' ? principal.principal : null,
    context,
  );
  const query = portalQuery(context);

  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Plano de melhoria</p>
          <h1>Da recomendação à execução administrativa.</h1>
          <p className="lead-copy">
            Responsáveis, prazos e mudanças de estado permanecem rastreáveis.
          </p>
        </div>
        <a className="quiet-button" href={`/app?${query}`}>
          Voltar à visão geral
        </a>
      </header>

      {result.kind !== 'success' ? (
        <section className="state-card danger">
          <h2>Plano indisponível</h2>
          <p>Não foi possível consultar o plano dentro do escopo autorizado.</p>
        </section>
      ) : result.data.plan ? (
        <>
          <section className="plan-hero">
            <div>
              <p className="eyebrow">
                Versão {result.data.plan.version} · {STATUS_LABELS[result.data.plan.status]}
              </p>
              <h2>{result.data.plan.title}</h2>
              <p>
                {result.data.plan.period_start && result.data.plan.period_end
                  ? `${formatDateOnly(result.data.plan.period_start)} a ${formatDateOnly(result.data.plan.period_end)}`
                  : 'Plano sem período fechado'}
              </p>
            </div>
            <div className="plan-progress-number">
              <strong>{result.data.progress === null ? '—' : `${result.data.progress}%`}</strong>
              <span>tarefas elegíveis concluídas</span>
            </div>
            {permissions.canManagePlan ? (
              <PlanActions
                context={context}
                planId={result.data.plan.id}
                status={result.data.plan.status}
              />
            ) : null}
          </section>

          <section aria-labelledby="tasks-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Próximas ações</p>
                <h2 id="tasks-heading">Tarefas do plano</h2>
              </div>
              <span className="data-chip">{result.data.tasks.length} registradas</span>
            </div>
            {result.data.tasks.length ? (
              <div className="task-list">
                {result.data.tasks.map((task) => {
                  const assignee =
                    people.kind === 'success'
                      ? people.data.find((person) => person.profile_id === task.assignee_profile_id)
                      : null;
                  return (
                    <article key={task.id}>
                      <div className={`task-status ${task.status}`} aria-hidden="true" />
                      <div className="task-content">
                        <div>
                          <span className={`priority ${task.priority}`}>{task.priority}</span>
                          <h3>{task.title}</h3>
                        </div>
                        <p>
                          {assignee
                            ? `Responsável: ${assignee.display_name}`
                            : 'Sem responsável atribuído'}{' '}
                          · {task.due_at ? `Prazo ${formatDate(task.due_at)}` : 'Sem prazo'}
                        </p>
                      </div>
                      <div>
                        <strong>{STATUS_LABELS[task.status]}</strong>
                        {permissions.canManagePlan ? (
                          <TaskActions context={context} status={task.status} taskId={task.id} />
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="state-card">
                <h2>Plano sem tarefas</h2>
                <p>Adicione ações administrativas pequenas e verificáveis.</p>
              </div>
            )}
          </section>

          {permissions.canManagePlan && ['draft', 'active'].includes(result.data.plan.status) ? (
            <section className="creation-panel always-open">
              <h2>Adicionar tarefa</h2>
              <TaskForm
                context={context}
                people={people.kind === 'success' ? people.data : []}
                planId={result.data.plan.id}
              />
            </section>
          ) : null}

          <section className="portal-panel" aria-labelledby="plan-history-heading">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Histórico</p>
                <h2 id="plan-history-heading">Evolução do plano</h2>
              </div>
            </div>
            <ol className="status-history">
              {result.data.history.map((event) => (
                <li key={event.id}>
                  <span aria-hidden="true" />
                  <div>
                    <strong>{STATUS_LABELS[event.to_status]}</strong>
                    <time dateTime={event.changed_at}>{formatDate(event.changed_at)}</time>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </>
      ) : permissions.canManagePlan ? (
        <section className="creation-panel always-open">
          <p className="eyebrow">Primeiro plano</p>
          <h2>Crie uma estrutura de execução</h2>
          <p>O plano começa como rascunho e só se torna ativo após uma transição explícita.</p>
          <PlanForm context={context} />
        </section>
      ) : (
        <section className="state-card">
          <h2>Sem plano disponível</h2>
          <p>Seu perfil possui leitura, mas ainda não existe um plano nesta clínica.</p>
        </section>
      )}
    </main>
  );
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
const formatDateOnly = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  );
