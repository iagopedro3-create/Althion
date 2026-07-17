import { redirect } from 'next/navigation';

import {
  formatDateTime,
  HEALTH_LABELS,
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  MEETING_PURPOSE_LABELS,
  MEETING_STATUS_LABELS,
  REQUEST_PRIORITY_LABELS,
  RISK_LABELS,
  SLA_LABELS,
} from '@/components/cockpit/labels';
import { IncidentForm } from '@/components/cockpit/incident-form';
import { MeetingForm } from '@/components/cockpit/meeting-form';
import { WorkflowButtons, type WorkflowTransition } from '@/components/cockpit/workflow-buttons';
import { fetchCockpitAccount, type CockpitSlaView } from '@/lib/api/cockpit';
import { parsePortalContext, portalQuery } from '@/lib/portal-context';
import { first } from '@/lib/portal-page';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const INCIDENT_TRANSITIONS: Record<string, readonly WorkflowTransition[]> = {
  closed: [],
  investigating: [
    { label: 'Mitigar', toStatus: 'mitigated' },
    { label: 'Resolver', toStatus: 'resolved' },
    { label: 'Encerrar', toStatus: 'closed' },
  ],
  mitigated: [
    { label: 'Reabrir investigação', toStatus: 'investigating' },
    { label: 'Resolver', toStatus: 'resolved' },
    { label: 'Encerrar', toStatus: 'closed' },
  ],
  open: [
    { label: 'Investigar', toStatus: 'investigating' },
    { label: 'Resolver', toStatus: 'resolved' },
    { label: 'Encerrar', toStatus: 'closed' },
  ],
  resolved: [
    { label: 'Encerrar', toStatus: 'closed' },
    { label: 'Reabrir', toStatus: 'investigating' },
  ],
};

const MEETING_TRANSITIONS: Record<string, readonly WorkflowTransition[]> = {
  cancelled: [],
  completed: [],
  no_show: [],
  scheduled: [
    { label: 'Concluir', toStatus: 'completed' },
    { label: 'Cancelar', toStatus: 'cancelled' },
    { label: 'Não compareceu', toStatus: 'no_show' },
  ],
};

