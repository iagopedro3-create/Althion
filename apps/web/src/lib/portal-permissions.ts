import type { PrincipalResponse } from '@althion/contracts';

import type { PortalContext } from './portal-context';

export interface PortalPermissions {
  readonly canCreateRequest: boolean;
  readonly canManagePlan: boolean;
  readonly canManageRequest: boolean;
}

export function getPortalPermissions(
  principal: PrincipalResponse | null,
  context: PortalContext,
): PortalPermissions {
  if (!principal) {
    return { canCreateRequest: false, canManagePlan: false, canManageRequest: false };
  }
  if (principal.platformRoles.includes('platform_admin')) {
    return { canCreateRequest: true, canManagePlan: true, canManageRequest: true };
  }

  const membership = principal.memberships.find(
    (candidate) =>
      candidate.organizationId === context.organizationId && candidate.status === 'active',
  );
  const assigned = principal.assignments.some(
    (assignment) =>
      assignment.organizationId === context.organizationId &&
      assignment.status === 'active' &&
      (assignment.clinicId === null || assignment.clinicId === context.clinicId),
  );
  const membershipApplies =
    membership?.role === 'organization_owner' ||
    membership?.scopes.some(
      (scope) => scope.clinicId === null || scope.clinicId === context.clinicId,
    );
  const role = membershipApplies ? membership?.role : undefined;
  return {
    canCreateRequest:
      assigned || ['organization_owner', 'clinic_manager', 'doctor'].includes(role ?? ''),
    canManagePlan: assigned || ['organization_owner', 'clinic_manager'].includes(role ?? ''),
    canManageRequest: assigned || ['organization_owner', 'clinic_manager'].includes(role ?? ''),
  };
}
