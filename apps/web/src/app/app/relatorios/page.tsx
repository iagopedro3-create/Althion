import { fetchRadarAssessments } from '@/lib/api/radar';
import { requirePortalPage } from '@/lib/portal-page';
import { portalQuery } from '@/lib/portal-context';

export default async function ReportsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const { context, token } = await requirePortalPage(searchParams);
  const result = await fetchRadarAssessments(token, context.organizationId, context.clinicId);
  const submitted =
    result.kind === 'success' ? result.data.filter((item) => item.status === 'submitted') : [];
  const query = portalQuery(context);
  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Relatórios</p>
          <h1>Diagnósticos prontos para revisão.</h1>
          <p className="lead-copy">
            PDF é gerado pelo navegador; CSV permanece autorizado, sanitizado e auditado.
          </p>
        </div>
        <a className="quiet-button" href={`/app?${query}`}>
          Voltar à visão geral
        </a>
      </header>
      {result.kind === 'success' && submitted.length ? (
        <div className="report-catalog">
          {submitted.map((item) => (
            <article key={item.id}>
              <div>
                <span className="status-badge">Radar enviado</span>
                <h2>
                  {formatDate(item.period_start)} — {formatDate(item.period_end)}
                </h2>
                <p>
                  {item.score
                    ? item.score.status === 'calculated'
                      ? `Score ${item.score.score_value}/100 · ${item.score.coverage}% de cobertura`
                      : `Dados insuficientes · ${item.score.coverage}% de cobertura`
                    : 'Sem Score associado'}
                </p>
              </div>
              <div className="report-actions">
                <a href={`/app/radar/${item.id}/relatorio?${query}`}>Abrir relatório</a>
                <a href={`/app/radar/${item.id}/export.csv?${query}`}>Exportar CSV</a>
              </div>
            </article>
          ))}
        </div>
      ) : result.kind === 'success' ? (
        <section className="state-card">
          <h2>Sem relatórios</h2>
          <p>Envie um Radar para publicar o primeiro diagnóstico.</p>
        </section>
      ) : (
        <section className="state-card danger">
          <h2>Relatórios indisponíveis</h2>
          <p>Não foi possível consultar o catálogo.</p>
        </section>
      )}
    </main>
  );
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  );
