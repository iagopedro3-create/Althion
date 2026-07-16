import {
  createImprovementPlanSchema,
  createTaskSchema,
  improvementPlanParamsSchema,
  improvementPlanTransitionSchema,
  portalClinicParamsSchema,
  taskParamsSchema,
  taskTransitionSchema,
  type CreateImprovementPlanInput,
  type CreateTaskInput,
  type ImprovementPlanTransitionInput,
  type TaskTransitionInput,
} from '@althion/contracts';
import { BadRequestException, Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { z } from 'zod';

import { CurrentAccessToken } from '../../common/auth/current-access-token.decorator';
import { RequireCapability } from '../../common/auth/require-capability.decorator';
import { CurrentRequestId } from '../../common/http/current-request-id.decorator';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { ImprovementPlansService } from './improvement-plans.service';

const idempotencyKeySchema = z.string().trim().min(16).max(200);

abstract class IdempotentController {
  protected parseIdempotencyKey(value: string | undefined): string {
    const parsed = idempotencyKeySchema.safeParse(value);
    if (!parsed.success) {
      throw new BadRequestException({
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Informe uma chave de idempotência válida.',
      });
    }
    return parsed.data;
  }
}

@Controller('api/v1/organizations/:organizationId/clinics/:clinicId/improvement-plans')
export class ImprovementPlansController extends IdempotentController {
  public constructor(private readonly plans: ImprovementPlansService) {
    super();
  }

  @Get('current')
  @RequireCapability('improvement_plan:read')
  public getCurrent(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(portalClinicParamsSchema))
    params: z.infer<typeof portalClinicParamsSchema>,
  ) {
    return this.plans.getCurrent(token, params.organizationId, params.clinicId);
  }

  @Post()
  @RequireCapability('improvement_plan:manage')
  public async create(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(portalClinicParamsSchema))
    params: z.infer<typeof portalClinicParamsSchema>,
    @Body(new ZodValidationPipe(createImprovementPlanSchema)) input: CreateImprovementPlanInput,
  ) {
    const id = await this.plans.createPlan(
      token,
      params.organizationId,
      params.clinicId,
      input,
      this.parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: 'draft' as const };
  }

  @Post(':planId/transitions')
  @RequireCapability('improvement_plan:manage')
  public async transition(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(improvementPlanParamsSchema))
    params: z.infer<typeof improvementPlanParamsSchema>,
    @Body(new ZodValidationPipe(improvementPlanTransitionSchema))
    input: ImprovementPlanTransitionInput,
  ) {
    const id = await this.plans.transitionPlan(
      token,
      params.organizationId,
      params.clinicId,
      params.planId,
      input,
      this.parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: input.toStatus };
  }

  @Post(':planId/tasks')
  @RequireCapability('task:manage')
  public async createTask(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(improvementPlanParamsSchema))
    params: z.infer<typeof improvementPlanParamsSchema>,
    @Body(new ZodValidationPipe(createTaskSchema)) input: CreateTaskInput,
  ) {
    const id = await this.plans.createTask(
      token,
      params.organizationId,
      params.clinicId,
      params.planId,
      input,
      this.parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: 'todo' as const };
  }
}

@Controller('api/v1/organizations/:organizationId/clinics/:clinicId/tasks')
export class PortalTasksController extends IdempotentController {
  public constructor(private readonly plans: ImprovementPlansService) {
    super();
  }

  @Post(':taskId/transitions')
  @RequireCapability('task:manage')
  public async transition(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(taskParamsSchema)) params: z.infer<typeof taskParamsSchema>,
    @Body(new ZodValidationPipe(taskTransitionSchema)) input: TaskTransitionInput,
  ) {
    const id = await this.plans.transitionTask(
      token,
      params.organizationId,
      params.clinicId,
      params.taskId,
      input,
      this.parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: input.toStatus };
  }
}
