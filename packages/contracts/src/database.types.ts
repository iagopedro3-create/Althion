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
      relationship_assignments: TableDefinition<RelationshipAssignmentRow>;
      relationship_specialists: TableDefinition<RelationshipSpecialistRow>;
    };
    Views: Record<string, never>;
    Functions: {
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
