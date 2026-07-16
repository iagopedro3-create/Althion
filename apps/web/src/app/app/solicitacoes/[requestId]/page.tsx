import { RequestTransitions } from '@/components/requests/request-transitions';
import { fetchPrincipal } from '@/lib/api/principal';
import { fetchPortalRequest } from '@/lib/api/portal';
import { requirePortalPage } from '@/lib/portal-page';
import { getPortalPermissions } from '@/lib/portal-permissions';
import { portalQuery } from '@/lib/portal-context';

const LABELS: Record<string, string> = {
  acknowledged: 'Recebida',
  closed: 'Encerrada',
  in_progress: 'Em andamento',
  open: 'Aberta',
  resolved: 'Resolvida',
  waiting_customer: 'Aguardando cliente',
};

export default async function RequestDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ requestId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const [{ requestId }, page] = await Promise.all([params, requirePortalPage(searchParams)]);
  const [result, principal] = await Promise.all([
    fetchPortalRequest(page.token, page.context, requestId),
    fetchPrincipal(page.token),
  ]);
  const permissions = getPortalPermissions(
    principal.kind === 'success' ? principal.principal : null,
    page.context,
  );
  const query = portalQuery(page.context);

  if (result.kind !== 'success') {
    return (
      <main className="portal-main">
        <section className="state-card danger">
          <h1>Solicitação não disponível</h1>
          <p>O registro não existe ou não pertence ao seu escopo.</p>
          <a href={`/app/solicitacoes?${query}`}>Voltar</a>
        </section>
      </main>
    );
  }
  const item = result.data.request;
  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Solicitação · {LABELS[item.status]}</p>
          <h1>{item.subject}</h1>
          <p className="lead-copy">Prioridade operacional: {item.priority}</p>
        </div>
        <a className="quiet-button" href={`/app/solicitacoes?${query}`}>
          Voltar às solicitações
        </a>
      </header>
      <section className="request-detail-panel">
        <div className="request-content">
          <h2>Contexto administrativo</h2>
          <p>{item.details}</p>
          <small>Este conteúdo não é processado por IA e não deve conter dados clínicos.</small>
        </div>
        <dl className="request-facts">
          <div>
            <dt>Categoria</dt>
            <dd>{item.category.replaceAll('_', ' ')}</dd>
          </div>
          <div>
            <dt>Criada em</dt>
            <dd>{formatDate(item.created_at)}</dd>
          </div>
          <div>
            <dt>Atualizada em</dt>
            <dd>{formatDate(item.updated_at)}</dd>
          </div>
        </dl>
        {permissions.canManageRequest ? (
          <RequestTransitions context={page.context} requestId={item.id} status={item.status} />
        ) : null}
      </section>
      <section className="portal-panel" aria-labelledby="history-heading">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Auditoria operacional</p>
            <h2 id="history-heading">Histórico de estados</h2>
          </div>
        </div>
        <ol className="status-history">
          {result.data.history.map((event) => (
            <li key={event.id}>
              <span aria-hidden="true" />
              <div>
                <strong>{LABELS[event.to_status]}</strong>
                <time dateTime={event.changed_at}>{formatDate(event.changed_at)}</time>
                {event.reason_code ? <small>{event.reason_code.replaceAll('_', ' ')}</small> : null}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
