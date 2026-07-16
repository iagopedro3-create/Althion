import { fetchPortalDashboard } from '@/lib/api/portal';
import { requirePortalPage } from '@/lib/portal-page';
import { portalQuery } from '@/lib/portal-context';

const LABELS: Record<string, string> = {
  active: 'Ativa',
  blocked: 'Bloqueada',
  connecting: 'Conectando',
  disabled: 'Desativada',
  error: 'Com erro',
};

const AVAILABILITY_LABELS: Record<string, string> = {
  available: 'Disponível',
  module_not_available: 'Módulo futuro',
  source_blocked: 'Fonte bloqueada',
  source_not_configured: 'Fonte não configurada',
  stale: 'Atualização atrasada',
};

export default async function IntegrationsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const { context, token } = await requirePortalPage(searchParams);
  const result = await fetchPortalDashboard(token, context);
  const query = portalQuery(context);
  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Integrações</p>
          <h1>Estado real das fontes.</h1>
          <p className="lead-copy">
            Conexões bloqueadas ou ausentes permanecem explícitas. Nenhum endpoint Helena é
            simulado.
          </p>
        </div>
        <a className="quiet-button" href={`/app?${query}`}>
          Voltar à visão geral
        </a>
      </header>
      {result.kind === 'success' ? (
        <>
          <div className="integration-grid">
            {result.data.integrations.map((integration) => (
              <article key={integration.provider}>
                <div className="integration-heading">
                  <span className={`source-dot ${integration.availability}`} aria-hidden="true" />
                  <div>
                    <h2>
                      {integration.provider === 'helena' ? 'Helena CRM' : integration.provider}
                    </h2>
                    <p>{LABELS[integration.status] ?? integration.status}</p>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>Último sucesso</dt>
                    <dd>
                      {integration.lastSuccessAt
                        ? formatDate(integration.lastSuccessAt)
                        : 'Nunca sincronizado'}
                    </dd>
                  </div>
                  <div>
                    <dt>Código sanitizado</dt>
                    <dd>{integration.lastErrorCode ?? 'Nenhum'}</dd>
                  </div>
                </dl>
                {integration.status === 'blocked' ? (
                  <p className="integration-note">
                    Aguardando documentação real, credenciais de sandbox e contrato de integração.
                  </p>
                ) : null}
              </article>
            ))}
          </div>
          <section className="source-status-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Cobertura futura</p>
                <h2>Fontes ainda indisponíveis</h2>
              </div>
            </div>
            <div className="source-status-grid">
              {result.data.sources.map((source) => (
                <article key={source.key}>
                  <span className={`source-dot ${source.availability}`} aria-hidden="true" />
                  <div>
                    <strong>{source.label}</strong>
                    <small>
                      {AVAILABILITY_LABELS[source.availability] ?? 'Estado indisponível'}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="state-card danger">
          <h2>Integrações indisponíveis</h2>
          <p>Não foi possível carregar o estado sanitizado.</p>
        </section>
      )}
    </main>
  );
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
