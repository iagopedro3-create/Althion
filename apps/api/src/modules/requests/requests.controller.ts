import {
  createRequestSchema,
  portalClinicParamsSchema,
  requestListQuerySchema,
  requestParamsSchema,
  requestTransitionSchema,
  type CreateRequestInput,
  type RequestListQuery,
  type RequestTransitionInput,
} from '@althion/contracts';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { z } from 'zod';

import { CurrentAccessToken } from '../../common/auth/current-access-token.decorator';
import { RequireCapability } from '../../common/auth/require-capability.decorator';
import { CurrentRequestId } from '../../common/http/current-request-id.decorator';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { RequestsService } from './requests.service';

const idempotencyKeySchema = z.string().trim().min(16).max(200);

@Controller('api/v1/organizations/:organizationId/clinics/:clinicId/requests')
export class RequestsController {
  public constructor(private readonly requests: RequestsService) {}

  @Get()
  @RequireCapability('request:read')
  public list(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(portalClinicParamsSchema))
    params: z.infer<typeof portalClinicParamsSchema>,
    @Query(new ZodValidationPipe(requestListQuerySchema)) query: RequestListQuery,
  ) {
    return this.requests.list(token, params.organizationId, params.clinicId, query);
  }

  @Post()
  @RequireCapability('request:create')
  public async create(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(portalClinicParamsSchema))
    params: z.infer<typeof portalClinicParamsSchema>,
    @Body(new ZodValidationPipe(createRequestSchema)) input: CreateRequestInput,
  ) {
    const id = await this.requests.create(
      token,
      params.organizationId,
      params.clinicId,
      input,
      this.parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: 'open' as const };
  }

  @Get(':requestId')
  @RequireCapability('request:read')
  public get(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(requestParamsSchema))
    params: z.infer<typeof requestParamsSchema>,
  ) {
    return this.requests.get(token, params.organizationId, params.clinicId, params.requestId);
  }

  @Post(':requestId/transitions')
  @RequireCapability('request:manage')
  public async transition(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(requestParamsSchema))
    params: z.infer<typeof requestParamsSchema>,
    @Body(new ZodValidationPipe(requestTransitionSchema)) input: RequestTransitionInput,
  ) {
    const id = await this.requests.transition(
      token,
      params.organizationId,
      params.clinicId,
      params.requestId,
      input,
      this.parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: input.toStatus };
  }

  private parseIdempotencyKey(value: string | undefined): string {
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
