export const SCORE_DIMENSIONS = [
  'speed',
  'conversion',
  'continuity',
  'occupancy',
  'attendance',
  'recovery',
  'retention',
  'data_intelligence',
] as const;

export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

export const RADAR_METRIC_CODES = [
  'first_response_within_sla',
  'lead_to_appointment',
  'follow_up_within_policy',
  'bookable_slot_occupancy',
  'appointment_attendance',
  'worked_opportunity_recovery',
  'administrative_return',
  'required_data_quality',
] as const;

export type RadarMetricCode = (typeof RADAR_METRIC_CODES)[number];

export interface ScoreMetricInput {
  readonly code: RadarMetricCode;
  readonly denominator: number;
  readonly numerator: number;
  readonly quality: 'declared' | 'verified';
  readonly source: 'manual';
}

export interface ScoreMetricDefinition {
  readonly code: RadarMetricCode;
  readonly dimension: ScoreDimension;
  readonly label: string;
  readonly weight: number;
}

export interface ScoreFormula {
  readonly components: readonly ScoreMetricDefinition[];
  readonly mandatoryDimensions: ReadonlySet<ScoreDimension>;
  readonly minimumCoverage: number;
  readonly status: 'draft';
  readonly version: string;
}

export type ScoreReasonCode =
  | 'MISSING_METRIC'
  | 'ZERO_DENOMINATOR'
  | 'NUMERATOR_EXCEEDS_DENOMINATOR'
  | 'MINIMUM_COVERAGE_NOT_MET'
  | 'MANDATORY_DIMENSION_MISSING';

export interface ScoreEvidence {
  readonly code: RadarMetricCode;
  readonly denominator: number | null;
  readonly dimension: ScoreDimension;
  readonly normalizedValue: number | null;
  readonly numerator: number | null;
  readonly quality: 'declared' | 'verified' | null;
  readonly reasonCode: ScoreReasonCode | null;
  readonly source: 'manual' | null;
}

export interface ScoreComponentResult {
  readonly contribution: number | null;
  readonly dimension: ScoreDimension;
  readonly evidence: ScoreEvidence;
  readonly score: number | null;
  readonly status: 'calculated' | 'insufficient_data';
  readonly weight: number;
}

export interface AlthionScoreResult {
  readonly components: readonly ScoreComponentResult[];
  readonly coverage: number;
  readonly formulaStatus: 'draft';
  readonly formulaVersion: string;
  readonly missingDimensions: readonly ScoreDimension[];
  readonly score: number | null;
  readonly status: 'calculated' | 'insufficient_data';
}

export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface ScoreRecommendation {
  readonly code: string;
  readonly dimension: ScoreDimension | null;
  readonly evidenceCode: RadarMetricCode | null;
  readonly priority: RecommendationPriority;
  readonly rationale: string;
  readonly ruleVersion: '1.0.0-provisional';
  readonly title: string;
}
