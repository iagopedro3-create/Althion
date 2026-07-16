import { portalClinicParamsSchema } from '@althion/contracts';
import { Controller, Get, Param } from '@nestjs/common';
import { z } from 'zod';

import { CurrentAccessToken } from '../../common/auth/current-access-token.decorator';
import { RequireCapability } from '../../common/auth/require-capability.decorator';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { PortalService } from './portal.service';

@Controller('api/v1/organizations/:organizationId/clinics/:clinicId/portal')
export class PortalController {
  public constructor(private readonly portal: PortalService) {}

  @Get('dashboard')
  @RequireCapability('portal:read')
  public getDashboard(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(portalClinicParamsSchema))
    params: z.infer<typeof portalClinicParamsSchema>,
  ) {
    return this.portal.getDashboard(token, params.organizationId, params.clinicId);
  }

  @Get('indicators')
  @RequireCapability('portal:read')
  public getIndicators(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(portalClinicParamsSchema))
    params: z.infer<typeof portalClinicParamsSchema>,
  ) {
    return this.portal.getIndicators(token, params.organizationId, params.clinicId);
  }

  @Get('opportunities')
  @RequireCapability('portal:read')
  public getOpportunities(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(portalClinicParamsSchema))
    params: z.infer<typeof portalClinicParamsSchema>,
  ) {
    return this.portal.getOpportunities(token, params.organizationId, params.clinicId);
  }

  @Get('specialist')
  @RequireCapability('portal:read')
  public getSpecialist(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(portalClinicParamsSchema))
    params: z.infer<typeof portalClinicParamsSchema>,
  ) {
    return this.portal.getSpecialist(token, params.organizationId, params.clinicId);
  }

  @Get('people')
  @RequireCapability('portal:read')
  public listPeople(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(portalClinicParamsSchema))
    params: z.infer<typeof portalClinicParamsSchema>,
  ) {
    return this.portal.listPeople(token, params.organizationId, params.clinicId);
  }
}
