import type { Principal, TenantRole } from '@althion/domain';

export const TEST_IDS = {
  clinicA: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  clinicB: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  organizationA: '11111111-1111-4111-8111-111111111111',
  organizationB: '22222222-2222-4222-8222-222222222222',
  profileA: '99999999-9999-4999-8999-999999999999',
  subjectA: '88888888-8888-4888-8888-888888888888',
} as const;

export function buildTenantPrincipal(role: TenantRole = 'organization_owner'): Principal {
  return {
    assignments: [],
    memberships: [
      {
        organizationId: TEST_IDS.organizationA,
        role,
        scopes: [{ clinicId: null, unitId: null }],
        status: 'active',
      },
    ],
    platformRoles: [],
    profileId: TEST_IDS.profileA,
    subject: TEST_IDS.subjectA,
  };
}
