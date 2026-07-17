import { HOUR_MS, INCIDENT_SLA_HOURS, REQUEST_SLA_HOURS, SLA_AT_RISK_RATIO } from './policy';
import type { CockpitIncidentLike, CockpitRequestLike, SlaEvaluation } from './types';

interface StageInput {
  readonly completedAt: string | null;
  readonly frozenAt: string | null;
  readonly stage: SlaEvaluation['stage'];
  readonly startedAt: string;
  readonly windowHours: number;
}

function evaluateStage(input: StageInput, now: Date): SlaEvaluation {
  const startedMs = new Date(input.startedAt).getTime();
  const windowMs = input.windowHours * HOUR_MS;
  const deadlineAt = new Date(startedMs + windowMs).toISOString();

  if (input.completedAt) {
    const completedMs = new Date(input.completedAt).getTime();
    return {
      deadlineAt,
      elapsedRatio: round(Math.max(completedMs - startedMs, 0) / windowMs),
      stage: input.stage,
      state: completedMs <= startedMs + windowMs ? 'met' : 'breached',
    };
  }

  const referenceMs = input.frozenAt ? new Date(input.frozenAt).getTime() : now.getTime();
  const elapsedRatio = Math.max(referenceMs - startedMs, 0) / windowMs;
  return {
    deadlineAt,
    elapsedRatio: round(elapsedRatio),
    stage: input.stage,
    state:
      elapsedRatio >= 1 ? 'breached' : elapsedRatio >= SLA_AT_RISK_RATIO ? 'at_risk' : 'on_track',
  };
}

const round = (value: number): number => Math.round(value * 100) / 100;

export function evaluateRequestSla(request: CockpitRequestLike, now: Date): SlaEvaluation {
  const window = REQUEST_SLA_HOURS[request.priority];
  if (!request.acknowledgedAt && request.status === 'open') {
    return evaluateStage(
      {
        completedAt: null,
        frozenAt: null,
        stage: 'acknowledgement',
        startedAt: request.createdAt,
        windowHours: window.acknowledgementHours,
      },
      now,
    );
  }

  return evaluateStage(
    {
      completedAt: request.resolvedAt,
      frozenAt: request.status === 'waiting_customer' ? request.waitingCustomerSince : null,
      stage: 'resolution',
      startedAt: request.createdAt,
      windowHours: window.resolutionHours,
    },
    now,
  );
}

export function evaluateIncidentSla(incident: CockpitIncidentLike, now: Date): SlaEvaluation {
  const window = INCIDENT_SLA_HOURS[incident.severity];
  if (!incident.acknowledgedAt && incident.status === 'open') {
    return evaluateStage(
      {
        completedAt: null,
        frozenAt: null,
        stage: 'acknowledgement',
        startedAt: incident.createdAt,
        windowHours: window.acknowledgementHours,
      },
      now,
    );
  }

  return evaluateStage(
    {
      completedAt: incident.resolvedAt,
      frozenAt: null,
      stage: 'resolution',
      startedAt: incident.createdAt,
      windowHours: window.resolutionHours,
    },
    now,
  );
}
