import { describe, expect, it } from 'vitest';

import { warnsAboutAggregatedRateLimit } from './configure-application';

describe('warnsAboutAggregatedRateLimit', () => {
  it('warns in production when no proxy hop is trusted', () => {
    // O caso que este incremento existe para tornar visível: em produção atrás
    // de um proxy, sem confiar nele, o limite deixa de ser por cliente.
    expect(warnsAboutAggregatedRateLimit('production', 0)).toBe(true);
  });

  it('stays quiet in production once a hop is trusted', () => {
    expect(warnsAboutAggregatedRateLimit('production', 1)).toBe(false);
  });

  it('stays quiet outside production, where the API is reached directly', () => {
    expect(warnsAboutAggregatedRateLimit('development', 0)).toBe(false);
    expect(warnsAboutAggregatedRateLimit('test', 0)).toBe(false);
  });
});
