import { RequestForm } from '@/components/requests/request-form';
import { fetchPrincipal } from '@/lib/api/principal';
import { fetchPortalRequests } from '@/lib/api/portal';
import { first, requirePortalPage } from '@/lib/portal-page';
import { getPortalPermissions } from '@/lib/portal-permissions';
import { portalQuery } from '@/lib/portal-context';

const STATUS_LABELS: Record<string, string> = {
  acknowledged: 'Recebida',
  closed: 'Encerrada',
  in_progress: 'Em andamento',
  open: 'Aberta',
  resolved: 'Resolvida',
  waiting_customer: 'Aguardando cliente',
};

export default async function RequestsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const { context, query, token } = await requirePortalPage(searchParams);
  const category = first(query.category);
  const cursor = first(query.cursor);
  const status = first(query.status);
  const filters = {
    ...(category ? { category } : {}),
    ...(cursor ? { cursor } : {}),
    ...(status ? { status } : {}),
  };
  const [result, principal] = await Promise.all([
    fetchPortalRequests(token, context, filters),
    fetchPrincipal(token),
  ]);
  const permissions = getPortalPermissions(
    principal.kind === 'success' ? principal.principal : null,
    context,
  );
  const baseQuery = portalQuery(context);

  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Solicitações</p>
          <h1>Acompanhamento sem ruído operacional.</h1>
          <p className="lead-copy">
            Cada mudança de estado é idempotente, auditada e preservada no histórico.
          </p>
        </div>
        <a className="quiet-button" href={`/app?${baseQuery}`}>
          Voltar à visão geral
        </a>
      </header>

      {permissions.canCreateRequest ? (
        <details className="creation-panel" open={first(query.category) === 'meeting'}>
          <summary>Nova solicitação</summary>
          <RequestForm context={context} {...(category ? { defaultCategory: category } : {})} />
        </details>
      ) : null}

      <section aria-labelledby="request-list-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Histórico</p>
            <h2 id="request-list-heading">Solicitações visíveis</h2>
          </div>
          <form className="inline-filters">
            <input name="organizationId" type="hidden" value={context.organizationId} />
            <input name="clinicId" type="hidden" value={context.clinicId} />
            <select
              aria-label="Filtrar por estado"
              defaultValue={filters.status ?? ''}
              name="status"
            >
              <option value="">Todos os estados</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button type="submit">Aplicar</button>
          </form>
        </div>

        {result.kind === 'success' && result.data.items.length ? (
          <div className="request-list">
            {result.data.items.map((item) => (
              <a href={`/app/solicitacoes/${item.id}?${baseQuery}`} key={item.id}>
                <div>
                  <span
                    className={`priority ${item.priority === 'urgent' ? 'high' : item.priority}`}
                  >
                    {item.priority}
                  </span>
                  <h3>{item.subject}</h3>
                </div>
                <div className="request-meta">
                  <span>{STATUS_LABELS[item.status]}</span>
                  <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                </div>
              </a>
            ))}
          </div>
        ) : result.kind === 'success' ? (
          <div className="state-card">
            <h2>Nenhuma solicitação</h2>
            <p>O histórico desta clínica está vazio para o filtro selecionado.</p>
          </div>
        ) : (
          <div className="state-card danger">
            <h2>Solicitações indisponíveis</h2>
            <p>Não foi possível carregar a lista autorizada.</p>
          </div>
        )}

        {result.kind === 'success' && result.data.nextCursor ? (
          <a
            className="quiet-button load-more"
            href={`/app/solicitacoes?${baseQuery}&cursor=${result.data.nextCursor}${filters.status ? `&status=${filters.status}` : ''}`}
          >
            Carregar mais
          </a>
        ) : null}
      </section>
    </main>
  );
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value));
