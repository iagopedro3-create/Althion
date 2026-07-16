import { fetchPortalOpportunities } from '@/lib/api/portal';
import { requirePortalPage } from '@/lib/portal-page';
import { portalQuery } from '@/lib/portal-context';

const PRIORITIES = { high: 'Alta', low: 'Baixa', medium: 'Média' } as const;

export default async function OpportunitiesPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const { context, token } = await requirePortalPage(searchParams);
  const result = await fetchPortalOpportunities(token, context);
  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Oportunidades administrativas</p>
          <h1>Recomendações sustentadas pelo Radar.</h1>
          <p className="lead-copy">
            Esta lista aponta onde agir. Ela não representa contato executado, agenda recuperada ou
            impacto financeiro.
          </p>
        </div>
        <a className="quiet-button" href={`/app?${portalQuery(context)}`}>
          Voltar à visão geral
        </a>
      </header>

      <section className="scope-disclaimer" role="note">
        <strong>Fonte: Althion Radar</strong>
        <span>
          Recovery Engine ainda não iniciado · nenhuma automação ou contato foi executado.
        </span>
      </section>

      {result.kind === 'success' && result.data.items.length ? (
        <div className="opportunity-catalog">
          {result.data.items.map((item, index) => (
            <article key={item.id}>
              <div className="opportunity-number">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <span className={`priority ${item.priority}`}>{PRIORITIES[item.priority]}</span>
                <h2>{item.title}</h2>
                <p>{item.rationale}</p>
                <dl>
                  <div>
                    <dt>Dimensão</dt>
                    <dd>{item.dimension?.replaceAll('_', ' ') ?? 'Geral'}</dd>
                  </div>
                  <div>
                    <dt>Evidência</dt>
                    <dd>
                      {(item.evidenceMetricCode ?? item.evidence_metric_code)?.replaceAll(
                        '_',
                        ' ',
                      ) ?? 'Cobertura do Radar'}
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      ) : result.kind === 'success' ? (
        <section className="state-card">
          <h2>Nenhuma recomendação disponível</h2>
          <p>Conclua um diagnóstico ou revise se os dados do período foram suficientes.</p>
        </section>
      ) : (
        <section className="state-card danger">
          <h2>Oportunidades indisponíveis</h2>
          <p>Não foi possível consultar as recomendações autorizadas.</p>
        </section>
      )}
    </main>
  );
}
