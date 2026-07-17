import type { RecoveryActionStatus, RecoveryOpportunityStatus } from './types';

const OPPORTUNITY_TRANSITIONS: Readonly<
  Record<RecoveryOpportunityStatus, ReadonlySet<RecoveryOpportunityStatus>>
> = {
  approved: new Set(),
  discarded: new Set(),
  expired: new Set(),
  identified: new Set(['approved', 'discarded', 'expired']),
};

const ACTION_TRANSITIONS: Readonly<
  Record<RecoveryActionStatus, ReadonlySet<RecoveryActionStatus>>
> = {
  approved: new Set(),
  expired: new Set(),
  recommended: new Set(['approved', 'rejected', 'expired']),
  rejected: new Set(),
};

export const isRecoveryOpportunityTransitionAllowed = (
  from: RecoveryOpportunityStatus,
  to: RecoveryOpportunityStatus,
): boolean => OPPORTUNITY_TRANSITIONS[from].has(to);

export const isRecoveryActionTransitionAllowed = (
  from: RecoveryActionStatus,
  to: RecoveryActionStatus,
): boolean => ACTION_TRANSITIONS[from].has(to);
