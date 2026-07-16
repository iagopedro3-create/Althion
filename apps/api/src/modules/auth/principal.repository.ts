import type { Principal } from '@althion/domain';
import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';

@Injectable()
export class PrincipalRepository {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async resolve(accessToken: string, subject: string): Promise<Principal> {
    const client = this.clients.createUserScoped(accessToken);
    const profileResult = await client
      .from('profiles')
      .select('id, auth_user_id')
      .eq('auth_user_id', subject)
      .maybeSingle();

    if (profileResult.error) {
      throw this.unavailable();
    }

    if (!profileResult.data) {
      throw new UnauthorizedException({
        code: 'PROFILE_NOT_PROVISIONED',
        message: 'Seu perfil ainda não foi provisionado.',
      });
    }

    const profileId = profileResult.data.id;
    const [membershipsResult, platformRolesResult, specialistResult] = await Promise.all([
      client
        .from('memberships')
        .select('id, organization_id, role, status')
        .eq('profile_id', profileId),
      client.from('platform_roles').select('role, status, revoked_at').eq('profile_id', profileId),
      client
        .from('relationship_specialists')
        .select('id, status')
        .eq('profile_id', profileId)
        .maybeSingle(),
    ]);

    if (membershipsResult.error || platformRolesResult.error || specialistResult.error) {
      throw this.unavailable();
    }

    const memberships = membershipsResult.data;
    const membershipIds = memberships.map((membership) => membership.id);
    const scopesResult = membershipIds.length
      ? await client
          .from('membership_scopes')
          .select('membership_id, clinic_id, unit_id')
          .in('membership_id', membershipIds)
      : { data: [], error: null };

    if (scopesResult.error) {
      throw this.unavailable();
    }

    const assignmentsResult = specialistResult.data
      ? await client
          .from('relationship_assignments')
          .select('organization_id, clinic_id, status')
          .eq('specialist_id', specialistResult.data.id)
      : { data: [], error: null };

    if (assignmentsResult.error) {
      throw this.unavailable();
    }

    return {
      assignments: assignmentsResult.data.map((assignment) => ({
        clinicId: assignment.clinic_id,
        organizationId: assignment.organization_id,
        status: assignment.status === 'active' ? 'active' : 'ended',
      })),
      memberships: memberships.map((membership) => ({
        organizationId: membership.organization_id,
        role: membership.role as Principal['memberships'][number]['role'],
        scopes: scopesResult.data
          .filter((scope) => scope.membership_id === membership.id)
          .map((scope) => ({ clinicId: scope.clinic_id, unitId: scope.unit_id })),
        status: membership.status as Principal['memberships'][number]['status'],
      })),
      platformRoles: platformRolesResult.data
        .filter((role) => role.status === 'active' && role.revoked_at === null)
        .map(() => 'platform_admin' as const),
      profileId,
      subject,
    };
  }

  private unavailable(): ServiceUnavailableException {
    return new ServiceUnavailableException({
      code: 'IDENTITY_SERVICE_UNAVAILABLE',
      message: 'Não foi possível validar suas permissões agora.',
    });
  }
}
