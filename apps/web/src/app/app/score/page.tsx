import { redirect } from 'next/navigation';

import { fetchScoreComparison, fetchScores } from '@/lib/api/radar';
import { parseRadarContext, radarQuery } from '@/lib/radar-context';
import { createClient } from '@/lib/supabase/server';

export default async function ScoreHistoryPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const query = await searchParams;
  const context = parseRadarContext({
    clinicId: Array.isArray(query.clinicId) ? query.clinicId[0] : query.clinicId,
    organizationId: Array.isArray(query.organizationId)
      ? query.organizationId[0]
      : query.organizationId,
  });
  if (!context) redirect('/app');
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) redirect('/entrar');
  const result = await fetchScores(
    data.session.access_token,
    context.organizationId,
    context.clinicId,
  );
  const comparison =
    result.kind === 'success' && result.data.length >= 2
      ? await fetchScoreComparison(
          data.session.access_token,
          context.organizationId,
          context.clinicId,
          result.data[0]!.id,
          result.data[1]!.id,
        )
      : null;

  return (
    <main className="portal-main">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Histórico</p>
          <h1>Althion Score ao longo do tempo.</h1>
          <p className="lead-copy">
            Cada resultado preserva inputs, fórmula e cobertura do momento do cálculo.
          </p>
        </div>
        <a className="quiet-button" href={`/app/radar?${radarQuery(context)}`}>
          Voltar ao Radar
        </a>
      </div>
      {comparison?.kind === 'success' ? (
        <section className="comparison-panel" aria-labelledby="comparison-heading">
          <div>
            <p className="eyebrow">Comparação mais recente</p>
            <h2 id="comparison-heading">Mudança por dimensão</h2>
            <p>
              {comparison.data.periodComparable
                ? 'Períodos com duração equivalente.'
                : 'Períodos diferentes: interprete as variações com cautela.'}
            </p>
          </div>
          <div className="comparison-grid">
            {comparison.data.componentChanges.map((change) => (
              <article key={change.dimension}>
                <span>{change.dimension.replaceAll('_', ' ')}</span>
                <strong>
                  {change.delta === null ? '—' : `${change.delta > 0 ? '+' : ''}${change.delta}`}
                </strong>
              </article>
            ))}
          </div>
          {comparison.data.formulaChanged ? (
            <p className="comparison-warning">
              As fórmulas são diferentes; os valores não são diretamente comparáveis.
            </p>
          ) : null}
        </section>
      ) : null}
      {result.kind === 'success' && result.data.length ? (
        <section className="score-timeline">
          {result.data.map((score) => (
            <a
              className="timeline-item"
              href={`/app/score/${score.id}?${radarQuery(context)}`}
              key={score.id}
            >
              <time dateTime={score.calculated_at}>
                {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(
                  new Date(score.calculated_at),
                )}
              </time>
              <strong>
                {score.status === 'calculated' ? `${score.score_value}/100` : 'Dados insuficientes'}
              </strong>
              <span>{score.coverage}% de cobertura</span>
            </a>
          ))}
        </section>
      ) : result.kind === 'success' ? (
        <section className="state-card">
          <h2>Sem histórico</h2>
          <p>Envie um diagnóstico do Radar para criar o primeiro snapshot.</p>
        </section>
      ) : (
        <section className="state-card danger">
          <h2>Histórico indisponível</h2>
          <p>Não foi possível carregar os Scores.</p>
        </section>
      )}
    </main>
  );
}
