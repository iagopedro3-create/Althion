import {
  googleAdsClinicParamsSchema,
  saveGoogleAdsCredentialsSchema,
  type SaveGoogleAdsCredentialsInput,
} from '@althion/contracts';
import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { z } from 'zod';

import { CurrentAccessToken } from '../../common/auth/current-access-token.decorator';
import { RequireCapability } from '../../common/auth/require-capability.decorator';
import { CurrentRequestId } from '../../common/http/current-request-id.decorator';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { parseIdempotencyKey } from '../cockpit/incidents.controller';
import { GoogleAdsService } from './google-ads.service';

@Controller('api/v1/organizations/:organizationId/clinics/:clinicId/google-ads')
export class GoogleAdsController {
  public constructor(private readonly service: GoogleAdsService) {}

  @Get('credentials')
  @RequireCapability('google_ads:read')
  public getCredentials(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(googleAdsClinicParamsSchema))
    params: z.infer<typeof googleAdsClinicParamsSchema>,
  ) {
    return this.service.getCredentials(token, params.organizationId, params.clinicId);
  }

  @Post('credentials')
  @RequireCapability('google_ads:write')
  public saveCredentials(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(googleAdsClinicParamsSchema))
    params: z.infer<typeof googleAdsClinicParamsSchema>,
    @Body(new ZodValidationPipe(saveGoogleAdsCredentialsSchema))
    input: SaveGoogleAdsCredentialsInput,
  ) {
    return this.service.saveCredentials(
      token,
      params.organizationId,
      params.clinicId,
      input,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
  }

  @Get('campaigns')
  @RequireCapability('google_ads:read')
  public listCampaigns(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(googleAdsClinicParamsSchema))
    params: z.infer<typeof googleAdsClinicParamsSchema>,
  ) {
    return this.service.listCampaigns(token, params.organizationId, params.clinicId);
  }

  @Get('attribution')
  @RequireCapability('google_ads:read')
  public getAttributionSummary(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(googleAdsClinicParamsSchema))
    params: z.infer<typeof googleAdsClinicParamsSchema>,
  ) {
    return this.service.getAttributionSummary(token, params.organizationId, params.clinicId);
  }

  @Post('sync')
  @RequireCapability('google_ads:write')
  public sync(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(googleAdsClinicParamsSchema))
    params: z.infer<typeof googleAdsClinicParamsSchema>,
  ) {
    return this.service.sync(
      token,
      params.organizationId,
      params.clinicId,
      parseIdempotencyKey(idempotencyKey),
      requestId,
    );
  }
}
