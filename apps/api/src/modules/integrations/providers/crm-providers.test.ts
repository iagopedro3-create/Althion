import { type CrmProviderError } from '@althion/domain';
import { describe, expect, it } from 'vitest';

import { HelenaCrmProvider } from './helena-crm.provider';
import { MockCrmProvider } from './mock-crm.provider';

describe('MockCrmProvider', () => {
  it('paginates deterministically without message content', async () => {
    const provider = new MockCrmProvider();
    const first = await provider.listContacts({ limit: 1 });
    const second = await provider.listContacts({ cursor: first.nextCursor ?? undefined, limit: 1 });
    const messages = await provider.listMessages({ limit: 10 });

    expect(first.items).toHaveLength(1);
    expect(second.items).toHaveLength(1);
    expect(first.items[0]?.externalId).not.toBe(second.items[0]?.externalId);
    expect(messages.items[0]).not.toHaveProperty('body');
  });

  it('treats repeated writes as idempotent', async () => {
    const provider = new MockCrmProvider();
    const input = {
      externalId: 'mock-opportunity-001',
      idempotencyKey: 'test-idempotency-key-001',
      normalizedStatus: 'won' as const,
    };

    await provider.updateOpportunity(input);
    await expect(provider.updateOpportunity(input)).resolves.toBeUndefined();
  });
});

describe('HelenaCrmProvider', () => {
  it('reports no capabilities and fails explicitly while the data integration is off', async () => {
    const provider = new HelenaCrmProvider();

    await expect(provider.getCapabilities()).resolves.toMatchObject({ listContacts: false });
    await expect(provider.listContacts({ limit: 10 })).rejects.toMatchObject<
      Partial<CrmProviderError>
    >({ code: 'PROVIDER_NOT_CONFIGURED' });
  });
});
