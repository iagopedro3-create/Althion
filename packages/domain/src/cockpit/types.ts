export const INCIDENT_CATEGORIES = [
  'integration_failure',
  'data_quality',
  'sla_breach',
  'engagement_risk',
  'operational',
  'other',
] as const;

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];

export const INCIDENT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export const INCIDENT_STATUSES = [
  'open',
  'investigating',
  'mitigated',
  'resolved',
  'closed',
] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const MEETING_PURPOSES = ['onboarding', 'checkin', 'review', 'escalation', 'other'] as const;

export type MeetingPurpose = (typeof MEETING_PURPOSES)[number];

export const MEETING_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;

export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const ACCOUNT_COMPLEXITIES = ['low', 'standard', 'high'] as const;

export type AccountComplexity = (typeof ACCOUNT_COMPLEXITIES)[number];

export const SLA_STATES = ['on_track', 'at_risk', 'breached', 'met'] as const;

export type SlaState = (typeof SLA_STATES)[number];

export const ACCOUNT_HEALTH_STATES = ['healthy', 'attention', 'critical'] as const;

export type AccountHealthState = (typeof ACCOUNT_HEALTH_STATES)[number];

export const RISK_CATEGORIES = [
  'performance',
  'responsiveness',
  'data_freshness',
  'engagement',
  'operational',
] as const;

export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export const CAPACITY_STATES = ['available', 'near_limit', 'over_limit'] as const;

export type CapacityState = (typeof CAPACITY_STATES)[number];

export interface HealthReason {
  readonly code: string;
  readonly evidence: string;
  readonly level: Exclude<AccountHealthState, 'healthy'>;
  readonly riskCategory: RiskCategory;
  readonly rule: string;
}

export interface AccountHealth {
  readonly policyVersion: string;
  readonly reasons: readonly HealthReason[];
  readonly state: AccountHealthState;
}

export interface NextBestAction {
  readonly code: string;
  readonly evidence: string;
  readonly rank: number;
  readonly riskCategory: RiskCategory;
  readonly title: string;
}

export interface SlaEvaluation {
  readonly deadlineAt: string;
  readonly elapsedRatio: number | null;
  readonly stage: 'acknowledgement' | 'resolution';
  readonly state: SlaState;
}

export interface PortfolioCapacity {
  readonly limitPoints: number;
  readonly limitSource: 'configured' | 'default';
  readonly state: CapacityState;
  readonly usedPoints: number;
  readonly usedRatio: number;
}

export interface CockpitRequestLike {
  readonly acknowledgedAt: string | null;
  readonly createdAt: string;
  readonly priority: 'low' | 'normal' | 'high' | 'urgent';
  readonly resolvedAt: string | null;
  readonly status:
    'open' | 'acknowledged' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  readonly waitingCustomerSince: string | null;
}

export interface CockpitIncidentLike {
  readonly acknowledgedAt: string | null;
  readonly createdAt: string;
  readonly resolvedAt: string | null;
  readonly severity: IncidentSeverity;
  readonly status: IncidentStatus;
}

export interface CockpitScoreLike {
  readonly calculatedAt: string;
  readonly scoreValue: number | null;
  readonly status: 'calculated' | 'insufficient_data';
}

export interface CockpitTaskLike {
  readonly dueAt: string | null;
  readonly status: 'todo' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
}

export interface CockpitMeetingLike {
  readonly completedAt: string | null;
  readonly status: MeetingStatus;
}

export interface CockpitPlanLike {
  readonly status: 'draft' | 'active' | 'completed' | 'archived';
}

export interface CockpitAssignmentLike {
  readonly complexity: AccountComplexity;
  readonly status: 'active' | 'ended';
}

export interface AccountSignals {
  readonly incidents: readonly CockpitIncidentLike[];
  readonly meetings: readonly CockpitMeetingLike[];
  readonly plans: readonly CockpitPlanLike[];
  readonly requests: readonly CockpitRequestLike[];
  readonly score: CockpitScoreLike | null;
  readonly tasks: readonly CockpitTaskLike[];
}