export default async function CockpitAccountPage({
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

  const result = await fetchCockpitAccount(data.session.access_token, context);

  if (result.kind === 'denied') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card danger">
          <h1>Acesso negado</h1>
          <p>Esta conta não pertence à sua carteira ativa.</p>
          <a className="quiet-button" href="/cockpit">
            Voltar à carteira
          </a>
        </section>
      </main>
    );
  }

  if (result.kind !== 'success') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card danger">
          <h1>Conta indisponível</h1>
          <p>Não foi possível consultar esta conta agora. Tente novamente.</p>
          <a className="quiet-button" href="/cockpit">
            Voltar à carteira
          </a>
        </section>
      </main>
    );
  }

  const account = result.data;
  const clinicLabel = readableName(first(query.clinicName)) ?? 'Conta da carteira';
  const organizationLabel = readableName(first(query.organizationName));

  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">
            Cockpit · {organizationLabel ? `${organizationLabel} · ` : ''}política{' '}
            {account.policyVersion}
          </p>
          <h1>{clinicLabel}</h1>
          <p className="lead-copy">
            Saúde da conta: <strong>{HEALTH_LABELS[account.health.state]}</strong> — avaliação
            gerada em {formatDateTime(account.generatedAt)}.
          </p>
        </div>
        <div className="profile-actions">
          <a className="quiet-button" href={`/cockpit/recovery?${portalQuery(context)}`}>
            Recovery
          </a>
          <a className="quiet-button" href="/cockpit">
            Voltar
          </a>
        </div>
      </header>

      <section aria-label="Razões da saúde" className="state-card">
        <h2>Por que esta saúde</h2>
        {account.health.reasons.length === 0 ? (
          <p>Nenhuma regra da política disparou. A conta está saudável pelos sinais atuais.</p>
        ) : (
          <ul className="cockpit-reason-list">
            {account.health.reasons.map((reason) => (
              <li className={`reason-${reason.level}`} key={reason.code}>
                <span className="status-badge">{RISK_LABELS[reason.riskCategory]}</span>
                <strong>{reason.evidence}</strong>
                <small>Regra: {reason.rule}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Próximas melhores ações" className="state-card">
        <h2>Próximas melhores ações</h2>
        {account.nextBestActions.length === 0 ? (
          <p>Nenhuma ação recomendada agora.</p>
        ) : (
          <ol className="cockpit-action-list">
            {account.nextBestActions.map((action) => (
              <li key={action.code}>
                <strong>{action.title}</strong>
                <small>{action.evidence}</small>
              </li>
            ))}
          </ol>
        )}
        <p>
          <small>
            Recomendações determinísticas da política {account.policyVersion}; a decisão é sempre do
            Especialista.
          </small>
        </p>
      </section>

      <div className="cockpit-columns">
        <section aria-label="Score" className="state-card">
          <h2>Althion Score</h2>
          {account.score.availability === 'available' ? (
            <p>
              Score <strong>{account.score.scoreValue}</strong> · cobertura{' '}
              {Math.round((account.score.coverage ?? 0) * 100)}% · calculado em{' '}
              {account.score.calculatedAt ? formatDateTime(account.score.calculatedAt) : '—'}
            </p>
          ) : (
            <p>Sem Score calculado suficiente. Nenhum número é inventado.</p>
          )}
          {account.plan ? (
            <p>
              Plano ativo: <strong>{account.plan.title}</strong> (v{account.plan.version}) ·{' '}
              {account.plan.overdueTasks} tarefa(s) vencida(s)
            </p>
          ) : (
            <p>Sem plano de melhoria ativo.</p>
          )}
        </section>

        <section aria-label="Solicitações e SLA" className="state-card">
          <h2>Solicitações abertas e SLA</h2>
          {account.requests.length === 0 ? (
            <p>Nenhuma solicitação aberta.</p>
          ) : (
            <ul className="cockpit-sla-list">
              {account.requests.map((request) => (
                <li key={request.id}>
                  <strong>{request.subject}</strong>
                  <small>
                    Prioridade {REQUEST_PRIORITY_LABELS[request.priority]} ·{' '}
                    {slaDescription(request.sla)}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-label="Incidentes" className="state-card">
        <h2>Incidentes da conta</h2>
        <p>
          <small>
            Registro operacional interno. Severidade significa impacto operacional; nunca urgência
            ou risco clínico.
          </small>
        </p>
        {account.incidents.length === 0 ? (
          <p>Nenhum incidente registrado.</p>
        ) : (
          <ul className="cockpit-incident-list">
            {account.incidents.map((incident) => (
              <li key={incident.id}>
                <header>
                  <strong>{incident.subject}</strong>
                  <span className="status-badge">
                    {INCIDENT_STATUS_LABELS[incident.status]} ·{' '}
                    {INCIDENT_SEVERITY_LABELS[incident.severity]}
                  </span>
                </header>
                <small>
                  {INCIDENT_CATEGORY_LABELS[incident.category]} · aberto em{' '}
                  {formatDateTime(incident.createdAt)}
                  {incident.sla ? ` · ${slaDescription(incident.sla)}` : ''}
                </small>
                <WorkflowButtons
                  context={context}
                  kind="incident"
                  resourceId={incident.id}
                  transitions={INCIDENT_TRANSITIONS[incident.status] ?? []}
                />
              </li>
            ))}
          </ul>
        )}
        <h3>Registrar incidente</h3>
        <IncidentForm context={context} />
      </section>

      <section aria-label="Reuniões" className="state-card">
        <h2>Reuniões da conta</h2>
        {account.meetings.length === 0 ? (
          <p>Nenhuma reunião registrada.</p>
        ) : (
          <ul className="cockpit-meeting-list">
            {account.meetings.map((meeting) => (
              <li key={meeting.id}>
                <header>
                  <strong>{MEETING_PURPOSE_LABELS[meeting.purpose]}</strong>
                  <span className="status-badge">{MEETING_STATUS_LABELS[meeting.status]}</span>
                </header>
                <small>
                  Agendada para {formatDateTime(meeting.scheduledAt)}
                  {meeting.completedAt
                    ? ` · concluída em ${formatDateTime(meeting.completedAt)}`
                    : ''}
                </small>
                {meeting.summary ? <p>{meeting.summary}</p> : null}
                <WorkflowButtons
                  context={context}
                  kind="meeting"
                  resourceId={meeting.id}
                  transitions={MEETING_TRANSITIONS[meeting.status] ?? []}
                />
              </li>
            ))}
          </ul>
        )}
        <h3>Registrar reunião</h3>
        <MeetingForm context={context} />
      </section>
    </main>
  );
}

function slaDescription(sla: CockpitSlaView): string {
  const stage = sla.stage === 'acknowledgement' ? 'primeira resposta' : 'resolução';
  return `SLA de ${stage}: ${SLA_LABELS[sla.state]} (limite ${formatDateTime(sla.deadlineAt)})`;
}

function readableName(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().slice(0, 80);
  return trimmed.length >= 2 ? trimmed : null;
}
