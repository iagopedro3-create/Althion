import type { RadarAssessmentInput } from '@althion/contracts';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

import { RadarForm } from '@/components/radar/radar-form';
import { fetchRadarAssessment } from '@/lib/api/radar';
import { parseRadarContext } from '@/lib/radar-context';
import { createClient } from '@/lib/supabase/server';

export default async function EditRadarPage({
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
  if (result.kind !== 'success' || result.data.status !== 'draft') notFound();

  const initial: RadarAssessmentInput = {
    metrics: result.data.metrics.map((metric) => ({
      code: metric.metric_code as RadarAssessmentInput['metrics'][number]['code'],
      denominator: metric.denominator,
      numerator: metric.numerator,
      quality: metric.quality,
      source: metric.source,
    })),
    periodEnd: result.data.period_end,
    periodStart: result.data.period_start,
    unitId: result.data.unit_id,
  };

  return (
    <main className="portal-main form-page">
      <div>
        <p className="eyebrow">Editar rascunho</p>
        <h1>Revise os denominadores antes de calcular.</h1>
      </div>
      <RadarForm
        assessmentId={assessmentId}
        context={context}
        initial={initial}
        periodEnd={initial.periodEnd}
        periodStart={initial.periodStart}
      />
    </main>
  );
}
