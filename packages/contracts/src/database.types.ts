/**
 * Temporary typed baseline for the Phase 1-4 tables used by the API.
 * Regenerate from the local schema with `pnpm db:types` once Docker is available.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  __InternalSupabase: { PostgrestVersion: '13.0.4' };
  public: {
    Tables: {
      account_incident_status_history: TableDefinition<AccountIncidentStatusHistoryRow>;
      account_incidents: TableDefinition<AccountIncidentRow>;
      account_meeting_status_history: TableDefinition<AccountMeetingStatusHistoryRow>;
      account_meetings: TableDefinition<AccountMeetingRow>;
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
      improvement_plan_status_history: TableDefinition<ImprovementPlanStatusHistoryRow>;
      improvement_plans: TableDefinition<ImprovementPlanRow>;
      memberships: TableDefinition<MembershipRow>;
      membership_scopes: TableDefinition<MembershipScopeRow>;
      organizations: TableDefinition<OrganizationRow>;
      platform_roles: TableDefinition<PlatformRoleRow>;
      profiles: TableDefinition<ProfileRow>;
      radar_assessments: TableDefinition<RadarAssessmentRow>;
      radar_metric_inputs: TableDefinition<RadarMetricInputRow>;
      radar_recommendations: TableDefinition<RadarRecommendationRow>;
      recovery_action_status_history: TableDefinition<RecoveryActionStatusHistoryRow>;
      recovery_actions: TableDefinition<RecoveryActionRow>;
      recovery_consents: TableDefinition<RecoveryConsentRow>;
      recovery_opportunities: TableDefinition<RecoveryOpportunityRow>;
      recovery_opportunity_status_history: TableDefinition<RecoveryOpportunityStatusHistoryRow>;
      recovery_simulations: TableDefinition<RecoverySimulationRow>;
      recovery_suppressions: TableDefinition<RecoverySuppressionRow>;
      relationship_assignments: TableDefinition<RelationshipAssignmentRow>;
      relationship_specialists: TableDefinition<RelationshipSpecialistRow>;
      request_status_history: TableDefinition<RequestStatusHistoryRow>;
      requests: TableDefinition<PortalRequestRow>;
      task_status_history: TableDefinition<TaskStatusHistoryRow>;
      tasks: TableDefinition<PortalTaskRow>;
      quality_rubrics: TableDefinition<QualityRubricRow>;
      quality_evaluations: TableDefinition<QualityEvaluationRow>;
      quality_clinical_flags: TableDefinition<QualityClinicalFlagRow>;
      quality_evaluation_history: TableDefinition<QualityEvaluationHistoryRow>;
      quality_clinical_flag_history: TableDefinition<QualityClinicalFlagHistoryRow>;
      google_ads_credentials: TableDefinition<GoogleAdsCredentialsRow>;
      google_ads_campaigns: TableDefinition<GoogleAdsCampaignsRow>;
      google_ads_metrics: TableDefinition<GoogleAdsMetricsRow>;
    };
    Views: Record<string, never>;
    Functions: {
      save_google_ads_credentials: {
        Args: {
          target_organization_id: string;
          target_clinic_id: string;
          target_refresh_token: string;
          target_developer_token: string;
          target_customer_id: string;
          idempotency_key: string;
          request_id: string;
        };
        Returns: string;
      };
      get_google_ads_connection: {
        Args: {
          target_organization_id: string;
          target_clinic_id: string;
        };
        Returns: GoogleAdsCredentialsRow[];
      };
      sync_google_ads_data: {
        Args: {
          target_organization_id: string;
          target_clinic_id: string;
          target_campaigns: Json;
          target_metrics: Json;
          idempotency_key: string;
          request_id: string;
        };
        Returns: boolean;
      };
      create_quality_evaluation: {
        Args: {
          target_organization_id: string;
          target_clinic_id: string;
          target_conversation_id: string;
          target_rubric_version: string;
          target_scores: Json;
          target_feedback: string | null;
          idempotency_key: string;
          request_id: string;
        };
        Returns: string;
      };
      flag_clinical_conversation: {
        Args: {
          target_organization_id: string;
          target_clinic_id: string;
          target_conversation_id: string;
          target_flag_reason: string;
          idempotency_key: string;
          request_id: string;
        };
        Returns: string;
      };
      resolve_clinical_flag: {
        Args: {
          target_organization_id: string;
          target_clinic_id: string;
          target_flag_id: string;
          target_handoff_notes: string;
          idempotency_key: string;
          request_id: string;
        };
        Returns: string;
      };
      create_account_incident: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_category: string;
          target_clinic_id: string;
          target_details: string;
          target_organization_id: string;
          target_severity: string;
          target_subject: string;
        };
        Returns: string;
      };
      create_account_meeting: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string;
          target_organization_id: string;
          target_purpose: string;
          target_scheduled_at: string;
          target_summary: string | null;
        };
        Returns: string;
      };
      transition_account_incident: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string;
          target_incident_id: string;
          target_organization_id: string;
          target_reason_code: string | null;
          target_status: string;
        };
        Returns: string;
      };
      transition_account_meeting: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string;
          target_meeting_id: string;
          target_organization_id: string;
          target_reason_code: string | null;
          target_status: string;
          target_summary: string | null;
        };
        Returns: string;
      };
      create_recovery_suppression: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string;
          target_expires_at: string | null;
          target_external_lead_ref: string;
          target_organization_id: string;
          target_reason: string;
        };
        Returns: string;
      };
      decide_recovery_action: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_action_id: string;
          target_clinic_id: string;
          target_decision: string;
          target_organization_id: string;
          target_reason_code: string | null;
        };
        Returns: string;
      };
      decide_recovery_opportunity: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string;
          target_decision: string;
          target_opportunity_id: string;
          target_organization_id: string;
          target_reason_code: string | null;
        };
        Returns: string;
      };
      revoke_recovery_suppression: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string;
          target_organization_id: string;
          target_suppression_id: string;
        };
        Returns: string;
      };
      run_recovery_simulation: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_candidates: Json;
          target_clinic_id: string;
          target_exclusions: Json;
          target_leads_evaluated: number;
          target_organization_id: string;
          target_policy_version: string;
          target_window_end: string;
          target_window_start: string;
        };
        Returns: string;
      };
      set_recovery_consent: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string;
          target_external_lead_ref: string;
          target_organization_id: string;
          target_state: string;
        };
        Returns: string;
      };
      create_improvement_plan: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string;
          target_organization_id: string;
          target_period_end: string | null;
          target_period_start: string | null;
          target_source_score_id: string | null;
          target_title: string;
        };
        Returns: string;
      };
      create_portal_request: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_category: string;
          target_clinic_id: string;
          target_details: string;
          target_organization_id: string;
          target_priority: string;
          target_subject: string;
        };
        Returns: string;
      };
      create_portal_task: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_assignee_profile_id: string | null;
          target_clinic_id: string;
          target_due_at: string | null;
          target_organization_id: string;
          target_plan_id: string;
          target_priority: string;
          target_radar_recommendation_id: string | null;
          target_title: string;
        };
        Returns: string;
      };
      get_portal_people: {
        Args: {
          target_clinic_id: string;
          target_organization_id: string;
        };
        Returns: Array<{
          display_name: string;
          person_kind: string;
          profile_id: string;
        }>;
      };
      get_portal_specialist: {
        Args: {
          target_clinic_id: string;
          target_organization_id: string;
        };
        Returns: Array<{
          assignment_id: string;
          display_name: string;
          profile_id: string;
          starts_at: string;
        }>;
      };
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
      transition_improvement_plan: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string;
          target_organization_id: string;
          target_plan_id: string;
          target_reason_code: string | null;
          target_status: string;
        };
        Returns: string;
      };
      transition_portal_request: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string;
          target_organization_id: string;
          target_reason_code: string | null;
          target_request_id: string;
          target_status: string;
        };
        Returns: string;
      };
      transition_portal_task: {
        Args: {
          idempotency_key: string;
          request_id: string;
          target_clinic_id: string;
          target_organization_id: string;
          target_reason_code: string | null;
          target_status: string;
          target_task_id: string;
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
  complexity: 'low' | 'standard' | 'high';
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

export interface PortalRequestRow extends Record<string, unknown> {
  acknowledged_at: string | null;
  assignee_profile_id: string | null;
  category: 'access' | 'integration' | 'data_quality' | 'operational_support' | 'meeting' | 'other';
  clinic_id: string;
  closed_at: string | null;
  created_at: string;
  details: string;
  id: string;
  organization_id: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requester_profile_id: string;
  resolved_at: string | null;
  status: 'open' | 'acknowledged' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  subject: string;
  updated_at: string;
}

export interface RequestStatusHistoryRow extends Record<string, unknown> {
  changed_at: string;
  changed_by_profile_id: string;
  clinic_id: string;
  from_status: PortalRequestRow['status'] | null;
  id: string;
  organization_id: string;
  reason_code: string | null;
  request_id: string;
  to_status: PortalRequestRow['status'];
}

export interface ImprovementPlanRow extends Record<string, unknown> {
  activated_at: string | null;
  archived_at: string | null;
  clinic_id: string;
  completed_at: string | null;
  created_at: string;
  created_by_profile_id: string;
  id: string;
  organization_id: string;
  period_end: string | null;
  period_start: string | null;
  source_score_id: string | null;
  status: 'draft' | 'active' | 'completed' | 'archived';
  title: string;
  updated_at: string;
  version: number;
}

export interface ImprovementPlanStatusHistoryRow extends Record<string, unknown> {
  changed_at: string;
  changed_by_profile_id: string;
  clinic_id: string;
  from_status: ImprovementPlanRow['status'] | null;
  id: string;
  improvement_plan_id: string;
  organization_id: string;
  reason_code: string | null;
  to_status: ImprovementPlanRow['status'];
}

export interface PortalTaskRow extends Record<string, unknown> {
  assignee_profile_id: string | null;
  clinic_id: string;
  completed_at: string | null;
  created_at: string;
  created_by_profile_id: string;
  due_at: string | null;
  id: string;
  improvement_plan_id: string;
  organization_id: string;
  priority: 'low' | 'normal' | 'high';
  radar_recommendation_id: string | null;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  title: string;
  updated_at: string;
}

export interface TaskStatusHistoryRow extends Record<string, unknown> {
  changed_at: string;
  changed_by_profile_id: string;
  clinic_id: string;
  from_status: PortalTaskRow['status'] | null;
  id: string;
  organization_id: string;
  reason_code: string | null;
  task_id: string;
  to_status: PortalTaskRow['status'];
}

export interface AccountIncidentRow extends Record<string, unknown> {
  acknowledged_at: string | null;
  assignee_profile_id: string | null;
  category:
    | 'integration_failure'
    | 'data_quality'
    | 'sla_breach'
    | 'engagement_risk'
    | 'operational'
    | 'other';
  clinic_id: string;
  closed_at: string | null;
  created_at: string;
  details: string;
  id: string;
  mitigated_at: string | null;
  opened_by_profile_id: string;
  organization_id: string;
  resolved_at: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'mitigated' | 'resolved' | 'closed';
  subject: string;
  updated_at: string;
}

export interface AccountIncidentStatusHistoryRow extends Record<string, unknown> {
  changed_at: string;
  changed_by_profile_id: string;
  clinic_id: string;
  from_status: AccountIncidentRow['status'] | null;
  id: string;
  incident_id: string;
  organization_id: string;
  reason_code: string | null;
  to_status: AccountIncidentRow['status'];
}

export interface AccountMeetingRow extends Record<string, unknown> {
  cancelled_at: string | null;
  clinic_id: string;
  completed_at: string | null;
  created_at: string;
  id: string;
  organization_id: string;
  purpose: 'onboarding' | 'checkin' | 'review' | 'escalation' | 'other';
  scheduled_at: string;
  specialist_profile_id: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  summary: string | null;
  updated_at: string;
}

export interface AccountMeetingStatusHistoryRow extends Record<string, unknown> {
  changed_at: string;
  changed_by_profile_id: string;
  clinic_id: string;
  from_status: AccountMeetingRow['status'] | null;
  id: string;
  meeting_id: string;
  organization_id: string;
  reason_code: string | null;
  to_status: AccountMeetingRow['status'];
}

export interface RecoveryConsentRow extends Record<string, unknown> {
  clinic_id: string;
  created_at: string;
  created_by_profile_id: string;
  external_lead_ref: string;
  id: string;
  organization_id: string;
  state: 'granted' | 'denied';
  updated_at: string;
}

export interface RecoverySuppressionRow extends Record<string, unknown> {
  clinic_id: string;
  created_at: string;
  created_by_profile_id: string;
  expires_at: string | null;
  external_lead_ref: string;
  id: string;
  organization_id: string;
  reason: 'opt_out' | 'complaint' | 'manual_review' | 'other';
  revoked_at: string | null;
  revoked_by_profile_id: string | null;
  updated_at: string;
}

export interface RecoverySimulationRow extends Record<string, unknown> {
  clinic_id: string;
  created_at: string;
  created_by_profile_id: string;
  excluded_frequency: number;
  excluded_no_consent: number;
  excluded_suppressed: number;
  id: string;
  leads_evaluated: number;
  opportunities_identified: number;
  organization_id: string;
  policy_version: string;
  provider: 'mock';
  status: 'completed' | 'failed';
  window_end: string;
  window_start: string;
}

export interface RecoveryOpportunityRow extends Record<string, unknown> {
  clinic_id: string;
  created_at: string;
  decided_at: string | null;
  decided_by_profile_id: string | null;
  evidence: Json;
  expires_at: string;
  external_lead_ref: string;
  id: string;
  lead_label: string | null;
  organization_id: string;
  reason_code: string | null;
  rule_code: 'lead_no_response' | 'attended_no_booking';
  rule_version: string;
  simulation_id: string;
  status: 'identified' | 'approved' | 'discarded' | 'expired';
  updated_at: string;
}

export interface RecoveryActionRow extends Record<string, unknown> {
  action_type: 'contact_lead' | 'offer_booking';
  clinic_id: string;
  created_at: string;
  decided_at: string | null;
  decided_by_profile_id: string | null;
  expires_at: string;
  id: string;
  opportunity_id: string;
  organization_id: string;
  reason_code: string | null;
  status: 'recommended' | 'approved' | 'rejected' | 'expired';
  updated_at: string;
}

export interface RecoveryOpportunityStatusHistoryRow extends Record<string, unknown> {
  changed_at: string;
  changed_by_profile_id: string;
  clinic_id: string;
  from_status: RecoveryOpportunityRow['status'] | null;
  id: string;
  opportunity_id: string;
  organization_id: string;
  reason_code: string | null;
  to_status: RecoveryOpportunityRow['status'];
}

export interface RecoveryActionStatusHistoryRow extends Record<string, unknown> {
  action_id: string;
  changed_at: string;
  changed_by_profile_id: string;
  clinic_id: string;
  from_status: RecoveryActionRow['status'] | null;
  id: string;
  organization_id: string;
  reason_code: string | null;
  to_status: RecoveryActionRow['status'];
}

export interface QualityRubricRow extends Record<string, unknown> {
  version: string;
  title: string;
  description: string;
  criteria: Json;
  is_active: boolean;
  created_by_profile_id: string;
  created_at: string;
}

export interface QualityEvaluationRow extends Record<string, unknown> {
  id: string;
  organization_id: string;
  clinic_id: string;
  conversation_id: string;
  evaluator_id: string;
  rubric_version: string;
  scores: Json;
  total_score: number;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface QualityClinicalFlagRow extends Record<string, unknown> {
  id: string;
  organization_id: string;
  clinic_id: string;
  conversation_id: string;
  flagged_at: string;
  flagged_by_profile_id: string | null;
  flag_reason: string;
  status: 'pending' | 'transferred' | 'resolved';
  resolved_at: string | null;
  resolved_by_profile_id: string | null;
  handoff_notes: string | null;
}

export interface QualityEvaluationHistoryRow extends Record<string, unknown> {
  id: string;
  organization_id: string;
  clinic_id: string;
  evaluation_id: string;
  rubric_version: string;
  total_score: number;
  changed_by_profile_id: string;
  changed_at: string;
}

export interface QualityClinicalFlagHistoryRow extends Record<string, unknown> {
  id: string;
  organization_id: string;
  clinic_id: string;
  flag_id: string;
  from_status: QualityClinicalFlagRow['status'] | null;
  to_status: QualityClinicalFlagRow['status'];
  changed_by_profile_id: string;
  changed_at: string;
}

export interface GoogleAdsCredentialsRow extends Record<string, unknown> {
  id: string;
  organization_id: string;
  clinic_id: string;
  customer_id: string;
  status: 'active' | 'disabled' | 'error';
  last_sync_at: string | null;
  last_error_code: string | null;
  created_at: string;
  updated_at: string;
  created_by_profile_id: string;
}

export interface GoogleAdsCampaignsRow extends Record<string, unknown> {
  id: string;
  organization_id: string;
  clinic_id: string;
  campaign_id: string;
  name: string;
  status: 'ENABLED' | 'PAUSED' | 'REMOVED' | 'UNKNOWN';
  budget_micros: number;
  created_at: string;
  updated_at: string;
}

export interface GoogleAdsMetricsRow extends Record<string, unknown> {
  id: string;
  organization_id: string;
  clinic_id: string;
  campaign_id: string;
  date: string;
  clicks: number;
  impressions: number;
  cost_micros: number;
  conversions: number;
  created_at: string;
}
