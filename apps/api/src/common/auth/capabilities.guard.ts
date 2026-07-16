import { hasCapability, type Capability } from '@althion/domain';
import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedRequest } from '../http/authenticated-request';
import { IS_PUBLIC_KEY } from './public.decorator';
import { REQUIRED_CAPABILITY_KEY } from './require-capability.decorator';

@Injectable()
export class CapabilitiesGuard implements CanActivate {
  public constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const capability = this.reflector.getAllAndOverride<Capability>(REQUIRED_CAPABILITY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || !capability) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const organizationId = this.singleParam(request.params.organizationId);
    const clinicId = this.singleParam(request.params.clinicId);

    if (
      !request.principal ||
      typeof organizationId !== 'string' ||
      !hasCapability(request.principal, organizationId, capability, clinicId)
    ) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'Você não possui acesso a este recurso.',
      });
    }

    return true;
  }

  private singleParam(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
  }
}
