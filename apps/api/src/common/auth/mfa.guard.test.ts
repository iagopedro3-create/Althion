import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import 'reflect-metadata';
import { describe, expect, it } from 'vitest';

import type { ApiConfigService } from '../../config/api-config.service';
import type { AssuranceLevel } from '../../modules/auth/access-token-claims';
import type { AuthenticatedRequest } from '../http/authenticated-request';
import { MfaGuard } from './mfa.guard';
import { IS_PUBLIC_KEY } from './public.decorator';
import { REQUIRES_MFA_KEY } from './require-mfa.decorator';

// Os decorators são aplicados na mão porque o transform do vitest não emite
// metadata de decorator (só o build do Nest emite); o efeito sobre o Reflector
// é o mesmo.
const openRoute = (): void => {};

const sensitiveRoute = (): void => {};
Reflect.defineMetadata(REQUIRES_MFA_KEY, true, sensitiveRoute);

const publicSensitiveRoute = (): void => {};
Reflect.defineMetadata(REQUIRES_MFA_KEY, true, publicSensitiveRoute);
Reflect.defineMetadata(IS_PUBLIC_KEY, true, publicSensitiveRoute);

class SampleController {}

function contextFor(
  handler: () => void,
  assuranceLevel: AssuranceLevel | undefined,
): ExecutionContext {
  const request = { assuranceLevel } as AuthenticatedRequest;

  return {
    getClass: () => SampleController,
    getHandler: () => handler,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function guardWith(enforcement: 'disabled' | 'enforced'): MfaGuard {
  const config = { environment: { MFA_ENFORCEMENT: enforcement } } as ApiConfigService;

  return new MfaGuard(new Reflector(), config);
}

describe('MfaGuard', () => {
  it('é inerte enquanto o enforcement está desligado (padrão)', () => {
    const guard = guardWith('disabled');

    expect(guard.canActivate(contextFor(sensitiveRoute, 'aal1'))).toBe(true);
    expect(guard.canActivate(contextFor(sensitiveRoute, undefined))).toBe(true);
  });

  it('libera rota marcada quando a sessão tem segundo fator', () => {
    expect(guardWith('enforced').canActivate(contextFor(sensitiveRoute, 'aal2'))).toBe(true);
  });

  it('barra rota marcada quando a sessão é apenas senha', () => {
    let code: unknown;

    try {
      guardWith('enforced').canActivate(contextFor(sensitiveRoute, 'aal1'));
    } catch (error) {
      code = (error as { getResponse: () => { code: string } }).getResponse().code;
    }

    expect(code).toBe('MFA_REQUIRED');
  });

  it('barra rota marcada quando o nível de garantia é desconhecido', () => {
    const guard = guardWith('enforced');

    expect(() => guard.canActivate(contextFor(sensitiveRoute, undefined))).toThrow();
  });

  it('não interfere em rotas sem a marcação', () => {
    expect(guardWith('enforced').canActivate(contextFor(openRoute, 'aal1'))).toBe(true);
  });

  it('deixa rotas públicas passarem mesmo se marcadas', () => {
    expect(guardWith('enforced').canActivate(contextFor(publicSensitiveRoute, undefined))).toBe(
      true,
    );
  });
});
