import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

import { ScoreSummary } from '@/components/score/score-summary';
import { fetchScore } from '@/lib/api/radar';
import { parseRadarContext, radarQuery } from '@/lib/radar-context';
import { createClient } from '@/lib/supabase/server';

export default async function ScoreDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ scoreId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const { scoreId } = await params;
  if (!z.uuid().safeParse(scoreId).success) notFound();
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
  const result = await fetchScore(
    data.session.access_token,
    context.organizationId,
    context.clinicId,
    scoreId,
  );
  if (result.kind === 'not_found') notFound();

  if (result.kind !== 'success') {
    return (
      <main className="portal-main">
        <section className="state-card danger">
          <h1>Score indisponível</h1>
          <p>Verifique o acesso ou tente novamente.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="portal-main score-page">
      <div className="button-row no-print">
        <a className="quiet-button" href={`/app/score?${radarQuery(context)}`}>
          Histórico
        </a>
        <a
          className="quiet-button"
          href={`/app/radar/${result.data.assessment.id}/relatorio?${radarQuery(context)}&scoreId=${scoreId}`}
        >
          Relatório
        </a>
      </div>
      <ScoreSummary detail={result.data} />
      <section aria-labelledby="evidence-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Rastreabilidade</p>
            <h2 id="evidence-heading">Evidências utilizadas</h2>
          </div>
        </div>
        <div className="evidence-table-wrapper">
          <table className="evidence-table">
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
              {result.data.evidence.map((evidence) => (
                <tr key={evidence.metric_code}>
                  <td>{evidence.metric_code.replaceAll('_', ' ')}</td>
                  <td>{evidence.numerator ?? '—'}</td>
                  <td>{evidence.denominator ?? '—'}</td>
                  <td>
                    {evidence.normalized_value === null
                      ? (evidence.reason_code ?? 'Sem dados')
                      : `${evidence.normalized_value}%`}
                  </td>
                  <td>{evidence.source ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
