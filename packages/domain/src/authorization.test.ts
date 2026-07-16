import { describe, expect, it } from 'vitest';

import { hasCapability, hasClinicAccess, hasOrganizationAccess, type Principal } from './index';

const principal: Principal = {
  assignments: [],
  memberships: [
    {
      organizationId: '11111111-1111-4111-8111-111111111111',
      role: 'clinic_manager',
      scopes: [
        {
          clinicId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          unitId: null,
        },
      ],
      status: 'active',
    },
  ],
  platformRoles: [],
  profileId: '99999999-9999-4999-8999-999999999999',
  subject: '88888888-8888-4888-8888-888888888888',
};

describe('authorization', () => {
  it('denies access to another organization', () => {
    expect(hasOrganizationAccess(principal, '22222222-2222-4222-8222-222222222222')).toBe(false);
  });

  it('restricts a clinic-scoped manager', () => {
    expect(
      hasClinicAccess(
        principal,
        '11111111-1111-4111-8111-111111111111',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasClinicAccess(
        principal,
        '11111111-1111-4111-8111-111111111111',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      ),
    ).toBe(false);
  });

  it('prevents a manager from managing memberships', () => {
    expect(
      hasCapability(principal, '11111111-1111-4111-8111-111111111111', 'membership:manage'),
    ).toBe(false);
  });
});
