import type { CreateMembershipInput } from '@althion/contracts';
import { Injectable, NotFoundException } from '@nestjs/common';

import { TenancyRepository } from './tenancy.repository';

@Injectable()
export class TenancyService {
  public constructor(private readonly repository: TenancyRepository) {}

  public async getOrganization(accessToken: string, organizationId: string) {
    const organization = await this.repository.getOrganization(accessToken, organizationId);
    if (!organization) {
      throw new NotFoundException({
        code: 'ORGANIZATION_NOT_FOUND',
        message: 'Organização não encontrada.',
      });
    }
    return organization;
  }

  public listClinics(accessToken: string, organizationId: string) {
    return this.repository.listClinics(accessToken, organizationId);
  }

  public listMemberships(accessToken: string, organizationId: string) {
    return this.repository.listMemberships(accessToken, organizationId);
  }

  public grantMembership(
    accessToken: string,
    organizationId: string,
    input: CreateMembershipInput,
    idempotencyKey: string,
    requestId: string,
  ) {
    return this.repository.grantMembership(
      accessToken,
      organizationId,
      input,
      idempotencyKey,
      requestId,
    );
  }

  public revokeMembership(
    accessToken: string,
    organizationId: string,
    membershipId: string,
    idempotencyKey: string,
    requestId: string,
  ) {
    return this.repository.revokeMembership(
      accessToken,
      organizationId,
      membershipId,
      idempotencyKey,
      requestId,
    );
  }

  public listEffectiveFeatureFlags(accessToken: string, organizationId: string) {
    return this.repository.listEffectiveFeatureFlags(accessToken, organizationId);
  }

  public listAuditLogs(accessToken: string, organizationId: string) {
    return this.repository.listAuditLogs(accessToken, organizationId);
  }

  public listIntegrations(accessToken: string, organizationId: string) {
    return this.repository.listIntegrations(accessToken, organizationId);
  }
}
