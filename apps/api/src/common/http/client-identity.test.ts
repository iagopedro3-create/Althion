import { describe, expect, it } from 'vitest';

import { resolveClientIdentity, UNRESOLVED_CLIENT } from './client-identity';

describe('resolveClientIdentity', () => {
  it('uses the leftmost forwarded address when the proxy chain is trusted', () => {
    // Com `trust proxy` configurado, o Express já descartou os saltos
    // confiáveis: `ips[0]` é o cliente real.
    expect(resolveClientIdentity({ ip: '10.0.0.1', ips: ['203.0.113.7', '10.0.0.1'] })).toBe(
      '203.0.113.7',
    );
  });

  it('falls back to the socket address when no proxy is trusted', () => {
    // Sem `trust proxy`, `ips` vem vazio mesmo que o cabeçalho exista — e
    // ignorá-lo é o comportamento correto: seria forjável.
    expect(resolveClientIdentity({ ip: '198.51.100.4', ips: [] })).toBe('198.51.100.4');
  });

  it('skips blank forwarded entries instead of keying on an empty string', () => {
    expect(resolveClientIdentity({ ip: '10.0.0.1', ips: ['  ', '203.0.113.9'] })).toBe(
      '203.0.113.9',
    );
  });

  it('trims surrounding whitespace so the same client keeps one bucket', () => {
    expect(resolveClientIdentity({ ip: ' 198.51.100.4 ' })).toBe('198.51.100.4');
  });

  it('names the unresolved case instead of sharing an undefined bucket', () => {
    expect(resolveClientIdentity({})).toBe(UNRESOLVED_CLIENT);
    expect(resolveClientIdentity({ ip: '   ', ips: [] })).toBe(UNRESOLVED_CLIENT);
  });
});
