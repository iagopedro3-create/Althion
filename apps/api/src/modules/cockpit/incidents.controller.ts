import {
  cockpitClinicParamsSchema,
  createIncidentSchema,
  incidentListQuerySchema,
  incidentParamsSchema,
  incidentTransitionSchema,
  type CreateIncidentInput,
  type IncidentListQuery,
  type IncidentTransitionInput,
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
import { CockpitFeatureService } from './cockpit-feature.service';
import { CockpitRepository } from './cockpit.repository';

const idempotencyKeySchema = z.string().trim().min(16).max(200);

@Controller('api/v1/organizations/:organizationId/clinics/:clinicId/incidents')
export class IncidentsController {
  public constructor(
    private readonly feature: CockpitFeatureService,
    private readonly cockpit: CockpitRepository,
  ) {}

  @Get()
  @RequireCapability('incident:read')
  public async list(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(cockpitClinicParamsSchema))
    params: z.infer<typeof cockpitClinicParamsSchema>,
    @Query(new ZodValidationPipe(incidentListQuerySchema)) query: IncidentListQuery,
  ) {
    await this.feature.ensureEnabled(token);
    return this.cockpit.listIncidents(token, params.organizationId, params.clinicId, query);
  }

  @Post()
  @RequireCapability('incident:manage')
  public async create(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(cockpitClinicParamsSchema))
    params: z.infer<typeof cockpitClinicParamsSchema>,
    @Body(new ZodValidationPipe(createIncidentSchema)) input: CreateIncidentInput,
  ) {
    await this.feature.ensureEnabled(token);
    const id = await this.cockpit.createIncident(
      token,
      params.organizationId,
      params.clinicId,
      input,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: 'open' as const };
  }

  @Post(':incidentId/transitions')
  @RequireCapability('incident:manage')
  public async transition(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(incidentParamsSchema))
    params: z.infer<typeof incidentParamsSchema>,
    @Body(new ZodValidationPipe(incidentTransitionSchema)) input: IncidentTransitionInput,
  ) {
    await this.feature.ensureEnabled(token);
    const id = await this.cockpit.transitionIncident(
      token,
      params.organizationId,
      params.clinicId,
      params.incidentId,
      input,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: input.toStatus };
  }
}

export function parseIdempotencyKey(value: string | undefined): string {
  const parsed = idempotencyKeySchema.safeParse(value);
  if (!parsed.success) {
    throw new BadRequestException({
      code: 'IDEMPOTENCY_KEY_REQUIRED',
      message: 'Informe uma chave de idempotência válida.',
    });
  }
  return parsed.data;
}
