import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ApiConfigService } from '../../config/api-config.service';
import type { AuthenticatedRequest } from '../http/authenticated-request';
import { IS_PUBLIC_KEY } from './public.decorator';
import { REQUIRES_MFA_KEY } from './require-mfa.decorator';

/**
 * Defesa em profundidade: mesmo que o web force a inscrição no segundo fator,
 * uma chamada direta à API com token `aal1` precisa ser barrada nas rotas
 * marcadas com `@RequireMfa()`.
 *
 * Enquanto `MFA_ENFORCEMENT` for `disabled` (o padrão), o guard é inerte —
 * exigir o fator antes de existir a tela de inscrição travaria o acesso.
 */
@Injectable()
export class MfaGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,
    private readonly config: ApiConfigService,
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    if (this.config.environment.MFA_ENFORCEMENT !== 'enforced') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiresMfa = this.reflector.getAllAndOverride<boolean>(REQUIRES_MFA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || !requiresMfa) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.assuranceLevel !== 'aal2') {
      throw new ForbiddenException({
        code: 'MFA_REQUIRED',
        message: 'Conclua a verificação em duas etapas para acessar este recurso.',
      });
    }

    return true;
  }
}
