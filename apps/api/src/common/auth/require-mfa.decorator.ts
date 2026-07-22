import { SetMetadata } from '@nestjs/common';

export const REQUIRES_MFA_KEY = 'althion:requires-mfa';

/**
 * Marca uma rota (ou controlador) como sensível o bastante para exigir segundo
 * fator. A exigência só é aplicada quando `MFA_ENFORCEMENT=enforced`; ver
 * `MfaGuard` e `docs/plans/phase-10-security-pilot.md`.
 */
export const RequireMfa = (): MethodDecorator & ClassDecorator =>
  SetMetadata(REQUIRES_MFA_KEY, true);
