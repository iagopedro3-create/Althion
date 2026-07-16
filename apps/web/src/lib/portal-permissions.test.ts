import type { PrincipalResponse } from '@althion/contracts';
import { describe, expect, it } from 'vitest';

import { getPortalPermissions } from './portal-permissions';

const organizationId = '10000000-0000-4000-8000-000000000001';
const clinicA = '20000000-0000-4000-8000-000000000001';
const clinicB = '20000000-0000-4000-8000-000000000002';

const principal: PrincipalResponse = {
  assignments: [],
  memberships: [
    {
      organizationId,
      role: 'clinic_manager',
      scopes: [{ clinicId: clinicA, unitId: null }],
      status: 'active',
    },
  ],
  platformRoles: [],
  profileId: '30000000-0000-4000-8000-000000000001',
  subject: '80000000-0000-4000-8000-000000000001',
};

describe('getPortalPermissions', () => {
  it('allows management only inside the membership clinic scope', () => {
    expect(getPortalPermissions(principal, { clinicId: clinicA, organizationId })).toEqual({
      canCreateRequest: true,
      canManagePlan: true,
      canManageRequest: true,
    });
    expect(getPortalPermissions(principal, { clinicId: clinicB, organizationId })).toEqual({
      canCreateRequest: false,
      canManagePlan: false,
      canManageRequest: false,
    });
  });

  it('honors a clinic-specific active specialist assignment', () => {
    const specialist: PrincipalResponse = {
      ...principal,
      assignments: [{ clinicId: clinicB, organizationId, status: 'active' }],
      memberships: [],
    };

    expect(getPortalPermissions(specialist, { clinicId: clinicB, organizationId })).toEqual({
      canCreateRequest: true,
      canManagePlan: true,
      canManageRequest: true,
    });
    expect(getPortalPermissions(specialist, { clinicId: clinicA, organizationId })).toEqual({
      canCreateRequest: false,
      canManagePlan: false,
      canManageRequest: false,
    });
  });

  it('grants the complete portal workflow to platform administrators', () => {
    expect(
      getPortalPermissions(
        { ...principal, memberships: [], platformRoles: ['platform_admin'] },
        { clinicId: clinicB, organizationId },
      ),
    ).toEqual({ canCreateRequest: true, canManagePlan: true, canManageRequest: true });
  });
});
