import type { JWTPayload } from 'jose';
import { describe, expect, it } from 'vitest';

import { parseAccessTokenClaims } from './access-token-claims';

const SUBJECT = '11111111-1111-4111-8111-111111111111';

const payload = (extra: Partial<JWTPayload> = {}): JWTPayload => ({ sub: SUBJECT, ...extra });

describe('parseAccessTokenClaims', () => {
  it('extrai sujeito, nível de garantia e métodos', () => {
    const claims = parseAccessTokenClaims(
      payload({ aal: 'aal2', amr: [{ method: 'password' }, { method: 'totp' }] }),
    );

    expect(claims).toEqual({
      assuranceLevel: 'aal2',
      methods: ['password', 'totp'],
      subject: SUBJECT,
    });
  });

  it('trata claim `aal` ausente como aal1', () => {
    expect(parseAccessTokenClaims(payload()).assuranceLevel).toBe('aal1');
  });

  it('degrada valor desconhecido de `aal` para aal1 em vez de conceder acesso', () => {
    expect(parseAccessTokenClaims(payload({ aal: 'aal3' })).assuranceLevel).toBe('aal1');
    expect(parseAccessTokenClaims(payload({ aal: 2 })).assuranceLevel).toBe('aal1');
  });

  it('ignora `amr` malformado sem invalidar a sessão', () => {
    expect(parseAccessTokenClaims(payload({ amr: 'password' })).methods).toEqual([]);
    expect(parseAccessTokenClaims(payload({ amr: [{ foo: 'bar' }] })).methods).toEqual([]);
  });

  it('rejeita sujeito que não é UUID', () => {
    expect(() => parseAccessTokenClaims(payload({ sub: 'not-a-uuid' }))).toThrow();
    expect(() => parseAccessTokenClaims({})).toThrow();
  });
});
