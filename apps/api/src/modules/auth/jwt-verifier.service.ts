import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { z } from 'zod';

import { ApiConfigService } from '../../config/api-config.service';

const subjectSchema = z.uuid();

@Injectable()
export class JwtVerifierService {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  public constructor(private readonly config: ApiConfigService) {
    this.jwks = createRemoteJWKSet(config.jwksUrl);
  }

  public async verify(token: string): Promise<string> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        audience: this.config.environment.SUPABASE_JWT_AUDIENCE,
        issuer: this.config.environment.SUPABASE_JWT_ISSUER,
      });

      return subjectSchema.parse(payload.sub);
    } catch {
      throw new UnauthorizedException({
        code: 'INVALID_ACCESS_TOKEN',
        message: 'Sua sessão é inválida ou expirou.',
      });
    }
  }
}
