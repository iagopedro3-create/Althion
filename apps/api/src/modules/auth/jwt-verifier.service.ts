import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { ApiConfigService } from '../../config/api-config.service';
import { parseAccessTokenClaims, type VerifiedAccessToken } from './access-token-claims';

@Injectable()
export class JwtVerifierService {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  public constructor(private readonly config: ApiConfigService) {
    this.jwks = createRemoteJWKSet(config.jwksUrl);
  }

  public async verify(token: string): Promise<VerifiedAccessToken> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        audience: this.config.environment.SUPABASE_JWT_AUDIENCE,
        issuer: this.config.environment.SUPABASE_JWT_ISSUER,
      });

      return parseAccessTokenClaims(payload);
    } catch {
      throw new UnauthorizedException({
        code: 'INVALID_ACCESS_TOKEN',
        message: 'Sua sessão é inválida ou expirou.',
      });
    }
  }
}
