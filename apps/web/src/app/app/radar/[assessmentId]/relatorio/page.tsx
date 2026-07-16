import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

import { ScoreSummary } from '@/components/score/score-summary';
import { PrintButton } from '@/components/score/print-button';
import { fetchScore } from '@/lib/api/radar';
import { parseRadarContext } from '@/lib/radar-context';
import { createClient } from '@/lib/supabase/server';

export default async function RadarReportPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ assessmentId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const { assessmentId } = await params;
  const query = await searchParams;
  const scoreId = Array.isArray(query.scoreId) ? query.scoreId[0] : query.scoreId;
  if (!z.uuid().safeParse(assessmentId).success || !z.uuid().safeParse(scoreId).success) notFound();
  const context = parseRadarContext({
    clinicId: Array.isArray(query.clinicId) ? query.clinicId[0] : query.clinicId,
    organizationId: Array.isArray(query.organizationId)
      ? query.organizationId[0]
      : query.organizationId,
  });
  if (!context || !scoreId) redirect('/app');
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) redirect('/entrar');
  const result = await fetchScore(
    data.session.access_token,
    context.organizationId,
    context.clinicId,
    scoreId,
  );
  if (result.kind !== 'success' || result.data.assessment.id !== assessmentId) notFound();

  return (
    <main className="portal-main score-page report-page">
      <div className="report-header">
        <div>
          <span className="brand">
            <span className="brand-mark">A</span>
            <span>Althion</span>
          </span>
          <p>Relatório operacional administrativo</p>
        </div>
        <PrintButton />
      </div>
      <ScoreSummary detail={result.data} />
      <footer className="report-footer">
        <p>
          Fórmula {result.data.formula.version} · cobertura {result.data.score.coverage}%.
        </p>
        <p>Este relatório não contém avaliação clínica nem estimativa financeira.</p>
      </footer>
    </main>
  );
}
