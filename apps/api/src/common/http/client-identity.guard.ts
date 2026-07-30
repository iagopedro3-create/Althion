import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { type ClientAddressCarrier, resolveClientIdentity } from './client-identity';

/**
 * Throttler que identifica o cliente por uma função pura e testável.
 *
 * O `getTracker` padrão do `@nestjs/throttler` devolve `req.ip` cru, o que
 * degrada para uma chave compartilhada — ou para `undefined` — quando o
 * ambiente não resolve o endereço. Aqui a resolução é explícita e o caso
 * indefinido tem nome próprio. Ver docs/plans/phase-10-5-rate-limit-proxy.md.
 */
@Injectable()
export class ClientIdentityThrottlerGuard extends ThrottlerGuard {
  protected override async getTracker(request: ClientAddressCarrier): Promise<string> {
    return resolveClientIdentity(request);
  }
}
