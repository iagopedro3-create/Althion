import type {
  CreateRequestInput,
  RequestListQuery,
  RequestTransitionInput,
} from '@althion/contracts';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PortalFeatureService } from '../portal/portal-feature.service';
import { RequestsRepository } from './requests.repository';

@Injectable()
export class RequestsService {
  public constructor(
    private readonly feature: PortalFeatureService,
    private readonly requests: RequestsRepository,
  ) {}

  public async list(
    token: string,
    organizationId: string,
    clinicId: string,
    filters: RequestListQuery,
  ) {
    await this.feature.ensureEnabled(token, organizationId);
    return this.requests.list(token, organizationId, clinicId, filters);
  }

  public async get(token: string, organizationId: string, clinicId: string, requestId: string) {
    await this.feature.ensureEnabled(token, organizationId);
    const result = await this.requests.get(token, organizationId, clinicId, requestId);
    if (!result) {
      throw new NotFoundException({
        code: 'PORTAL_REQUEST_NOT_FOUND',
        message: 'Solicitação não encontrada.',
      });
    }
    return result;
  }

  public async create(
    token: string,
    organizationId: string,
    clinicId: string,
    input: CreateRequestInput,
    idempotencyKey: string,
    requestId: string,
  ) {
    await this.feature.ensureEnabled(token, organizationId);
    return this.requests.create(token, organizationId, clinicId, input, idempotencyKey, requestId);
  }

  public async transition(
    token: string,
    organizationId: string,
    clinicId: string,
    portalRequestId: string,
    input: RequestTransitionInput,
    idempotencyKey: string,
    requestId: string,
  ) {
    await this.feature.ensureEnabled(token, organizationId);
    return this.requests.transition(
      token,
      organizationId,
      clinicId,
      portalRequestId,
      input,
      idempotencyKey,
      requestId,
    );
  }
}
