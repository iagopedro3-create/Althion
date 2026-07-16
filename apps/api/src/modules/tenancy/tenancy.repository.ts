import type { CreateMembershipInput, Database } from '@althion/contracts';
import { ConflictException, Injectable, ServiceUnavailableException } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';

type OrganizationRow = Database['public']['Tables']['organizations']['Row'];
type ClinicRow = Database['public']['Tables']['clinics']['Row'];
type MembershipRow = Database['public']['Tables']['memberships']['Row'];
type MembershipScopeRow = Database['public']['Tables']['membership_scopes']['Row'];
type AuditLogRow = Database['public']['Tables']['audit_logs']['Row'];
type IntegrationRow = Database['public']['Tables']['integrations']['Row'];

export interface MembershipView extends MembershipRow {
  readonly scopes: readonly Pick<MembershipScopeRow, 'clinic_id' | 'unit_id'>[];
}

export interface EffectiveFeatureFlag {
  readonly enabled: boolean;
  readonly key: string;
}

@Injectable()
export class TenancyRepository {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async getOrganization(
    accessToken: string,
    organizationId: string,
  ): Promise<OrganizationRow | null> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .is('deleted_at', null)
      .maybeSingle();

    if (result.error) throw this.unavailable();
    return result.data;
  }

  public async listClinics(accessToken: string, organizationId: string): Promise<ClinicRow[]> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .from('clinics')
      .select('*')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('name');

    if (result.error) throw this.unavailable();
    return result.data;
  }

  public async listMemberships(
    accessToken: string,
    organizationId: string,
  ): Promise<MembershipView[]> {
    const client = this.clients.createUserScoped(accessToken);
    const membershipsResult = await client
      .from('memberships')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at');

    if (membershipsResult.error) throw this.unavailable();

    const ids = membershipsResult.data.map((membership) => membership.id);
    const scopesResult = ids.length
      ? await client
          .from('membership_scopes')
          .select('*')
          .eq('organization_id', organizationId)
          .in('membership_id', ids)
      : { data: [], error: null };

    if (scopesResult.error) throw this.unavailable();

    return membershipsResult.data.map((membership) => ({
      ...membership,
      scopes: scopesResult.data
        .filter((scope) => scope.membership_id === membership.id)
        .map((scope) => ({ clinic_id: scope.clinic_id, unit_id: scope.unit_id })),
    }));
  }

  public async grantMembership(
    accessToken: string,
    organizationId: string,
    input: CreateMembershipInput,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const clinicId = 'clinicId' in input.scope ? input.scope.clinicId : null;
    const unitId = 'unitId' in input.scope ? input.scope.unitId : null;
    const result = await this.clients.createUserScoped(accessToken).rpc('grant_membership', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_clinic_id: clinicId,
      target_organization_id: organizationId,
      target_profile_id: input.profileId,
      target_role: input.role,
      target_unit_id: unitId,
    });

    if (result.error?.code === '23505') {
      throw new ConflictException({
        code: 'MEMBERSHIP_ALREADY_ACTIVE',
        message: 'Este perfil já possui um acesso ativo na organização.',
      });
    }
    if (result.error) throw this.unavailable();

    return result.data;
  }

  public async revokeMembership(
    accessToken: string,
    organizationId: string,
    membershipId: string,
    idempotencyKey: string,
    requestId: string,
  ): Promise<void> {
    const result = await this.clients.createUserScoped(accessToken).rpc('revoke_membership', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_membership_id: membershipId,
      target_organization_id: organizationId,
    });

    if (result.error) throw this.unavailable();
  }

  public async listEffectiveFeatureFlags(
    accessToken: string,
    organizationId: string,
  ): Promise<EffectiveFeatureFlag[]> {
    const client = this.clients.createUserScoped(accessToken);
    const [flagsResult, overridesResult] = await Promise.all([
      client.from('feature_flags').select('id, key, default_enabled').order('key'),
      client
        .from('feature_flag_overrides')
        .select('feature_flag_id, enabled, expires_at')
        .eq('organization_id', organizationId),
    ]);

    if (flagsResult.error || overridesResult.error) throw this.unavailable();

    const now = Date.now();
    return flagsResult.data.map((flag) => {
      const override = overridesResult.data.find(
        (candidate) =>
          candidate.feature_flag_id === flag.id &&
          (!candidate.expires_at || new Date(candidate.expires_at).getTime() > now),
      );

      return { enabled: override?.enabled ?? flag.default_enabled, key: flag.key };
    });
  }

  public async listAuditLogs(accessToken: string, organizationId: string): Promise<AuditLogRow[]> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .from('audit_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('occurred_at', { ascending: false })
      .limit(100);

    if (result.error) throw this.unavailable();
    return result.data;
  }

  public async listIntegrations(
    accessToken: string,
    organizationId: string,
  ): Promise<IntegrationRow[]> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .from('integrations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('provider');

    if (result.error) throw this.unavailable();
    return result.data;
  }

  private unavailable(): ServiceUnavailableException {
    return new ServiceUnavailableException({
      code: 'DATA_SERVICE_UNAVAILABLE',
      message: 'Não foi possível consultar os dados agora.',
    });
  }
}
