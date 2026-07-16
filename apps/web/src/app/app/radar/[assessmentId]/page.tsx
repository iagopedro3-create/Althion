import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

import { SubmitRadarButton } from '@/components/radar/submit-radar-button';
import { fetchRadarAssessment, fetchRadarPreview } from '@/lib/api/radar';
import { parseRadarContext, radarQuery } from '@/lib/radar-context';
import { createClient } from '@/lib/supabase/server';

export default async function RadarDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ assessmentId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const { assessmentId } = await params;
  if (!z.uuid().safeParse(assessmentId).success) notFound();
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

  const result = await fetchRadarAssessment(
    data.session.access_token,
    context.organizationId,
    context.clinicId,
    assessmentId,
  );
  if (result.kind === 'not_found') notFound();
  if (result.kind !== 'success') {
    return (
      <main className="portal-main">
        <section className="state-card danger">
          <h1>Diagnóstico indisponível</h1>
          <p>Verifique seu acesso e tente novamente.</p>
        </section>
      </main>
    );
  }
  const preview =
    result.data.status === 'draft'
      ? await fetchRadarPreview(
          data.session.access_token,
          context.organizationId,
          context.clinicId,
          assessmentId,
        )
      : null;

  return (
    <main className="portal-main">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Radar · {result.data.status === 'draft' ? 'Rascunho' : 'Concluído'}
          </p>
          <h1>
            {result.data.period_start} → {result.data.period_end}
          </h1>
          <p className="lead-copy">
            {result.data.metrics.length} dimensões informadas · fonte manual declarada.
          </p>
        </div>
        <div className="button-row">
          <a
            className="quiet-button"
            href={`/app/radar/${assessmentId}/export.csv?${radarQuery(context)}`}
          >
            Exportar CSV
          </a>
          {result.data.status === 'draft' ? (
            <a
              className="quiet-button"
              href={`/app/radar/${assessmentId}/editar?${radarQuery(context)}`}
            >
              Editar
            </a>
          ) : null}
        </div>
      </div>

      {preview?.kind === 'success' ? (
        <section className="preview-panel">
          <div>
            <p className="eyebrow">Prévia provisória</p>
            <h2>
              {preview.data.status === 'calculated'
                ? `${preview.data.score}/100`
                : 'Dados insuficientes'}
            </h2>
            <p>{preview.data.coverage}% de cobertura. A prévia não cria histórico.</p>
          </div>
          {result.data.status === 'draft' ? (
            <SubmitRadarButton assessmentId={assessmentId} context={context} />
          ) : null}
        </section>
      ) : null}

      <section className="metric-review" aria-label="Dados informados">
        {result.data.metrics.map((metric) => (
          <article className="metric-review-card" key={metric.id}>
            <h2>{metric.metric_code.replaceAll('_', ' ')}</h2>
            <strong>
              {metric.numerator} / {metric.denominator}
            </strong>
            <p>
              Fonte {metric.source} · qualidade {metric.quality}
            </p>
          </article>
        ))}
      </section>

      {result.data.status === 'submitted' && result.data.score ? (
        <a
          className="primary-link"
          href={`/app/score/${result.data.score.id}?${radarQuery(context)}`}
        >
          Abrir Score e recomendações
        </a>
      ) : preview?.kind !== 'success' ? (
        <section className="state-card warning">
          <h2>Prévia indisponível</h2>
          <p>
            Os dados foram preservados. O cálculo pode ser retomado quando a API estiver disponível.
          </p>
        </section>
      ) : null}
    </main>
  );
}
