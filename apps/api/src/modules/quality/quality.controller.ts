import {
  clinicalFlagParamsSchema,
  createClinicalFlagSchema,
  createEvaluationSchema,
  qualityClinicParamsSchema,
  resolveClinicalFlagSchema,
  type CreateClinicalFlagInput,
  type CreateEvaluationInput,
  type ResolveClinicalFlagInput,
} from '@althion/contracts';
import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { z } from 'zod';

import { CurrentAccessToken } from '../../common/auth/current-access-token.decorator';
import { RequireCapability } from '../../common/auth/require-capability.decorator';
import { CurrentRequestId } from '../../common/http/current-request-id.decorator';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { parseIdempotencyKey } from '../cockpit/incidents.controller';
import { QualityService } from './quality.service';

@Controller('api/v1/organizations/:organizationId/clinics/:clinicId/quality')
export class QualityController {
  public constructor(private readonly service: QualityService) {}

  @Get('rubrics')
  @RequireCapability('quality:read')
  public listRubrics(@CurrentAccessToken() token: string) {
    return this.service.listRubrics(token);
  }

  @Get('evaluations')
  @RequireCapability('quality:read')
  public listEvaluations(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(qualityClinicParamsSchema))
    params: z.infer<typeof qualityClinicParamsSchema>,
  ) {
    return this.service.listEvaluations(token, params.organizationId, params.clinicId);
  }

  @Post('evaluations')
  @RequireCapability('quality:evaluate')
  public createEvaluation(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(qualityClinicParamsSchema))
    params: z.infer<typeof qualityClinicParamsSchema>,
    @Body(new ZodValidationPipe(createEvaluationSchema)) input: CreateEvaluationInput,
  ) {
    return this.service.createEvaluation(
      token,
      params.organizationId,
      params.clinicId,
      input,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
  }

  @Get('clinical-flags')
  @RequireCapability('quality:read')
  public listClinicalFlags(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(qualityClinicParamsSchema))
    params: z.infer<typeof qualityClinicParamsSchema>,
  ) {
    return this.service.listClinicalFlags(token, params.organizationId, params.clinicId);
  }

  @Post('clinical-flags')
  @RequireCapability('quality:flag')
  public flagConversation(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(qualityClinicParamsSchema))
    params: z.infer<typeof qualityClinicParamsSchema>,
    @Body(new ZodValidationPipe(createClinicalFlagSchema)) input: CreateClinicalFlagInput,
  ) {
    return this.service.flagConversation(
      token,
      params.organizationId,
      params.clinicId,
      input,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
  }

  @Post('clinical-flags/:flagId/resolve')
  @RequireCapability('quality:resolve')
  public resolveClinicalFlag(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(clinicalFlagParamsSchema))
    params: z.infer<typeof clinicalFlagParamsSchema>,
    @Body(new ZodValidationPipe(resolveClinicalFlagSchema)) input: ResolveClinicalFlagInput,
  ) {
    return this.service.resolveClinicalFlag(
      token,
      params.organizationId,
      params.clinicId,
      params.flagId,
      input,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
  }
}
