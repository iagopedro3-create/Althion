/**
 * Temporary typed baseline for the Phase 1 tables used by the API.
 * Regenerate from the local schema with `pnpm db:types` once Docker is available.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  __InternalSupabase: { PostgrestVersion: '13.0.4' };
  public: {
    Tables: {
      audit_logs: TableDefinition<AuditLogRow>;
      althion_score_components: TableDefinition<AlthionScoreComponentRow>;
      althion_score_evidence: TableDefinition<AlthionScoreEvidenceRow>;
      althion_score_formula_components: TableDefinition<AlthionScoreFormulaComponentRow>;
      althion_score_formulas: TableDefinition<AlthionScoreFormulaRow>;
      althion_scores: TableDefinition<AlthionScoreRow>;
      clinics: TableDefinition<ClinicRow>;
      feature_flag_overrides: TableDefinition<FeatureFlagOverrideRow>;
      feature_flags: TableDefinition<FeatureFlagRow>;
      idempotency_records: TableDefinition<IdempotencyRecordRow>;
      integrations: TableDefinition<IntegrationRow>;
      memberships: TableDefinition<MembershipRow>;
      membership_scopes: TableDefinition<MembershipScopeRow>;
      organizations: TableDefinition<OrganizationRow>;
      platform_roles: TableDefinition<PlatformRoleRow>;
      profiles: TableDefinition<ProfileRow>;
      radar_assessments: TableDefinition<RadarAssessmentRow>;
      radar_metric_inputs: TableDefinition<RadarMetricInputRow>;
      radar_recommendations: TableDefinition<RadarRecommendationRow>;
      relationship_assignments: TableDefinition<RelationshipAssignmentRow>;
      relationship_specialists: TableDefinition<RelationshipSpecialistRow>;
    };
    Views: Record<string, never>;
    Functions: {
      create_radar_assessment: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string;
          target_metrics: Json;
          target_organization_id: string;
          target_period_end: string;
          target_period_start: string;
          target_unit_id: string | null;
        };
        Returns: string;
      };
      grant_membership: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string | null;
          target_organization_id: string;
          target_profile_id: string;
          target_role: string;
          target_unit_id: string | null;
        };
        Returns: string;
      };
      revoke_membership: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_membership_id: string;
          target_organization_id: string;
        };
        Returns: undefined;
      };
      replace_radar_assessment: {
        Args: {
          request_id: string;
          target_assessment_id: string;
          target_clinic_id: string;
          target_metrics: Json;
          target_organization_id: string;
          target_period_end: string;
          target_period_start: string;
          target_unit_id: string | null;
        };
        Returns: undefined;
      };
      record_radar_export: {
        Args: {
          request_id: string;
          target_assessment_id: string;
          target_clinic_id: string;
          target_organization_id: string;
        };
        Returns: undefined;
      };
      submit_radar_assessment: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_assessment_id: string;
          target_clinic_id: string;
          target_organization_id: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

interface TableDefinition<Row extends Record<string, unknown>> {
  Row: Row;
  Insert: Row;
  Update: Row;
  Relationships: [];
}

interface OrganizationRow extends Record<string, unknown> {
  created_at: string;
  deleted_at: string | null;
  id: string;
  name: string;
  retention_policy_version: string | null;
  slug: string;
  status: string;
  timezone: string;
  updated_at: string;
}

interface ClinicRow extends Record<string, unknown> {
  created_at: string;
  deleted_at: string | null;
  id: string;
  name: string;
  organization_id: string;
  slug: string;
  status: string;
  timezone: string;
  updated_at: string;
}

interface ProfileRow extends Record<string, unknown> {
  auth_user_id: string;
  created_at: string;
  display_name: string;
  id: string;
  locale: string;
  status: string;
  updated_at: string;
}

interface MembershipRow extends Record<string, unknown> {
  created_at: string;
  expires_at: string | null;
  id: string;
  organization_id: string;
  profile_id: string;
  revoked_at: string | null;
  role: string;
  starts_at: string;
  status: string;
  updated_at: string;
}

interface MembershipScopeRow extends Record<string, unknown> {
  clinic_id: string | null;
  created_at: string;
  id: string;
  membership_id: string;
  organization_id: string;
  unit_id: string | null;
}

interface PlatformRoleRow extends Record<string, unknown> {
  granted_at: string;
  granted_by: string | null;
  id: string;
  profile_id: string;
  revoked_at: string | null;
  role: string;
  status: string;
}

interface RelationshipSpecialistRow extends Record<string, unknown> {
  capacity_limit: number | null;
  created_at: string;
  id: string;
  profile_id: string;
  status: string;
  updated_at: string;
}

interface RelationshipAssignmentRow extends Record<string, unknown> {
  clinic_id: string | null;
  created_at: string;
  ends_at: string | null;
  id: string;
  organization_id: string;
  specialist_id: string;
  starts_at: string;
  status: string;
  updated_at: string;
}

interface FeatureFlagRow extends Record<string, unknown> {
  created_at: string;
  default_enabled: boolean;
  description: string;
  id: string;
  key: string;
  rollout_type: string;
  updated_at: string;
}

interface FeatureFlagOverrideRow extends Record<string, unknown> {
  created_at: string;
  enabled: boolean;
  expires_at: string | null;
  feature_flag_id: string;
  id: string;
  organization_id: string;
  reason: string;
  updated_at: string;
}

interface AuditLogRow extends Record<string, unknown> {
  action: string;
  actor_profile_id: string | null;
  actor_type: string;
  id: string;
  metadata_redacted: Json;
  occurred_at: string;
  organization_id: string | null;
  request_id: string | null;
  resource_id: string | null;
  resource_type: string;
  result: string;
}

interface IntegrationRow extends Record<string, unknown> {
  capabilities: Json;
  config_reference: string | null;
  created_at: string;
  external_account_id: string | null;
  id: string;
  last_error_code: string | null;
  last_success_at: string | null;
  organization_id: string;
  provider: string;
  status: string;
  updated_at: string;
}

interface IdempotencyRecordRow extends Record<string, unknown> {
  created_at: string;
  expires_at: string;
  id: string;
  key_hash: string;
  organization_id: string;
  request_hash: string | null;
  resource_id: string | null;
  scope: string;
  status: string;
  updated_at: string;
}

export interface RadarAssessmentRow extends Record<string, unknown> {
  clinic_id: string;
  created_at: string;
  created_by: string;
  deleted_at: string | null;
  id: string;
  organization_id: string;
  period_end: string;
  period_start: string;
  questionnaire_version: string;
  status: 'draft' | 'submitted';
  submitted_at: string | null;
  unit_id: string | null;
  updated_at: string;
}

export interface RadarMetricInputRow extends Record<string, unknown> {
  assessment_id: string;
  clinic_id: string;
  created_at: string;
  denominator: number;
  id: string;
  metric_code: string;
  numerator: number;
  observation: string | null;
  organization_id: string;
  quality: 'declared' | 'verified';
  source: 'manual';
  updated_at: string;
}

export interface AlthionScoreFormulaRow extends Record<string, unknown> {
  created_at: string;
  definition_hash: string;
  id: string;
  mandatory_dimensions: string[];
  minimum_coverage: number;
  published_at: string | null;
  status: 'draft' | 'published' | 'retired';
  updated_at: string;
  version: string;
}

export interface AlthionScoreFormulaComponentRow extends Record<string, unknown> {
  created_at: string;
  dimension: string;
  formula_id: string;
  id: string;
  label: string;
  metric_code: string;
  transformation: Json;
  weight: number;
}

export interface AlthionScoreRow extends Record<string, unknown> {
  assessment_id: string;
  calculated_at: string;
  clinic_id: string;
  coverage: number;
  created_at: string;
  formula_id: string;
  id: string;
  input_hash: string;
  organization_id: string;
  score_value: number | null;
  status: 'calculated' | 'insufficient_data';
}

export interface AlthionScoreComponentRow extends Record<string, unknown> {
  contribution: number | null;
  created_at: string;
  dimension: string;
  explanation: Json;
  id: string;
  metric_code: string;
  organization_id: string;
  score_id: string;
  score_value: number | null;
  status: 'calculated' | 'insufficient_data';
  weight: number;
}

export interface AlthionScoreEvidenceRow extends Record<string, unknown> {
  component_id: string;
  created_at: string;
  denominator: number | null;
  id: string;
  metric_code: string;
  metric_input_id: string | null;
  normalized_value: number | null;
  numerator: number | null;
  organization_id: string;
  quality: 'declared' | 'verified' | null;
  reason_code: string | null;
  score_id: string;
  source: 'manual' | null;
  transformation: Json;
}

export interface RadarRecommendationRow extends Record<string, unknown> {
  assessment_id: string;
  clinic_id: string;
  created_at: string;
  dimension: string | null;
  evidence_metric_code: string | null;
  id: string;
  organization_id: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  rule_code: string;
  rule_version: string;
  score_id: string;
  title: string;
}
