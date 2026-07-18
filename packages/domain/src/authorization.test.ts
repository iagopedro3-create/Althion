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

  it('allows a scoped manager to operate Radar only in the assigned clinic', () => {
    expect(
      hasCapability(
        principal,
        '11111111-1111-4111-8111-111111111111',
        'radar:submit',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasCapability(
        principal,
        '11111111-1111-4111-8111-111111111111',
        'radar:submit',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      ),
    ).toBe(false);
  });

  it('keeps Cockpit capabilities away from tenant roles, including owners', () => {
    const owner: Principal = {
      ...principal,
      memberships: [
        {
          organizationId: '11111111-1111-4111-8111-111111111111',
          role: 'organization_owner',
          scopes: [{ clinicId: null, unitId: null }],
          status: 'active',
        },
      ],
    };
    expect(hasCapability(owner, '11111111-1111-4111-8111-111111111111', 'cockpit:read')).toBe(
      false,
    );
    expect(hasCapability(owner, '11111111-1111-4111-8111-111111111111', 'incident:manage')).toBe(
      false,
    );
    expect(hasCapability(owner, '11111111-1111-4111-8111-111111111111', 'request:manage')).toBe(
      true,
    );
  });

  it('grants Cockpit capabilities to a specialist only while the assignment is active', () => {
    const specialist: Principal = {
      ...principal,
      assignments: [
        {
          clinicId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          organizationId: '11111111-1111-4111-8111-111111111111',
          status: 'active',
        },
      ],
      memberships: [],
    };
    expect(
      hasCapability(
        specialist,
        '11111111-1111-4111-8111-111111111111',
        'incident:manage',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasCapability(
        specialist,
        '11111111-1111-4111-8111-111111111111',
        'meeting:manage',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      ),
    ).toBe(false);

    const ended: Principal = {
      ...specialist,
      assignments: [{ ...specialist.assignments[0]!, status: 'ended' }],
    };
    expect(
      hasCapability(
        ended,
        '11111111-1111-4111-8111-111111111111',
        'cockpit:read',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(false);
  });

  it('keeps recovery simulation internal while letting managers decide', () => {
    expect(
      hasCapability(
        principal,
        '11111111-1111-4111-8111-111111111111',
        'recovery:decide',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasCapability(
        principal,
        '11111111-1111-4111-8111-111111111111',
        'recovery:simulate',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(false);

    const specialist: Principal = {
      ...principal,
      assignments: [
        {
          clinicId: null,
          organizationId: '11111111-1111-4111-8111-111111111111',
          status: 'active',
        },
      ],
      memberships: [],
    };
    expect(
      hasCapability(specialist, '11111111-1111-4111-8111-111111111111', 'recovery:simulate'),
    ).toBe(true);
  });

  it('allows a scoped manager to manage Portal workflows only in the assigned clinic', () => {
    expect(
      hasCapability(
        principal,
        '11111111-1111-4111-8111-111111111111',
        'improvement_plan:manage',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasCapability(
        principal,
        '11111111-1111-4111-8111-111111111111',
        'request:manage',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      ),
    ).toBe(false);
  });

  it('keeps quality:evaluate internal to specialists while granting quality:read/flag/resolve to doctors and read to managers', () => {
    // 1. Manager (principal has clinic_manager membership in assigned clinic)
    expect(
      hasCapability(
        principal,
        '11111111-1111-4111-8111-111111111111',
        'quality:read',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasCapability(
        principal,
        '11111111-1111-4111-8111-111111111111',
        'quality:evaluate',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(false);

    // 2. Doctor Principal
    const doctor: Principal = {
      ...principal,
      memberships: [
        {
          organizationId: '11111111-1111-4111-8111-111111111111',
          role: 'doctor',
          scopes: [{ clinicId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', unitId: null }],
          status: 'active',
        },
      ],
    };
    expect(
      hasCapability(
        doctor,
        '11111111-1111-4111-8111-111111111111',
        'quality:read',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasCapability(
        doctor,
        '11111111-1111-4111-8111-111111111111',
        'quality:flag',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasCapability(
        doctor,
        '11111111-1111-4111-8111-111111111111',
        'quality:resolve',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasCapability(
        doctor,
        '11111111-1111-4111-8111-111111111111',
        'quality:evaluate',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(false);

    // 3. Specialist Principal
    const specialist: Principal = {
      ...principal,
      assignments: [
        {
          clinicId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          organizationId: '11111111-1111-4111-8111-111111111111',
          status: 'active',
        },
      ],
      memberships: [],
    };
    expect(
      hasCapability(
        specialist,
        '11111111-1111-4111-8111-111111111111',
        'quality:read',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasCapability(
        specialist,
        '11111111-1111-4111-8111-111111111111',
        'quality:evaluate',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasCapability(
        specialist,
        '11111111-1111-4111-8111-111111111111',
        'google_ads:read',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasCapability(
        specialist,
        '11111111-1111-4111-8111-111111111111',
        'google_ads:write',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);

    // 4. Clinic Manager has google_ads:read and google_ads:write
    const manager: Principal = {
      ...principal,
      memberships: [
        {
          organizationId: '11111111-1111-4111-8111-111111111111',
          role: 'clinic_manager',
          scopes: [{ clinicId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', unitId: null }],
          status: 'active',
        },
      ],
    };
    expect(
      hasCapability(
        manager,
        '11111111-1111-4111-8111-111111111111',
        'google_ads:read',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);
    expect(
      hasCapability(
        manager,
        '11111111-1111-4111-8111-111111111111',
        'google_ads:write',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(true);

    // 5. Doctor does not have google_ads:read or google_ads:write
    expect(
      hasCapability(
        doctor,
        '11111111-1111-4111-8111-111111111111',
        'google_ads:read',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      ),
    ).toBe(false);
  });
});
