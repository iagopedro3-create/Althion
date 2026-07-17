import { describe, expect, it } from 'vitest';

import {
  COCKPIT_POLICY_VERSION,
  deriveNextBestActions,
  evaluateAccountHealth,
  evaluateIncidentSla,
  evaluatePortfolioCapacity,
  evaluateRequestSla,
  isIncidentTransitionAllowed,
  isMeetingTransitionAllowed,
  type AccountSignals,
  type CockpitIncidentLike,
  type CockpitRequestLike,
} from './index';

const NOW = new Date('2026-07-17T12:00:00.000Z');

const request = (overrides: Partial<CockpitRequestLike>): CockpitRequestLike => ({
  acknowledgedAt: null,
  createdAt: '2026-07-17T00:00:00.000Z',
  priority: 'normal',
  resolvedAt: null,
  status: 'open',
  waitingCustomerSince: null,
  ...overrides,
});

const incident = (overrides: Partial<CockpitIncidentLike>): CockpitIncidentLike => ({
  acknowledgedAt: null,
  createdAt: '2026-07-17T00:00:00.000Z',
  resolvedAt: null,
  severity: 'medium',
  status: 'open',
  ...overrides,
});

const emptySignals = (overrides: Partial<AccountSignals>): AccountSignals => ({
  incidents: [],
  meetings: [],
  plans: [],
  requests: [],
  score: null,
  tasks: [],
  ...overrides,
});

const healthySignals = (): AccountSignals =>
  emptySignals({
    meetings: [{ completedAt: '2026-07-10T10:00:00.000Z', status: 'completed' }],
    score: { calculatedAt: '2026-07-15T10:00:00.000Z', scoreValue: 82, status: 'calculated' },
  });

describe('cockpit sla', () => {
  it('tracks the acknowledgement stage while a request is open', () => {
    const evaluation = evaluateRequestSla(
      request({ createdAt: '2026-07-17T10:00:00.000Z', priority: 'urgent' }),
      NOW,
    );
    expect(evaluation.stage).toBe('acknowledgement');
    expect(evaluation.state).toBe('on_track');
    expect(evaluation.deadlineAt).toBe('2026-07-17T14:00:00.000Z');
  });

  it('flags at_risk at 75% and breached at 100% of the window', () => {
    const atRisk = evaluateRequestSla(
      request({ createdAt: '2026-07-17T09:00:00.000Z', priority: 'urgent' }),
      NOW,
    );
    expect(atRisk.state).toBe('at_risk');

    const breached = evaluateRequestSla(
      request({ createdAt: '2026-07-17T08:00:00.000Z', priority: 'urgent' }),
      NOW,
    );
    expect(breached.state).toBe('breached');
  });

  it('freezes the resolution clock while waiting for the customer', () => {
    const evaluation = evaluateRequestSla(
      request({
        acknowledgedAt: '2026-07-10T01:00:00.000Z',
        createdAt: '2026-07-10T00:00:00.000Z',
        priority: 'urgent',
        status: 'waiting_customer',
        waitingCustomerSince: '2026-07-10T06:00:00.000Z',
      }),
      NOW,
    );
    expect(evaluation.stage).toBe('resolution');
    expect(evaluation.state).toBe('on_track');
    expect(evaluation.elapsedRatio).toBe(0.25);
  });

  it('marks resolved requests as met or breached against the deadline', () => {
    const met = evaluateRequestSla(
      request({
        acknowledgedAt: '2026-07-10T01:00:00.000Z',
        createdAt: '2026-07-10T00:00:00.000Z',
        priority: 'urgent',
        resolvedAt: '2026-07-10T20:00:00.000Z',
        status: 'resolved',
      }),
      NOW,
    );
    expect(met.state).toBe('met');

    const breached = evaluateRequestSla(
      request({
        acknowledgedAt: '2026-07-10T01:00:00.000Z',
        createdAt: '2026-07-10T00:00:00.000Z',
        priority: 'urgent',
        resolvedAt: '2026-07-11T20:00:00.000Z',
        status: 'resolved',
      }),
      NOW,
    );
    expect(breached.state).toBe('breached');
  });

  it('evaluates incident acknowledgement by severity', () => {
    const breached = evaluateIncidentSla(
      incident({ createdAt: '2026-07-17T09:00:00.000Z', severity: 'critical' }),
      NOW,
    );
    expect(breached.stage).toBe('acknowledgement');
    expect(breached.state).toBe('breached');
  });
});

