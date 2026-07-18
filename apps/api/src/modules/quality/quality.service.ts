import { Injectable } from '@nestjs/common';
import type {
  CreateClinicalFlagInput,
  CreateEvaluationInput,
  ResolveClinicalFlagInput,
} from '@althion/contracts';

import { QualityFeatureService } from './quality-feature.service';
import { QualityRepository } from './quality.repository';

@Injectable()
export class QualityService {
  public constructor(
    private readonly feature: QualityFeatureService,
    private readonly repository: QualityRepository,
  ) {}

  public async listRubrics(accessToken: string) {
    await this.feature.ensureEnabled(accessToken);
    return this.repository.listRubrics(accessToken);
  }

  public async listEvaluations(accessToken: string, organizationId: string, clinicId: string) {
    await this.feature.ensureEnabled(accessToken);
    return this.repository.listEvaluations(accessToken, organizationId, clinicId);
  }

  public async listClinicalFlags(accessToken: string, organizationId: string, clinicId: string) {
    await this.feature.ensureEnabled(accessToken);
    return this.repository.listClinicalFlags(accessToken, organizationId, clinicId);
  }

  public async createEvaluation(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: CreateEvaluationInput,
    idempotencyKey: string,
    requestId: string,
  ) {
    await this.feature.ensureEnabled(accessToken);
    const id = await this.repository.createEvaluation(
      accessToken,
      organizationId,
      clinicId,
      input,
      idempotencyKey,
      requestId,
    );
    return { id };
  }

  public async flagConversation(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: CreateClinicalFlagInput,
    idempotencyKey: string,
    requestId: string,
  ) {
    await this.feature.ensureEnabled(accessToken);
    const id = await this.repository.flagConversation(
      accessToken,
      organizationId,
      clinicId,
      input,
      idempotencyKey,
      requestId,
    );
    return { id };
  }

  public async resolveClinicalFlag(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    flagId: string,
    input: ResolveClinicalFlagInput,
    idempotencyKey: string,
    requestId: string,
  ) {
    await this.feature.ensureEnabled(accessToken);
    const id = await this.repository.resolveClinicalFlag(
      accessToken,
      organizationId,
      clinicId,
      flagId,
      input,
      idempotencyKey,
      requestId,
    );
    return { id };
  }
}
