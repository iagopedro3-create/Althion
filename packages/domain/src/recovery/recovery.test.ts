import { describe, expect, it } from 'vitest';

import {
  applyRecoveryGovernance,
  evaluateRecoveryRules,
  isRecoveryActionTransitionAllowed,
  isRecoveryOpportunityTransitionAllowed,
  RECOVERY_POLICY_VERSION,
  simulateRecovery,
  type RecoveryGovernanceContext,
  type RecoveryLeadSnapshot,
} from './index';

const NOW = new Date('2026-07-17T12:00:00.000Z');

const lead = (overrides: Partial<RecoveryLeadSnapshot>): RecoveryLeadSnapshot => ({
  externalId: 'lead-1',
  firstResponseAt: null,
  hasWonOpportunity: false,
  label: 'Lead sintético',
  receivedAt: '2026-07-15T12:00:00.000Z',
  status: 'new',
  ...overrides,
});

const openContext = (refs: readonly string[]): RecoveryGovernanceContext => ({
  activeSuppressions: new Set(),
  approvedActionAt: {},
  consents: Object.fromEntries(refs.map((ref) => [ref, 'granted' as const])),
});

describe('recovery rules', () => {
  it('identifies an unanswered lead only inside the policy window', () => {
    const inside = evaluateRecoveryRules([lead({})], NOW);
    expect(inside).toHaveLength(1);
    expect(inside[0]).toMatchObject({
      actionType: 'contact_lead',
      ruleCode: 'lead_no_response',
      ruleVersion: RECOVERY_POLICY_VERSION,
    });
    expect(inside[0]!.evidence.received_at).toBe('2026-07-15T12:00:00.000Z');

    const tooFresh = evaluateRecoveryRules([lead({ receivedAt: '2026-07-17T00:00:00.000Z' })], NOW);
    expect(tooFresh).toHaveLength(0);

    const tooOld = evaluateRecoveryRules([lead({ receivedAt: '2026-06-01T00:00:00.000Z' })], NOW);
    expect(tooOld).toHaveLength(0);

    const answered = evaluateRecoveryRules(
      [lead({ firstResponseAt: '2026-07-15T13:00:00.000Z' })],
      NOW,
    );
    expect(answered).toHaveLength(0);
  });

  it('identifies an attended lead without booking', () => {
    const candidate = evaluateRecoveryRules(
      [
        lead({
          firstResponseAt: '2026-07-10T12:00:00.000Z',
          status: 'in_progress',
        }),
      ],
      NOW,
    );
    expect(candidate).toHaveLength(1);
    expect(candidate[0]).toMatchObject({
      actionType: 'offer_booking',
      ruleCode: 'attended_no_booking',
    });

    const booked = evaluateRecoveryRules(
      [
        lead({
          firstResponseAt: '2026-07-10T12:00:00.000Z',
          hasWonOpportunity: true,
          status: 'in_progress',
        }),
      ],
      NOW,
    );
    expect(booked).toHaveLength(0);
  });

  it('is deterministic for the same snapshot and clock', () => {
    const leads = [
      lead({ externalId: 'b' }),
      lead({ externalId: 'a' }),
      lead({ externalId: 'c', firstResponseAt: '2026-07-10T12:00:00.000Z', status: 'in_progress' }),
    ];
    const first = simulateRecovery(leads, openContext(['a', 'b', 'c']), NOW);
    const second = simulateRecovery(leads, openContext(['a', 'b', 'c']), NOW);
    expect(first).toEqual(second);
    expect(first.candidates.map((item) => item.externalLeadRef)).toEqual(['a', 'b', 'c']);
    expect(first.leadsEvaluated).toBe(3);
  });
});

describe('recovery governance', () => {
  it('excludes leads without granted consent by default', () => {
    const candidates = evaluateRecoveryRules([lead({})], NOW);
    const outcome = applyRecoveryGovernance(
      candidates,
      { activeSuppressions: new Set(), approvedActionAt: {}, consents: {} },
      NOW,
    );
    expect(outcome.eligible).toHaveLength(0);
    expect(outcome.exclusions[0]).toMatchObject({ reason: 'excluded_no_consent' });
  });

  it('excludes suppressed leads and respects frequency limits', () => {
    const candidates = evaluateRecoveryRules([lead({})], NOW);

    const suppressed = applyRecoveryGovernance(
      candidates,
      {
        activeSuppressions: new Set(['lead-1']),
        approvedActionAt: {},
        consents: { 'lead-1': 'granted' },
      },
      NOW,
    );
    expect(suppressed.exclusions[0]).toMatchObject({ reason: 'excluded_suppressed' });

    const frequent = applyRecoveryGovernance(
      candidates,
      {
        activeSuppressions: new Set(),
        approvedActionAt: { 'lead-1': ['2026-07-14T12:00:00.000Z'] },
        consents: { 'lead-1': 'granted' },
      },
      NOW,
    );
    expect(frequent.exclusions[0]).toMatchObject({ reason: 'excluded_frequency' });

    const allowed = applyRecoveryGovernance(
      candidates,
      {
        activeSuppressions: new Set(),
        approvedActionAt: { 'lead-1': ['2026-07-01T12:00:00.000Z'] },
        consents: { 'lead-1': 'granted' },
      },
      NOW,
    );
    expect(allowed.eligible).toHaveLength(1);
  });
});

describe('recovery transitions', () => {
  it('keeps decisions terminal and forbids execution states', () => {
    expect(isRecoveryOpportunityTransitionAllowed('identified', 'approved')).toBe(true);
    expect(isRecoveryOpportunityTransitionAllowed('approved', 'identified')).toBe(false);
    expect(isRecoveryActionTransitionAllowed('recommended', 'rejected')).toBe(true);
    expect(isRecoveryActionTransitionAllowed('approved', 'recommended')).toBe(false);
  });
});
