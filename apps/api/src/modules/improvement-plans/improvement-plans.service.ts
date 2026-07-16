import type {
  CreateImprovementPlanInput,
  CreateTaskInput,
  ImprovementPlanTransitionInput,
  TaskTransitionInput,
} from '@althion/contracts';
import { calculatePlanProgress } from '@althion/domain';
import { Injectable } from '@nestjs/common';

import { PortalFeatureService } from '../portal/portal-feature.service';
import { ImprovementPlansRepository } from './improvement-plans.repository';

@Injectable()
export class ImprovementPlansService {
  public constructor(
    private readonly feature: PortalFeatureService,
    private readonly plans: ImprovementPlansRepository,
  ) {}

  public async getCurrent(token: string, organizationId: string, clinicId: string) {
    await this.feature.ensureEnabled(token, organizationId);
    const result = await this.plans.getCurrent(token, organizationId, clinicId);
    return result
      ? { ...result, progress: calculatePlanProgress(result.tasks) }
      : { history: [], plan: null, progress: null, taskHistory: [], tasks: [] };
  }

  public async createPlan(
    token: string,
    organizationId: string,
    clinicId: string,
    input: CreateImprovementPlanInput,
    idempotencyKey: string,
    requestId: string,
  ) {
    await this.feature.ensureEnabled(token, organizationId);
    return this.plans.createPlan(token, organizationId, clinicId, input, idempotencyKey, requestId);
  }

  public async transitionPlan(
    token: string,
    organizationId: string,
    clinicId: string,
    planId: string,
    input: ImprovementPlanTransitionInput,
    idempotencyKey: string,
    requestId: string,
  ) {
    await this.feature.ensureEnabled(token, organizationId);
    return this.plans.transitionPlan(
      token,
      organizationId,
      clinicId,
      planId,
      input,
      idempotencyKey,
      requestId,
    );
  }

  public async createTask(
    token: string,
    organizationId: string,
    clinicId: string,
    planId: string,
    input: CreateTaskInput,
    idempotencyKey: string,
    requestId: string,
  ) {
    await this.feature.ensureEnabled(token, organizationId);
    return this.plans.createTask(
      token,
      organizationId,
      clinicId,
      planId,
      input,
      idempotencyKey,
      requestId,
    );
  }

  public async transitionTask(
    token: string,
    organizationId: string,
    clinicId: string,
    taskId: string,
    input: TaskTransitionInput,
    idempotencyKey: string,
    requestId: string,
  ) {
    await this.feature.ensureEnabled(token, organizationId);
    return this.plans.transitionTask(
      token,
      organizationId,
      clinicId,
      taskId,
      input,
      idempotencyKey,
      requestId,
    );
  }
}
