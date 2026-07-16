import { redirect } from 'next/navigation';

import { fetchRadarAssessments } from '@/lib/api/radar';
import { parseRadarContext, radarQuery } from '@/lib/radar-context';
import { createClient } from '@/lib/supabase/server';

export default async function RadarPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
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
  const result = await fetchRadarAssessments(
    data.session.access_token,
    context.organizationId,
    context.clinicId,
  );

  return (
    <main className="portal-main">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Althion Radar</p>
          <h1>Onde a operação está perdendo oportunidades?</h1>
          <p className="lead-copy">Diagnósticos manuais, rastreáveis e sem inferência clínica.</p>
        </div>
        <a className="primary-button" href={`/app/radar/novo?${radarQuery(context)}`}>
          Novo diagnóstico
        </a>
      </div>

      {result.kind === 'success' && result.data.length ? (
        <section className="assessment-list" aria-label="Histórico de diagnósticos">
          {result.data.map((assessment) => (
            <a
              className="assessment-card"
              href={`/app/radar/${assessment.id}?${radarQuery(context)}`}
              key={assessment.id}
            >
              <div>
                <span className={`status-chip ${assessment.status}`}>
                  {assessment.status === 'draft' ? 'Rascunho' : 'Concluído'}
                </span>
                <h2>
                  {assessment.period_start} → {assessment.period_end}
                </h2>
                <p>Questionário {assessment.questionnaire_version}</p>
              </div>
              <div className="assessment-score">
                <strong>
                  {assessment.score?.status === 'calculated'
                    ? assessment.score.score_value
                    : assessment.score
                      ? 'Sem nota'
                      : '—'}
                </strong>
                <span>
                  {assessment.score
                    ? `${assessment.score.coverage}% cobertura`
                    : 'Aguardando envio'}
                </span>
              </div>
            </a>
          ))}
        </section>
      ) : result.kind === 'success' ? (
        <section className="state-card">
          <h2>Nenhum diagnóstico neste período</h2>
          <p>Comece com dados administrativos agregados. Não informe nomes ou dados clínicos.</p>
          <a className="primary-link" href={`/app/radar/novo?${radarQuery(context)}`}>
            Criar primeiro Radar
          </a>
        </section>
      ) : result.kind === 'denied' ? (
        <section className="state-card danger" role="alert">
          <h2>Acesso não autorizado</h2>
          <p>Esta clínica não está no seu escopo.</p>
        </section>
      ) : (
        <section className="state-card" role="status">
          <h2>Radar temporariamente indisponível</h2>
          <p>Tente novamente após a API e o banco estarem disponíveis.</p>
        </section>
      )}
    </main>
  );
}
