import {
  MEETING_ENGAGEMENT_DAYS,
  SCORE_ATTENTION_THRESHOLD,
  SCORE_CRITICAL_THRESHOLD,
  SCORE_STALE_DAYS,
} from './policy';
import {
  hasRecentCompletedMeeting,
  openIncidents,
  overdueTaskCount,
  scoreAgeDays,
  summarizeRequestSla,
} from './health';
import { evaluateIncidentSla } from './sla';
import type { AccountSignals, NextBestAction } from './types';

export function deriveNextBestActions(
  signals: AccountSignals,
  now: Date,
  limit = 3,
): readonly NextBestAction[] {
  if (!Number.isInteger(limit) || limit < 0) return [];

  const actions: NextBestAction[] = [];
  const sla = summarizeRequestSla(signals, now);
  const incidents = openIncidents(signals.incidents);
  const score = signals.score;
  const scoreValue = score?.status === 'calculated' ? score.scoreValue : null;
  const ageDays = scoreAgeDays(signals, now);
  const overdue = overdueTaskCount(signals, now);

  if (sla.breached > 0) {
    actions.push({
      code: 'respond_breached_request',
      evidence: `${sla.breached} solicitação(ões) com SLA estourado.`,
      rank: 1,
      riskCategory: 'responsiveness',
      title: 'Responder a solicitação com SLA estourado',
    });
  }

  if (incidents.some((incident) => incident.severity === 'critical')) {
    actions.push({
      code: 'handle_critical_incident',
      evidence: `${incidents.filter((incident) => incident.severity === 'critical').length} incidente(s) crítico(s) em aberto.`,
      rank: 2,
      riskCategory: 'operational',
      title: 'Tratar incidente crítico da conta',
    });
  }

  if (sla.breached === 0 && sla.atRisk > 0) {
    actions.push({
      code: 'respond_at_risk_request',
      evidence: `${sla.atRisk} solicitação(ões) com SLA em risco.`,
      rank: 3,
      riskCategory: 'responsiveness',
      title: 'Antecipar resposta de solicitação em risco',
    });
  }

  const unacknowledged = incidents.filter(
    (incident) =>
      incident.status === 'open' &&
      ['at_risk', 'breached'].includes(evaluateIncidentSla(incident, now).state),
  ).length;
  if (unacknowledged > 0) {
    actions.push({
      code: 'acknowledge_incident',
      evidence: `${unacknowledged} incidente(s) sem reconhecimento dentro do prazo.`,
      rank: 4,
      riskCategory: 'operational',
      title: 'Reconhecer incidente pendente',
    });
  }

  if (scoreValue !== null && scoreValue < SCORE_CRITICAL_THRESHOLD) {
    actions.push({
      code: 'review_low_score',
      evidence: `Score atual ${scoreValue} está abaixo de ${SCORE_CRITICAL_THRESHOLD}.`,
      rank: 5,
      riskCategory: 'performance',
      title: 'Agendar reunião de revisão do Score',
    });
  }

  const hasActivePlan = signals.plans.some((plan) => plan.status === 'active');
  if (scoreValue !== null && scoreValue < SCORE_ATTENTION_THRESHOLD && !hasActivePlan) {
    actions.push({
      code: 'propose_improvement_plan',
      evidence: `Score ${scoreValue} abaixo de ${SCORE_ATTENTION_THRESHOLD} sem plano de melhoria ativo.`,
      rank: 6,
      riskCategory: 'performance',
      title: 'Propor plano de melhoria',
    });
  }

  if (overdue > 0) {
    actions.push({
      code: 'unblock_overdue_tasks',
      evidence: `${overdue} tarefa(s) vencida(s) no plano de melhoria.`,
      rank: 7,
      riskCategory: 'operational',
      title: 'Destravar tarefas vencidas do plano',
    });
  }

  const staleScore =
    !score || score.status !== 'calculated' || (ageDays !== null && ageDays > SCORE_STALE_DAYS);
  if (staleScore) {
    actions.push({
      code: 'refresh_assessment',
      evidence: score
        ? `Último Score há ${ageDays ?? 0} dias ou com dados insuficientes.`
        : 'Nenhum Score calculado para a clínica.',
      rank: 8,
      riskCategory: 'data_freshness',
      title: 'Solicitar novo diagnóstico do Radar',
    });
  }

  if (!hasRecentCompletedMeeting(signals, now)) {
    actions.push({
      code: 'schedule_checkin',
      evidence: `Nenhuma reunião concluída nos últimos ${MEETING_ENGAGEMENT_DAYS} dias.`,
      rank: 9,
      riskCategory: 'engagement',
      title: 'Agendar reunião de check-in',
    });
  }

  return actions.sort((left, right) => left.rank - right.rank).slice(0, limit);
}
