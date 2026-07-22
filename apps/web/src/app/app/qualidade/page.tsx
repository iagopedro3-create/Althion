import { redirect } from 'next/navigation';

import {
  fetchQualityRubrics,
  fetchQualityEvaluations,
  fetchQualityClinicalFlags,
} from '@/lib/api/quality';
import { parsePortalContext } from '@/lib/portal-context';
import { first } from '@/lib/portal-page';
import { createClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/components/cockpit/labels';
import { ResolveFlagForm } from '@/components/quality/quality-controls';

export const dynamic = 'force-dynamic';

export default async function ClientQualityPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const query = await searchParams;
  const context = parsePortalContext({
    clinicId: first(query.clinicId),
    organizationId: first(query.organizationId),
  });
  if (!context) redirect('/app');

  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) redirect('/entrar');

  const [rubricsRes, evaluationsRes, flagsRes] = await Promise.all([
    fetchQualityRubrics(data.session.access_token, context),
    fetchQualityEvaluations(data.session.access_token, context),
    fetchQualityClinicalFlags(data.session.access_token, context),
  ]);

  if (evaluationsRes.kind === 'denied') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card danger">
          <h1>Acesso negado</h1>
          <p>Seu perfil não possui acesso ao Quality Engine desta conta.</p>
        </section>
      </main>
    );
  }

  if (evaluationsRes.kind === 'not_found') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card">
          <h1>Módulo de Qualidade não habilitado</h1>
          <p>O Quality Engine ainda não foi habilitado para esta clínica.</p>
        </section>
      </main>
    );
  }

  if (evaluationsRes.kind !== 'success') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card danger">
          <h1>Serviço de Qualidade Indisponível</h1>
          <p>Não foi possível carregar os dados de qualidade. Tente novamente mais tarde.</p>
        </section>
      </main>
    );
  }

  const evaluations = evaluationsRes.data;
  const rubrics = rubricsRes.kind === 'success' ? rubricsRes.data : [];
  const primaryRubric = rubrics[0];
  const flags = flagsRes.kind === 'success' ? flagsRes.data : null;

  // Calculate average quality score
  const totalScoreSum = evaluations.reduce((sum, item) => sum + Number(item.total_score), 0);
  const averageScore =
    evaluations.length > 0 ? (totalScoreSum / evaluations.length).toFixed(1) : '—';

  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Qualidade & Segurança Clínica</p>
          <h1>Monitoramento de Qualidade</h1>
          <p className="lead-copy">
            Acompanhe o score de atendimento operacional da clínica e a fila de triagem médica.
          </p>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <section className="state-card" aria-label="Score Geral">
          <h2>Score Médio de Qualidade</h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0' }}>
            <span style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)' }}>
              {averageScore}%
            </span>
            <small style={{ color: 'var(--muted)' }}>meta: 85%</small>
          </div>
          <p className="lead-copy">
            Com base em <strong>{evaluations.length}</strong> conversa(s) avaliada(s).
          </p>
        </section>

        <section className="state-card" aria-label="Rubrica Atual">
          <h2>Métrica de Avaliação</h2>
          {primaryRubric ? (
            <div style={{ marginTop: '12px' }}>
              <strong>{primaryRubric.title}</strong> (v{primaryRubric.version})
              <p className="lead-copy" style={{ margin: '8px 0' }}>
                {primaryRubric.description}
              </p>
              <small style={{ color: 'var(--muted)' }}>
                {primaryRubric.criteria.length} critérios operacionais avaliados.
              </small>
            </div>
          ) : (
            <p>Nenhuma rubrica cadastrada.</p>
          )}
        </section>

        <section className="state-card" aria-label="Incidentes Clínicos">
          <h2>Segurança e Guardrails</h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '16px 0' }}>
            <span
              style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: flagsRes.kind === 'denied' ? 'var(--muted)' : 'var(--warning)',
              }}
            >
              {flags ? flags.filter((f) => f.status !== 'resolved').length : '—'}
            </span>
            <small style={{ color: 'var(--muted)' }}>pendentes de handoff</small>
          </div>
          <p className="lead-copy">
            Detecção automática e manual de conversas de teor estritamente médico.
          </p>
        </section>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        <section className="state-card" aria-label="Histórico de Avaliações">
          <h2>Histórico de Avaliações</h2>
          {evaluations.length === 0 ? (
            <p>Nenhuma avaliação de atendimento realizada.</p>
          ) : (
            <div style={{ display: 'grid', gap: '16px', marginTop: '12px' }}>
              {evaluations.map((evalItem) => (
                <div
                  key={evalItem.id}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    background: 'var(--surface)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <strong>Conversa: {evalItem.conversation_id}</strong>
                    <span className="badge success">{evalItem.total_score}%</span>
                  </div>
                  {evalItem.feedback ? (
                    <p style={{ margin: '8px 0', fontSize: '0.9rem', color: 'var(--text)' }}>
                      &ldquo;{evalItem.feedback}&rdquo;
                    </p>
                  ) : null}
                  <small style={{ color: 'var(--muted)', display: 'block' }}>
                    Avaliado em: {formatDateTime(evalItem.created_at)}
                  </small>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="state-card" aria-label="Triagem e Handoff Clínico">
          <h2>Fila de Triagem Médica</h2>
          {flagsRes.kind === 'denied' ? (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--muted)' }}>
              <strong>Acesso Restrito a Médicos</strong>
              <p className="lead-copy" style={{ marginTop: '8px' }}>
                A política de minimização e acesso prevê que dados clínicos sejam visualizados
                apenas por profissionais médicos autorizados.
              </p>
            </div>
          ) : flags && flags.length === 0 ? (
            <p>Nenhum flag clínico registrado para esta clínica.</p>
          ) : flags ? (
            <div style={{ display: 'grid', gap: '16px', marginTop: '12px' }}>
              {flags.map((flag) => (
                <div
                  key={flag.id}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    background: 'var(--surface)',
                    borderLeft:
                      flag.status === 'resolved'
                        ? '4px solid var(--success)'
                        : '4px solid var(--warning)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <strong>Conversa: {flag.conversation_id}</strong>
                    <span className={`badge ${flag.status === 'resolved' ? 'success' : 'warning'}`}>
                      {flag.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '0.9rem', color: 'var(--text)' }}>
                    <strong>Motivo:</strong> {flag.flag_reason}
                  </p>
                  {flag.status === 'resolved' && flag.handoff_notes ? (
                    <p
                      style={{
                        margin: '8px 0',
                        fontSize: '0.9rem',
                        color: 'var(--muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      <strong>Resolução:</strong> &ldquo;{flag.handoff_notes}&rdquo;
                    </p>
                  ) : null}
                  <small style={{ color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>
                    Sinalizado em: {formatDateTime(flag.flagged_at)}
                  </small>
                  {flag.status === 'pending' ? (
                    <div
                      style={{
                        borderTop: '1px solid var(--line)',
                        paddingTop: '12px',
                        marginTop: '12px',
                      }}
                    >
                      <ResolveFlagForm context={context} flagId={flag.id} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