describe('cockpit health', () => {
  it('returns healthy without triggered rules', () => {
    const health = evaluateAccountHealth(healthySignals(), NOW);
    expect(health.state).toBe('healthy');
    expect(health.reasons).toHaveLength(0);
    expect(health.policyVersion).toBe(COCKPIT_POLICY_VERSION);
  });

  it('treats a missing score as attention, never as zero', () => {
    const health = evaluateAccountHealth(
      emptySignals({ meetings: healthySignals().meetings }),
      NOW,
    );
    expect(health.state).toBe('attention');
    expect(health.reasons.map((reason) => reason.code)).toEqual(['no_assessment']);
  });

  it('escalates to critical on low score, breached SLA or critical incident', () => {
    const lowScore = evaluateAccountHealth(
      emptySignals({
        meetings: healthySignals().meetings,
        score: { calculatedAt: '2026-07-15T10:00:00.000Z', scoreValue: 39, status: 'calculated' },
      }),
      NOW,
    );
    expect(lowScore.state).toBe('critical');

    const breachedSla = evaluateAccountHealth(
      healthySignals().requests.length
        ? healthySignals()
        : {
            ...healthySignals(),
            requests: [request({ createdAt: '2026-07-10T00:00:00.000Z', priority: 'urgent' })],
          },
      NOW,
    );
    expect(breachedSla.state).toBe('critical');
    expect(breachedSla.reasons.some((reason) => reason.code === 'request_sla_breached')).toBe(true);

    const criticalIncident = evaluateAccountHealth(
      { ...healthySignals(), incidents: [incident({ severity: 'critical' })] },
      NOW,
    );
    expect(criticalIncident.state).toBe('critical');
  });

  it('collects attention reasons with risk categories and evidence', () => {
    const health = evaluateAccountHealth(
      emptySignals({
        score: { calculatedAt: '2026-05-01T10:00:00.000Z', scoreValue: 55, status: 'calculated' },
        tasks: [{ dueAt: '2026-07-01T00:00:00.000Z', status: 'todo' }],
      }),
      NOW,
    );
    expect(health.state).toBe('attention');
    expect(health.reasons.map((reason) => reason.code).sort()).toEqual([
      'no_recent_meeting',
      'score_attention',
      'score_stale',
      'tasks_overdue',
    ]);
    for (const reason of health.reasons) {
      expect(reason.evidence.length).toBeGreaterThan(10);
      expect(reason.rule.length).toBeGreaterThan(10);
    }
  });
});

describe('cockpit capacity', () => {
  it('sums complexity weights for active assignments only', () => {
    const capacity = evaluatePortfolioCapacity(
      [
        { complexity: 'high', status: 'active' },
        { complexity: 'standard', status: 'active' },
        { complexity: 'low', status: 'active' },
        { complexity: 'high', status: 'ended' },
      ],
      12,
    );
    expect(capacity.usedPoints).toBe(6);
    expect(capacity.limitSource).toBe('configured');
    expect(capacity.state).toBe('available');
  });

  it('applies the provisional default when no limit is configured', () => {
    const capacity = evaluatePortfolioCapacity(
      [{ complexity: 'standard', status: 'active' }],
      null,
    );
    expect(capacity.limitPoints).toBe(12);
    expect(capacity.limitSource).toBe('default');
  });

  it('flags near_limit at 80% and over_limit above 100%', () => {
    const near = evaluatePortfolioCapacity(
      [
        { complexity: 'high', status: 'active' },
        { complexity: 'high', status: 'active' },
        { complexity: 'standard', status: 'active' },
      ],
      10,
    );
    expect(near.state).toBe('near_limit');

    const over = evaluatePortfolioCapacity(
      [
        { complexity: 'high', status: 'active' },
        { complexity: 'high', status: 'active' },
      ],
      5,
    );
    expect(over.state).toBe('over_limit');
  });
});

describe('cockpit next best action', () => {
  it('returns no actions for a healthy account', () => {
    expect(deriveNextBestActions(healthySignals(), NOW)).toHaveLength(0);
  });

  it('ranks breached SLA above everything else', () => {
    const actions = deriveNextBestActions(
      emptySignals({
        incidents: [incident({ severity: 'critical' })],
        requests: [request({ createdAt: '2026-07-10T00:00:00.000Z', priority: 'urgent' })],
        score: { calculatedAt: '2026-07-15T10:00:00.000Z', scoreValue: 30, status: 'calculated' },
      }),
      NOW,
    );
    expect(actions.map((action) => action.code)).toEqual([
      'respond_breached_request',
      'handle_critical_incident',
      'acknowledge_incident',
    ]);
  });

  it('suggests a plan when the score is low and no plan is active', () => {
    const base = emptySignals({
      meetings: healthySignals().meetings,
      score: { calculatedAt: '2026-07-15T10:00:00.000Z', scoreValue: 55, status: 'calculated' },
    });
    expect(deriveNextBestActions(base, NOW).map((action) => action.code)).toContain(
      'propose_improvement_plan',
    );
    expect(
      deriveNextBestActions({ ...base, plans: [{ status: 'active' }] }, NOW).map(
        (action) => action.code,
      ),
    ).not.toContain('propose_improvement_plan');
  });

  it('asks for a fresh assessment and a check-in when data is missing', () => {
    const actions = deriveNextBestActions(emptySignals({}), NOW, 5);
    expect(actions.map((action) => action.code)).toEqual([
      'refresh_assessment',
      'schedule_checkin',
    ]);
    for (const action of actions) {
      expect(action.evidence.length).toBeGreaterThan(10);
    }
  });
});

describe('cockpit transitions', () => {
  it('enforces the incident state machine', () => {
    expect(isIncidentTransitionAllowed('open', 'investigating')).toBe(true);
    expect(isIncidentTransitionAllowed('open', 'mitigated')).toBe(false);
    expect(isIncidentTransitionAllowed('resolved', 'investigating')).toBe(true);
    expect(isIncidentTransitionAllowed('closed', 'open')).toBe(false);
  });

  it('enforces the meeting state machine', () => {
    expect(isMeetingTransitionAllowed('scheduled', 'completed')).toBe(true);
    expect(isMeetingTransitionAllowed('scheduled', 'no_show')).toBe(true);
    expect(isMeetingTransitionAllowed('completed', 'scheduled')).toBe(false);
    expect(isMeetingTransitionAllowed('cancelled', 'completed')).toBe(false);
  });
});
