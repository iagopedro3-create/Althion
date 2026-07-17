import {
  COCKPIT_POLICY_VERSION,
  HOUR_MS,
  MEETING_ENGAGEMENT_DAYS,
  SCORE_ATTENTION_THRESHOLD,
  SCORE_CRITICAL_THRESHOLD,
  SCORE_STALE_DAYS,
} from './policy';
import { evaluateRequestSla } from './sla';
import type {
  AccountHealth,
  AccountSignals,
  CockpitIncidentLike,
  CockpitRequestLike,
  HealthReason,
  SlaEvaluation,
} from './types';

const OPEN_REQUEST_STATUSES = new Set(['open', 'acknowledged', 'in_progress', 'waiting_customer']);
const OPEN_INCIDENT_STATUSES = new Set(['open', 'investigating', 'mitigated']);
const DAY_MS = 24 * HOUR_MS;

export const openRequests = (
  requests: readonly CockpitRequestLike[],
): readonly CockpitRequestLike[] =>
  requests.filter((request) => OPEN_REQUEST_STATUSES.has(request.status));

export const openIncidents = (
  incidents: readonly CockpitIncidentLike[],
): readonly CockpitIncidentLike[] =>
  incidents.filter((incident) => OPEN_INCIDENT_STATUSES.has(incident.status));

export const overdueTaskCount = (signals: AccountSignals, now: Date): number =>
  signals.tasks.filter(
    (task) =>
      task.dueAt !== null &&
      new Date(task.dueAt).getTime() < now.getTime() &&
      task.status !== 'completed' &&
      task.status !== 'cancelled',
  ).length;

export const hasRecentCompletedMeeting = (signals: AccountSignals, now: Date): boolean =>
  signals.meetings.some(
    (meeting) =>
      meeting.status === 'completed' &&
      meeting.completedAt !== null &&
      now.getTime() - new Date(meeting.completedAt).getTime() <= MEETING_ENGAGEMENT_DAYS * DAY_MS,
  );

export const scoreAgeDays = (signals: AccountSignals, now: Date): number | null =>
  signals.score
    ? Math.floor((now.getTime() - new Date(signals.score.calculatedAt).getTime()) / DAY_MS)
    : null;

export interface RequestSlaSummary {
  readonly atRisk: number;
  readonly breached: number;
  readonly evaluations: readonly SlaEvaluation[];
}

export function summarizeRequestSla(signals: AccountSignals, now: Date): RequestSlaSummary {
  const evaluations = openRequests(signals.requests).map((request) =>
    evaluateRequestSla(request, now),
  );
  return {
    atRisk: evaluations.filter((item) => item.state === 'at_risk').length,
    breached: evaluations.filter((item) => item.state === 'breached').length,
    evaluations,
  };
}

export function evaluateAccountHealth(signals: AccountSignals, now: Date): AccountHealth {
  const reasons: HealthReason[] = [];
  const score = signals.score;
  const ageDays = scoreAgeDays(signals, now);

  if (!score) {
    reasons.push({
      code: 'no_assessment',
      evidence: 'Nenhum Althion Score calculado para a clínica.',
      level: 'attention',
      riskCategory: 'data_freshness',
      rule: 'Score ausente gera atenção.',
    });
  } else if (score.status === 'insufficient_data' || score.scoreValue === null) {
    reasons.push({
      code: 'insufficient_data',
      evidence: `Último cálculo em ${score.calculatedAt} terminou com dados insuficientes.`,
      level: 'attention',
      riskCategory: 'data_freshness',
      rule: 'Score com dados insuficientes gera atenção.',
    });
  } else {
    if (score.scoreValue < SCORE_CRITICAL_THRESHOLD) {
      reasons.push({
        code: 'score_critical',
        evidence: `Score atual ${score.scoreValue} está abaixo de ${SCORE_CRITICAL_THRESHOLD}.`,
        level: 'critical',
        riskCategory: 'performance',
        rule: `Score < ${SCORE_CRITICAL_THRESHOLD} é crítico.`,
      });
    } else if (score.scoreValue < SCORE_ATTENTION_THRESHOLD) {
      reasons.push({
        code: 'score_attention',
        evidence: `Score atual ${score.scoreValue} está abaixo de ${SCORE_ATTENTION_THRESHOLD}.`,
        level: 'attention',
        riskCategory: 'performance',
        rule: `Score entre ${SCORE_CRITICAL_THRESHOLD} e ${SCORE_ATTENTION_THRESHOLD - 1} gera atenção.`,
      });
    }
    if (ageDays !== null && ageDays > SCORE_STALE_DAYS) {
      reasons.push({
        code: 'score_stale',
        evidence: `Último Score foi calculado há ${ageDays} dias.`,
        level: 'attention',
        riskCategory: 'data_freshness',
        rule: `Score calculado há mais de ${SCORE_STALE_DAYS} dias gera atenção.`,
      });
    }
  }

  const sla = summarizeRequestSla(signals, now);
  if (sla.breached > 0) {
    reasons.push({
      code: 'request_sla_breached',
      evidence: `${sla.breached} solicitação(ões) aberta(s) com SLA estourado.`,
      level: 'critical',
      riskCategory: 'responsiveness',
      rule: 'Qualquer SLA de solicitação estourado é crítico.',
    });
  } else if (sla.atRisk > 0) {
    reasons.push({
      code: 'request_sla_at_risk',
      evidence: `${sla.atRisk} solicitação(ões) aberta(s) com SLA em risco (≥ 75% do prazo).`,
      level: 'attention',
      riskCategory: 'responsiveness',
      rule: 'SLA de solicitação em risco gera atenção.',
    });
  }

  const activeIncidents = openIncidents(signals.incidents);
  const criticalIncidents = activeIncidents.filter((item) => item.severity === 'critical').length;
  const otherIncidents = activeIncidents.filter(
    (item) => item.severity === 'high' || item.severity === 'medium',
  ).length;
  if (criticalIncidents > 0) {
    reasons.push({
      code: 'critical_incident_open',
      evidence: `${criticalIncidents} incidente(s) crítico(s) em aberto.`,
      level: 'critical',
      riskCategory: 'operational',
      rule: 'Incidente crítico aberto é crítico.',
    });
  }
  if (otherIncidents > 0) {
    reasons.push({
      code: 'incident_open',
      evidence: `${otherIncidents} incidente(s) de severidade média/alta em aberto.`,
      level: 'attention',
      riskCategory: 'operational',
      rule: 'Incidente médio ou alto aberto gera atenção.',
    });
  }

  const overdue = overdueTaskCount(signals, now);
  if (overdue > 0) {
    reasons.push({
      code: 'tasks_overdue',
      evidence: `${overdue} tarefa(s) do plano de melhoria vencida(s).`,
      level: 'attention',
      riskCategory: 'operational',
      rule: 'Tarefa vencida gera atenção.',
    });
  }

  if (!hasRecentCompletedMeeting(signals, now)) {
    reasons.push({
      code: 'no_recent_meeting',
      evidence: `Nenhuma reunião concluída nos últimos ${MEETING_ENGAGEMENT_DAYS} dias.`,
      level: 'attention',
      riskCategory: 'engagement',
      rule: `Sem reunião concluída em ${MEETING_ENGAGEMENT_DAYS} dias gera atenção.`,
    });
  }

  const state = reasons.some((reason) => reason.level === 'critical')
    ? 'critical'
    : reasons.length > 0
      ? 'attention'
      : 'healthy';

  return { policyVersion: COCKPIT_POLICY_VERSION, reasons, state };
}
