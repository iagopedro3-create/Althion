import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../../common/auth/public.decorator';
import type { AuthenticatedRequest } from '../../common/http/authenticated-request';
import { JwtVerifierService } from './jwt-verifier.service';
import { PrincipalService } from './principal.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,
    private readonly verifier: JwtVerifierService,
    private readonly principals: PrincipalService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.header('authorization'));
    const subject = await this.verifier.verify(token);
    const principal = await this.principals.resolve(token, subject);

    request.accessToken = token;
    request.principal = principal;
    return true;
  }

  private extractBearerToken(header: string | undefined): string {
    const [scheme, token, extra] = header?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token || extra) {
      throw new UnauthorizedException({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Autenticação obrigatória.',
      });
    }

    return token;
  }
}
