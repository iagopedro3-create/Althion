import {
  createSuppressionSchema,
  recoveryActionDecisionSchema,
  recoveryActionParamsSchema,
  recoveryClinicParamsSchema,
  recoveryOpportunityDecisionSchema,
  recoveryOpportunityParamsSchema,
  recoverySuppressionParamsSchema,
  type CreateSuppressionInput,
  type RecoveryActionDecisionInput,
  type RecoveryOpportunityDecisionInput,
} from '@althion/contracts';
import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { z } from 'zod';

import { CurrentAccessToken } from '../../common/auth/current-access-token.decorator';
import { RequireCapability } from '../../common/auth/require-capability.decorator';
import { CurrentRequestId } from '../../common/http/current-request-id.decorator';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { parseIdempotencyKey } from '../cockpit/incidents.controller';
import { RecoveryFeatureService } from './recovery-feature.service';
import { RecoveryRepository } from './recovery.repository';
import { RecoveryService } from './recovery.service';

@Controller('api/v1/organizations/:organizationId/clinics/:clinicId/recovery')
export class RecoveryController {
  public constructor(
    private readonly feature: RecoveryFeatureService,
    private readonly recovery: RecoveryService,
    private readonly repository: RecoveryRepository,
  ) {}

  @Get('queue')
  @RequireCapability('recovery:read')
  public getQueue(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(recoveryClinicParamsSchema))
    params: z.infer<typeof recoveryClinicParamsSchema>,
  ) {
    return this.recovery.getQueue(token, params.organizationId, params.clinicId);
  }

  @Post('simulations')
  @RequireCapability('recovery:simulate')
  public simulate(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(recoveryClinicParamsSchema))
    params: z.infer<typeof recoveryClinicParamsSchema>,
  ) {
    return this.recovery.simulate(
      token,
      params.organizationId,
      params.clinicId,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
  }

  @Post('opportunities/:opportunityId/decisions')
  @RequireCapability('recovery:decide')
  public async decideOpportunity(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(recoveryOpportunityParamsSchema))
    params: z.infer<typeof recoveryOpportunityParamsSchema>,
    @Body(new ZodValidationPipe(recoveryOpportunityDecisionSchema))
    input: RecoveryOpportunityDecisionInput,
  ) {
    await this.feature.ensureEnabled(token);
    const id = await this.repository.decideOpportunity(
      token,
      params.organizationId,
      params.clinicId,
      params.opportunityId,
      input,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: input.decision };
  }

  @Post('actions/:actionId/decisions')
  @RequireCapability('recovery:decide')
  public async decideAction(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(recoveryActionParamsSchema))
    params: z.infer<typeof recoveryActionParamsSchema>,
    @Body(new ZodValidationPipe(recoveryActionDecisionSchema))
    input: RecoveryActionDecisionInput,
  ) {
    await this.feature.ensureEnabled(token);
    const id = await this.repository.decideAction(
      token,
      params.organizationId,
      params.clinicId,
      params.actionId,
      input,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: input.decision };
  }

  @Post('suppressions')
  @RequireCapability('suppression:manage')
  public async createSuppression(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(recoveryClinicParamsSchema))
    params: z.infer<typeof recoveryClinicParamsSchema>,
    @Body(new ZodValidationPipe(createSuppressionSchema)) input: CreateSuppressionInput,
  ) {
    await this.feature.ensureEnabled(token);
    const id = await this.repository.createSuppression(
      token,
      params.organizationId,
      params.clinicId,
      input,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: 'active' as const };
  }

  @Post('suppressions/:suppressionId/revoke')
  @RequireCapability('suppression:manage')
  public async revokeSuppression(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(recoverySuppressionParamsSchema))
    params: z.infer<typeof recoverySuppressionParamsSchema>,
  ) {
    await this.feature.ensureEnabled(token);
    const id = await this.repository.revokeSuppression(
      token,
      params.organizationId,
      params.clinicId,
      params.suppressionId,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: 'revoked' as const };
  }
}
