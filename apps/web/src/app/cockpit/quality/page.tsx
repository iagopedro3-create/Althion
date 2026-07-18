import { redirect } from 'next/navigation';

import {
  fetchQualityRubrics,
  fetchQualityEvaluations,
  fetchQualityClinicalFlags,
} from '@/lib/api/quality';
import { parsePortalContext, portalQuery } from '@/lib/portal-context';
import { first } from '@/lib/portal-page';
import { createClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/components/cockpit/labels';
import {
  EvaluateForm,
  FlagClinicalForm,
  ResolveFlagForm,
} from '@/components/quality/quality-controls';

export const dynamic = 'force-dynamic';

export default async function QualityPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const query = await searchParams;
  const context = parsePortalContext({
    clinicId: first(query.clinicId),
    organizationId: first(query.organizationId),
  });
  if (!context) redirect('/cockpit');

  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) redirect('/entrar');

  const [rubricsRes, evaluationsRes, flagsRes] = await Promise.all([
    fetchQualityRubrics(data.session.access_token, context),
    fetchQualityEvaluations(data.session.access_token, context),
    fetchQualityClinicalFlags(data.session.access_token, context),
  ]);

  if (
    rubricsRes.kind === 'denied' ||
    evaluationsRes.kind === 'denied' ||
    flagsRes.kind === 'denied'
  ) {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card danger">
          <h1>Acesso negado</h1>
          <p>Seu perfil não possui acesso ao Quality Engine desta conta.</p>
          <a className="quiet-button" href="/cockpit">
            Voltar à carteira
          </a>
        </section>
      </main>
    );
  }

  if (
    rubricsRes.kind === 'not_found' ||
    evaluationsRes.kind === 'not_found' ||
    flagsRes.kind === 'not_found'
  ) {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card">
          <h1>Quality Engine ainda não disponível</h1>
          <p>O Quality Engine ainda não foi habilitado neste ambiente.</p>
        </section>
      </main>
    );
  }

  if (
    rubricsRes.kind !== 'success' ||
    evaluationsRes.kind !== 'success' ||
    flagsRes.kind !== 'success'
  ) {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card danger">
          <h1>Quality Engine indisponível</h1>
          <p>Não foi possível consultar os dados de qualidade. Tente novamente.</p>
        </section>
      </main>
    );
  }

  const rubrics = rubricsRes.data;
  const evaluations = evaluationsRes.data;
  const flags = flagsRes.data;

  // Active rubric or fallback to v1 provisional
  const activeRubric = rubrics.find((r) => r.is_active) ?? rubrics[0];
  const criteria = activeRubric
    ? activeRubric.criteria
    : [
        {
          id: 'response_time',
          name: 'Tempo de resposta',
          description: 'Agilidade no atendimento',
          maxScore: 5,
        },
        {
          id: 'tone_empathy',
          name: 'Tom e empatia',
          description: 'Cortesia e profissionalismo',
          maxScore: 5,
        },
        {
          id: 'opportunity_id',
          name: 'Identificação de oportunidade',
          description: 'Mapear a necessidade do lead',
          maxScore: 5,
        },
        {
          id: 'compliance',
          name: 'Conformidade de roteiro',
          description: 'Uso de termos corretos',
          maxScore: 5,
        },
        {
          id: 'operational_sanity',
          name: 'Sanidade operacional',
          description: 'Ausência de promessas sem base',
          maxScore: 5,
        },
      ];

  const rubricVersion = activeRubric ? activeRubric.version : '1.0.0-provisional';

  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Quality Engine · ambiente de simulação e qualidade</p>
          <h1>Avaliação de Qualidade e Guardrail Clínico</h1>
          <p className="lead-copy">
            Analise interações administrativas, atribua notas de conformidade e revise flags
            clínicos de urgência.
          </p>
        </div>
        <a className="quiet-button" href={`/cockpit/conta?${portalQuery(context)}`}>
          Voltar à conta
        </a>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section className="state-card" aria-label="Avaliar Conversa">
            <h2>Nova Avaliação de Conversa</h2>
            <p className="lead-copy" style={{ marginBottom: '16px' }}>
              Rubrica ativa: <strong>{activeRubric?.title ?? 'Rubrica Padrão'}</strong> (v
              {rubricVersion})
            </p>
            <EvaluateForm context={context} rubricVersion={rubricVersion} criteria={criteria} />
          </section>

          <section className="state-card" aria-label="Sinalizar Conteúdo Clínico">
            <h2>Sinalizar Flag Clínico Manual</h2>
            <p className="lead-copy" style={{ marginBottom: '16px' }}>
              Se notar que o paciente está tentando obter diagnóstico ou prescrição médica, sinalize
              para handoff clínico.
            </p>
            <FlagClinicalForm context={context} />
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section className="state-card" aria-label="Handoffs Clínicos">
            <h2>
              Handoffs Clínicos em Aberto ({flags.filter((f) => f.status !== 'resolved').length})
            </h2>
            {flags.filter((f) => f.status !== 'resolved').length === 0 ? (
              <p>Nenhuma conversa pendente de resolução clínica no momento.</p>
            ) : (
              <ul
                className="cockpit-incident-list"
                style={{ display: 'grid', gap: '16px', listStyle: 'none', padding: 0 }}
              >
                {flags
                  .filter((f) => f.status !== 'resolved')
                  .map((flag) => (
                    <li
                      key={flag.id}
                      className="cockpit-incident-item warning"
                      style={{
                        padding: '16px',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        background: 'var(--surface)',
                      }}
                    >
                      <header
                        style={{
                          display: 'flex',
                          justifyContent: 'between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <span className="badge warning">Pendente</span>
                        <strong style={{ marginLeft: '8px' }}>
                          Conversa: {flag.conversation_id}
                        </strong>
                      </header>
                      <p style={{ color: 'var(--text)', margin: '8px 0' }}>{flag.flag_reason}</p>
                      <small
                        style={{ color: 'var(--muted)', display: 'block', marginBottom: '12px' }}
                      >
                        Sinalizado em: {formatDateTime(flag.flagged_at)}
                      </small>
                      <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                        <ResolveFlagForm context={context} flagId={flag.id} />
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </section>

          <section className="state-card" aria-label="Avaliações Realizadas">
            <h2>Últimas Avaliações ({evaluations.length})</h2>
            {evaluations.length === 0 ? (
              <p>Nenhuma avaliação cadastrada ainda.</p>
            ) : (
              <ul className="cockpit-sla-list" style={{ display: 'grid', gap: '12px' }}>
                {evaluations.map((evalItem) => (
                  <li
                    key={evalItem.id}
                    style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: '600',
                      }}
                    >
                      <span>Conversa: {evalItem.conversation_id}</span>
                      <span className="badge success">{evalItem.total_score}%</span>
                    </div>
                    {evalItem.feedback ? (
                      <p
                        style={{
                          margin: 0,
                          fontStyle: 'italic',
                          fontSize: '0.9rem',
                          color: 'var(--muted)',
                        }}
                      >
                        "{evalItem.feedback}"
                      </p>
                    ) : null}
                    <small style={{ color: 'var(--muted)' }}>
                      Avaliado em: {formatDateTime(evalItem.created_at)} (Rubrica v
                      {evalItem.rubric_version})
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
