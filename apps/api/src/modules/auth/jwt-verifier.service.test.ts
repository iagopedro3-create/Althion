import { createRequire } from 'node:module';

import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import type { ApiConfigService } from '../../config/api-config.service';
import { JwtVerifierService } from './jwt-verifier.service';

function configStub(): ApiConfigService {
  return {
    jwksUrl: new URL('https://project.example.supabase.co/auth/v1/.well-known/jwks.json'),
    environment: {
      SUPABASE_JWT_AUDIENCE: 'authenticated',
      SUPABASE_JWT_ISSUER: 'https://project.example.supabase.co/auth/v1',
    },
  } as unknown as ApiConfigService;
}

describe('JwtVerifierService', () => {
  it('rejects a malformed token as unauthorized', async () => {
    const service = new JwtVerifierService(configStub());

    // Um token sem forma de JWT falha antes de qualquer busca de JWKS, então o
    // teste não toca a rede.
    await expect(service.verify('not-a-jwt')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('reports an invalid token with a sanitised code, not with internals', async () => {
    const service = new JwtVerifierService(configStub());

    await expect(service.verify('not-a-jwt')).rejects.toMatchObject({
      response: { code: 'INVALID_ACCESS_TOKEN' },
    });
  });
});

describe('the jose dependency', () => {
  it('exposes a CommonJS entrypoint, which the compiled API needs to require', () => {
    // Esta é a invariante que derrubou o primeiro deploy da API. `jose@6` é
    // ESM-only; o `nest build` emite CommonJS, e o runtime serverless da Vercel
    // recusa `require()` de um módulo ESM com `ERR_REQUIRE_ESM`.
    //
    // Nenhum teste de comportamento pega essa regressão: sob vitest tudo é ESM
    // e o import funciona. O Node 24 local também aceita `require()` de ESM, de
    // modo que `node dist/main.js` sobe aqui e falha no deploy. Por isso a
    // verificação é sobre o empacotamento da dependência, e não sobre o
    // nosso código — é lá que mora a condição.
    //
    // Se este teste falhar, alguém subiu o `jose` para uma major sem CommonJS.
    // Antes de mexer aqui, leia docs/operations/deploy-staging.md.
    const require = createRequire(import.meta.url);
    const manifest = require('jose/package.json') as {
      exports?: Record<string, Record<string, string> | string>;
    };
    const root = manifest.exports?.['.'];

    expect(typeof root === 'object' && root?.['require']).toBeTruthy();
  });
});
