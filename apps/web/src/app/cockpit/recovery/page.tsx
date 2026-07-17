import { redirect } from 'next/navigation';

import { formatDateTime } from '@/components/cockpit/labels';
import {
  DecisionButtons,
  RevokeSuppressionButton,
  SimulateButton,
  SuppressionForm,
} from '@/components/recovery/recovery-controls';
import { fetchRecoveryQueue } from '@/lib/api/recovery';
import { parsePortalContext, portalQuery } from '@/lib/portal-context';
import { first } from '@/lib/portal-page';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const RULE_LABELS: Record<string, string> = {
  attended_no_booking: 'Atendido sem agendamento',
  lead_no_response: 'Lead sem resposta',
};

const OPPORTUNITY_STATUS_LABELS: Record<string, string> = {
  approved: 'Aprovada',
  discarded: 'Descartada',
  expired: 'Expirada',
  identified: 'Identificada',
};

const ACTION_STATUS_LABELS: Record<string, string> = {
  approved: 'Aprovada',
  expired: 'Expirada',
  recommended: 'Recomendada',
  rejected: 'Rejeitada',
};

const ACTION_TYPE_LABELS: Record<string, string> = {
  contact_lead: 'Retomar contato com o lead',
  offer_booking: 'Oferecer agendamento',
};

const SUPPRESSION_REASON_LABELS: Record<string, string> = {
  complaint: 'Reclamação',
  manual_review: 'Revisão manual',
  opt_out: 'Opt-out',
  other: 'Outro',
};

export default async function RecoveryPage({
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

  const result = await fetchRecoveryQueue(data.session.access_token, context);

  if (result.kind === 'denied') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card danger">
          <h1>Acesso negado</h1>
          <p>Seu perfil não possui acesso ao Recovery desta conta.</p>
          <a className="quiet-button" href="/cockpit">
            Voltar à carteira
          </a>
        </section>
      </main>
    );
  }

  if (result.kind === 'not_found') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card">
          <h1>Recovery ainda não disponível</h1>
          <p>O Recovery Engine ainda não foi habilitado neste ambiente.</p>
        </section>
      </main>
    );
  }

  if (result.kind !== 'success') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card danger">
          <h1>Recovery indisponível</h1>
          <p>Não foi possível consultar a fila agora. Tente novamente.</p>
        </section>
      </main>
    );
  }

  const queue = result.data;
  const opportunitiesById = new Map(queue.opportunities.map((item) => [item.id, item] as const));

  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Recovery Engine · ambiente sintético (mock)</p>
          <h1>Simulação e decisões de recuperação</h1>
          <p className="lead-copy">
            Nenhum contato é enviado nesta fase: as regras identificam oportunidades e toda ação
            termina em decisão humana registrada.
          </p>
        </div>
        <a className="quiet-button" href={`/cockpit/conta?${portalQuery(context)}`}>
          Voltar à conta
        </a>
      </header>

      <section aria-label="Simulações" className="state-card">
        <h2>Simulações</h2>
        <SimulateButton context={context} />
        {queue.simulations.length === 0 ? (
          <p>Nenhuma simulação registrada para esta conta.</p>
        ) : (
          <ul className="cockpit-sla-list">
            {queue.simulations.map((simulation) => (
              <li key={simulation.id}>
                <strong>
                  {formatDateTime(simulation.created_at)} · política {simulation.policy_version}
                </strong>
                <small>
                  {simulation.leads_evaluated} lead(s) avaliado(s) ·{' '}
                  {simulation.opportunities_identified} oportunidade(s) ·{' '}
                  {simulation.excluded_no_consent} sem consentimento ·{' '}
                  {simulation.excluded_suppressed} suprimida(s) · {simulation.excluded_frequency}{' '}
                  por frequência
                </small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Oportunidades" className="state-card">
        <h2>Oportunidades identificadas</h2>
        {queue.opportunities.length === 0 ? (
          <p>
            Nenhuma oportunidade na fila. Ausência de dado nunca vira contato: só entram leads
            sintéticos elegíveis pela política.
          </p>
        ) : (
          <ul className="cockpit-incident-list">
            {queue.opportunities.map((opportunity) => (
              <li key={opportunity.id}>
                <header>
                  <strong>
                    {RULE_LABELS[opportunity.rule_code]} ·{' '}
                    {opportunity.lead_label ?? opportunity.external_lead_ref}
                  </strong>
                  <span className="status-badge">
                    {OPPORTUNITY_STATUS_LABELS[opportunity.status]}
                  </span>
                </header>
                <small>
                  Regra {opportunity.rule_code} v{opportunity.rule_version} · identificada em{' '}
                  {formatDateTime(opportunity.created_at)} · expira em{' '}
                  {formatDateTime(opportunity.expires_at)}
                </small>
                {opportunity.status === 'identified' ? (
                  <DecisionButtons
                    context={context}
                    kind="opportunity"
                    resourceId={opportunity.id}
                  />
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Ações recomendadas" className="state-card">
        <h2>Ações recomendadas</h2>
        <p>
          <small>
            Aprovar uma ação registra a decisão; a execução real permanece bloqueada até a
            integração oficial.
          </small>
        </p>
        {queue.actions.length === 0 ? (
          <p>Nenhuma ação recomendada.</p>
        ) : (
          <ul className="cockpit-incident-list">
            {queue.actions.map((action) => {
              const opportunity = opportunitiesById.get(action.opportunity_id);
              return (
                <li key={action.id}>
                  <header>
                    <strong>{ACTION_TYPE_LABELS[action.action_type]}</strong>
                    <span className="status-badge">{ACTION_STATUS_LABELS[action.status]}</span>
                  </header>
                  <small>
                    Lead {opportunity?.lead_label ?? opportunity?.external_lead_ref ?? '—'} · expira
                    em {formatDateTime(action.expires_at)}
                  </small>
                  {action.status === 'recommended' ? (
                    <DecisionButtons context={context} kind="action" resourceId={action.id} />
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-label="Supressões" className="state-card">
        <h2>Supressões</h2>
        <p>
          <small>
            Leads suprimidos nunca entram em novas oportunidades. Opt-out tem efeito imediato.
          </small>
        </p>
        {queue.suppressions.length === 0 ? (
          <p>Nenhuma supressão registrada.</p>
        ) : (
          <ul className="cockpit-sla-list">
            {queue.suppressions.map((suppression) => (
              <li key={suppression.id}>
                <strong>{suppression.external_lead_ref}</strong>
                <small>
                  {SUPPRESSION_REASON_LABELS[suppression.reason]} · registrada em{' '}
                  {formatDateTime(suppression.created_at)}
                  {suppression.revoked_at
                    ? ` · revogada em ${formatDateTime(suppression.revoked_at)}`
                    : ' · ativa'}
                </small>
                {suppression.revoked_at === null ? (
                  <RevokeSuppressionButton context={context} suppressionId={suppression.id} />
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <h3>Registrar supressão</h3>
        <SuppressionForm context={context} />
      </section>
    </main>
  );
}
