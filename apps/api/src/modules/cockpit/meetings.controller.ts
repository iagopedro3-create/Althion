import {
  cockpitClinicParamsSchema,
  createMeetingSchema,
  meetingListQuerySchema,
  meetingParamsSchema,
  meetingTransitionSchema,
  type CreateMeetingInput,
  type MeetingListQuery,
  type MeetingTransitionInput,
} from '@althion/contracts';
import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { z } from 'zod';

import { CurrentAccessToken } from '../../common/auth/current-access-token.decorator';
import { RequireCapability } from '../../common/auth/require-capability.decorator';
import { CurrentRequestId } from '../../common/http/current-request-id.decorator';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { CockpitFeatureService } from './cockpit-feature.service';
import { CockpitRepository } from './cockpit.repository';
import { parseIdempotencyKey } from './incidents.controller';

@Controller('api/v1/organizations/:organizationId/clinics/:clinicId/meetings')
export class MeetingsController {
  public constructor(
    private readonly feature: CockpitFeatureService,
    private readonly cockpit: CockpitRepository,
  ) {}

  @Get()
  @RequireCapability('meeting:read')
  public async list(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(cockpitClinicParamsSchema))
    params: z.infer<typeof cockpitClinicParamsSchema>,
    @Query(new ZodValidationPipe(meetingListQuerySchema)) query: MeetingListQuery,
  ) {
    await this.feature.ensureEnabled(token);
    return this.cockpit.listMeetings(token, params.organizationId, params.clinicId, query);
  }

  @Post()
  @RequireCapability('meeting:manage')
  public async create(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(cockpitClinicParamsSchema))
    params: z.infer<typeof cockpitClinicParamsSchema>,
    @Body(new ZodValidationPipe(createMeetingSchema)) input: CreateMeetingInput,
  ) {
    await this.feature.ensureEnabled(token);
    const id = await this.cockpit.createMeeting(
      token,
      params.organizationId,
      params.clinicId,
      input,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: 'scheduled' as const };
  }

  @Post(':meetingId/transitions')
  @RequireCapability('meeting:manage')
  public async transition(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(meetingParamsSchema))
    params: z.infer<typeof meetingParamsSchema>,
    @Body(new ZodValidationPipe(meetingTransitionSchema)) input: MeetingTransitionInput,
  ) {
    await this.feature.ensureEnabled(token);
    const id = await this.cockpit.transitionMeeting(
      token,
      params.organizationId,
      params.clinicId,
      params.meetingId,
      input,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: input.toStatus };
  }
}
