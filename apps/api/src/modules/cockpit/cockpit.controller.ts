import { cockpitClinicParamsSchema } from '@althion/contracts';
import type { Principal } from '@althion/domain';
import { Controller, ForbiddenException, Get, Param } from '@nestjs/common';
import { z } from 'zod';

import { CurrentAccessToken } from '../../common/auth/current-access-token.decorator';
import { CurrentPrincipal } from '../../common/auth/current-principal.decorator';
import { RequireCapability } from '../../common/auth/require-capability.decorator';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { CockpitService } from './cockpit.service';

@Controller('api/v1')
export class CockpitController {
  public constructor(private readonly cockpit: CockpitService) {}

  // Sem organizationId na rota: a autorização é feita pelo principal e cada linha pelo RLS.
  @Get('cockpit/portfolio')
  public getPortfolio(
    @CurrentAccessToken() token: string,
    @CurrentPrincipal() principal: Principal | undefined,
  ) {
    if (!principal) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'Você não possui acesso a este recurso.',
      });
    }
    return this.cockpit.getPortfolio(token, principal);
  }

  @Get('organizations/:organizationId/clinics/:clinicId/cockpit/account')
  @RequireCapability('cockpit:read')
  public getAccount(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(cockpitClinicParamsSchema))
    params: z.infer<typeof cockpitClinicParamsSchema>,
  ) {
    return this.cockpit.getAccount(token, params.organizationId, params.clinicId);
  }
}
