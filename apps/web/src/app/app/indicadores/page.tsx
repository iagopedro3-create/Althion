import { ScoreTrend } from '@/components/portal/score-trend';
import { fetchPortalIndicators } from '@/lib/api/portal';
import { requirePortalPage } from '@/lib/portal-page';
import { portalQuery } from '@/lib/portal-context';

const DIMENSIONS: Record<string, string> = {
  attendance: 'Comparecimento',
  continuity: 'Continuidade',
  conversion: 'Conversão',
  data_intelligence: 'Inteligência de dados',
  occupancy: 'Ocupação',
  recovery: 'Recuperação',
  retention: 'Retenção',
  speed: 'Velocidade',
};

export default async function IndicatorsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const { context, token } = await requirePortalPage(searchParams);
  const result = await fetchPortalIndicators(token, context);

  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Indicadores</p>
          <h1>Movimento, componentes e evidências.</h1>
          <p className="lead-copy">
            A leitura preserva fórmula, cobertura, período, numerador e denominador de cada
            dimensão.
          </p>
        </div>
        <a className="quiet-button" href={`/app?${portalQuery(context)}`}>
          Voltar à visão geral
        </a>
      </header>

      {result.kind === 'success' ? (
        <>
          <ScoreTrend
            points={result.data.history
              .flatMap((item) =>
                item.status === 'calculated' && item.scoreValue !== null
                  ? [
                      {
                        calculatedAt: item.calculatedAt,
                        coverage: item.coverage,
                        id: item.id,
                        scoreValue: item.scoreValue,
                      },
                    ]
                  : [],
              )
              .reverse()}
          />
          {result.data.latest ? (
            <>
              <section aria-labelledby="dimension-heading">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Diagnóstico</p>
                    <h2 id="dimension-heading">Dimensões do Score</h2>
                    <p>
                      {formatDate(result.data.latest.periodStart)} a{' '}
                      {formatDate(result.data.latest.periodEnd)} · fórmula{' '}
                      {result.data.latest.formula.version}
                    </p>
                  </div>
                </div>
                <div className="score-grid">
                  {result.data.latest.components.map((component) => (
                    <article className="score-card" key={component.id}>
                      <div className="score-card-heading">
                        <h3>{DIMENSIONS[component.dimension] ?? component.dimension}</h3>
                        <span>Peso {component.weight}%</span>
                      </div>
                      <strong>
                        {component.score_value === null ? 'Sem dados' : `${component.score_value}%`}
                      </strong>
                      <div className="score-bar" aria-hidden="true">
                        <span style={{ width: `${component.score_value ?? 0}%` }} />
                      </div>
                      <small>
                        Contribuição:{' '}
                        {component.contribution === null ? 'não calculada' : component.contribution}
                      </small>
                    </article>
                  ))}
                </div>
              </section>

              <section className="portal-panel evidence-panel" aria-labelledby="evidence-heading">
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Lineage</p>
                    <h2 id="evidence-heading">Evidências utilizadas</h2>
                  </div>
                </div>
                <div className="responsive-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Métrica</th>
                        <th>Numerador</th>
                        <th>Denominador</th>
                        <th>Resultado</th>
                        <th>Fonte</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.data.latest.evidence.map((evidence) => (
                        <tr key={evidence.metric_code}>
                          <td>{evidence.metric_code.replaceAll('_', ' ')}</td>
                          <td>{evidence.numerator ?? '—'}</td>
                          <td>{evidence.denominator ?? '—'}</td>
                          <td>
                            {evidence.normalized_value === null
                              ? 'Sem dados'
                              : `${evidence.normalized_value}%`}
                          </td>
                          <td>
                            {evidence.source === 'manual' ? 'Entrada manual' : 'Indisponível'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <section className="state-card">
              <h2>Sem indicadores calculados</h2>
              <p>Envie o primeiro Radar para formar a linha de base.</p>
            </section>
          )}
        </>
      ) : (
        <section className="state-card danger">
          <h2>Indicadores indisponíveis</h2>
          <p>O Portal não recebeu uma resposta autorizada e válida da API.</p>
        </section>
      )}
    </main>
  );
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  );
