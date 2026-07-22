import type { Principal } from '@althion/domain';
import { Controller, Get, UnauthorizedException } from '@nestjs/common';

import { CurrentAssuranceLevel } from '../../common/auth/current-assurance-level.decorator';
import { CurrentPrincipal } from '../../common/auth/current-principal.decorator';
import type { AssuranceLevel } from './access-token-claims';

export interface MeResponse extends Principal {
  assuranceLevel: AssuranceLevel;
}

@Controller('api/v1/me')
export class MeController {
  @Get()
  public getMe(
    @CurrentPrincipal() principal: Principal | undefined,
    @CurrentAssuranceLevel() assuranceLevel: AssuranceLevel | undefined,
  ): MeResponse {
    if (!principal) {
      throw new UnauthorizedException();
    }

    // O web usa isto para decidir se pede a inscrição no segundo fator, sem
    // precisar decodificar o JWT no cliente.
    return { ...principal, assuranceLevel: assuranceLevel ?? 'aal1' };
  }
}
