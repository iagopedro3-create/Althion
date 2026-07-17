import type { AccountComplexity, IncidentSeverity } from './types';

export const COCKPIT_POLICY_VERSION = '1.0.0-provisional';

export const HOUR_MS = 3_600_000;

export interface SlaWindowHours {
  readonly acknowledgementHours: number;
  readonly resolutionHours: number;
}

export const REQUEST_SLA_HOURS: Readonly<
  Record<'low' | 'normal' | 'high' | 'urgent', SlaWindowHours>
> = {
  high: { acknowledgementHours: 8, resolutionHours: 72 },
  low: { acknowledgementHours: 72, resolutionHours: 336 },
  normal: { acknowledgementHours: 24, resolutionHours: 168 },
  urgent: { acknowledgementHours: 4, resolutionHours: 24 },
};

export const INCIDENT_SLA_HOURS: Readonly<Record<IncidentSeverity, SlaWindowHours>> = {
  critical: { acknowledgementHours: 2, resolutionHours: 24 },
  high: { acknowledgementHours: 4, resolutionHours: 72 },
  low: { acknowledgementHours: 72, resolutionHours: 336 },
  medium: { acknowledgementHours: 24, resolutionHours: 168 },
};

export const SLA_AT_RISK_RATIO = 0.75;

export const SCORE_CRITICAL_THRESHOLD = 40;
export const SCORE_ATTENTION_THRESHOLD = 60;
export const SCORE_STALE_DAYS = 35;
export const MEETING_ENGAGEMENT_DAYS = 30;

export const COMPLEXITY_WEIGHTS: Readonly<Record<AccountComplexity, number>> = {
  high: 3,
  low: 1,
  standard: 2,
};

export const DEFAULT_CAPACITY_LIMIT_POINTS = 12;
export const CAPACITY_NEAR_LIMIT_RATIO = 0.8;
