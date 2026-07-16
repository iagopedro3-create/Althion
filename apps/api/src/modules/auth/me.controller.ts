import type { Principal } from '@althion/domain';
import { Controller, Get, UnauthorizedException } from '@nestjs/common';

import { CurrentPrincipal } from '../../common/auth/current-principal.decorator';

@Controller('api/v1/me')
export class MeController {
  @Get()
  public getMe(@CurrentPrincipal() principal: Principal | undefined): Principal {
    if (!principal) {
      throw new UnauthorizedException();
    }

    return principal;
  }
}
