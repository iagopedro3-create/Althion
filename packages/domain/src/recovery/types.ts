export const RECOVERY_RULE_CODES = ['lead_no_response', 'attended_no_booking'] as const;

export type RecoveryRuleCode = (typeof RECOVERY_RULE_CODES)[number];

export const RECOVERY_ACTION_TYPES = ['contact_lead', 'offer_booking'] as const;

export type RecoveryActionType = (typeof RECOVERY_ACTION_TYPES)[number];

export const RECOVERY_OPPORTUNITY_STATUSES = [
  'identified',
  'approved',
  'discarded',
  'expired',
] as const;

export type RecoveryOpportunityStatus = (typeof RECOVERY_OPPORTUNITY_STATUSES)[number];

export const RECOVERY_ACTION_STATUSES = ['recommended', 'approved', 'rejected', 'expired'] as const;

export type RecoveryActionStatus = (typeof RECOVERY_ACTION_STATUSES)[number];

export const RECOVERY_SUPPRESSION_REASONS = [
  'opt_out',
  'complaint',
  'manual_review',
  'other',
] as const;

export type RecoverySuppressionReason = (typeof RECOVERY_SUPPRESSION_REASONS)[number];

export const RECOVERY_CONSENT_STATES = ['granted', 'denied', 'unknown'] as const;

export type RecoveryConsentState = (typeof RECOVERY_CONSENT_STATES)[number];

export const RECOVERY_SIMULATION_STATUSES = ['completed', 'failed'] as const;

export type RecoverySimulationStatus = (typeof RECOVERY_SIMULATION_STATUSES)[number];

export const RECOVERY_EXCLUSION_REASONS = [
  'excluded_no_consent',
  'excluded_suppressed',
  'excluded_frequency',
] as const;

export type RecoveryExclusionReason = (typeof RECOVERY_EXCLUSION_REASONS)[number];

export interface RecoveryLeadSnapshot {
  readonly externalId: string;
  readonly firstResponseAt: string | null;
  readonly hasWonOpportunity: boolean;
  readonly label: string | null;
  readonly receivedAt: string;
  readonly status: 'new' | 'in_progress' | 'won' | 'lost' | 'unknown';
}

export interface RecoveryOpportunityCandidate {
  readonly actionType: RecoveryActionType;
  readonly evidence: Readonly<Record<string, string | null>>;
  readonly externalLeadRef: string;
  readonly leadLabel: string | null;
  readonly ruleCode: RecoveryRuleCode;
  readonly ruleVersion: string;
}

export interface RecoveryExclusion {
  readonly externalLeadRef: string;
  readonly reason: RecoveryExclusionReason;
  readonly ruleCode: RecoveryRuleCode;
}

export interface RecoveryGovernanceContext {
  readonly activeSuppressions: ReadonlySet<string>;
  readonly approvedActionAt: Readonly<Record<string, readonly string[]>>;
  readonly consents: Readonly<Record<string, RecoveryConsentState>>;
}

export interface RecoverySimulationResult {
  readonly candidates: readonly RecoveryOpportunityCandidate[];
  readonly exclusions: readonly RecoveryExclusion[];
  readonly leadsEvaluated: number;
  readonly policyVersion: string;
}
