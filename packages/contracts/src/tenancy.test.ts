import { describe, expect, it } from 'vitest';

import { createMembershipSchema } from './index';

describe('createMembershipSchema', () => {
  it('accepts an explicit clinic scope', () => {
    const result = createMembershipSchema.safeParse({
      profileId: '99999999-9999-4999-8999-999999999999',
      role: 'clinic_manager',
      scope: {
        clinicId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        type: 'clinic',
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects arbitrary roles', () => {
    const result = createMembershipSchema.safeParse({
      profileId: '99999999-9999-4999-8999-999999999999',
      role: 'platform_admin',
      scope: { type: 'organization' },
    });

    expect(result.success).toBe(false);
  });
});
