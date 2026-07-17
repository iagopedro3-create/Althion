export const TENANT_ROLES = [
  'organization_owner',
  'clinic_manager',
  'doctor',
  'operator',
  'viewer',
] as const;

export type TenantRole = (typeof TENANT_ROLES)[number];

export const PLATFORM_ROLES = ['platform_admin'] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const CAPABILITIES = [
  'organization:read',
  'organization:update',
  'clinic:read',
  'clinic:manage',
  'membership:read',
  'membership:manage',
  'feature_flag:read',
  'feature_flag:manage',
  'audit_log:read',
  'integration:read',
  'integration:manage',
  'radar:read',
  'radar:write',
  'radar:submit',
  'radar_report:export',
  'score:read',
  'score:calculate',
  'score_formula:manage',
  'portal:read',
  'request:read',
  'request:create',
  'request:manage',
  'improvement_plan:read',
  'improvement_plan:manage',
  'task:read',
  'task:manage',
  'cockpit:read',
  'incident:read',
  'incident:manage',
  'meeting:read',
  'meeting:manage',
  'recovery:read',
  'recovery:simulate',
  'recovery:decide',
  'suppression:read',
  'suppression:manage',
] as const;

export type Capability = (typeof CAPABILITIES)[number];

// Capabilities internas da operação Althion: nunca concedidas automaticamente a papéis tenant.
const INTERNAL_CAPABILITIES: ReadonlySet<Capability> = new Set([
  'cockpit:read',
  'incident:read',
  'incident:manage',
  'meeting:read',
  'meeting:manage',
  'recovery:simulate',
]);

export type MembershipStatus = 'active' | 'invited' | 'revoked' | 'expired';

export interface MembershipScope {
  readonly clinicId: string | null;
  readonly unitId: string | null;
}

export interface PrincipalMembership {
  readonly organizationId: string;
  readonly role: TenantRole;
  readonly scopes: readonly MembershipScope[];
  readonly status: MembershipStatus;
}

export interface PrincipalAssignment {
  readonly clinicId: string | null;
  readonly organizationId: string;
  readonly status: 'active' | 'ended';
}

export interface Principal {
  readonly assignments: readonly PrincipalAssignment[];
  readonly memberships: readonly PrincipalMembership[];
  readonly platformRoles: readonly PlatformRole[];
  readonly profileId: string;
  readonly subject: string;
}

const ROLE_CAPABILITIES: Readonly<Record<TenantRole, ReadonlySet<Capability>>> = {
  organization_owner: new Set(
    CAPABILITIES.filter((capability) => !INTERNAL_CAPABILITIES.has(capability)),
  ),
  clinic_manager: new Set([
    'organization:read',
    'clinic:read',
    'clinic:manage',
    'membership:read',
    'feature_flag:read',
    'integration:read',
    'radar:read',
    'radar:write',
    'radar:submit',
    'radar_report:export',
    'score:read',
    'score:calculate',
    'portal:read',
    'request:read',
    'request:create',
    'request:manage',
    'improvement_plan:read',
    'improvement_plan:manage',
    'task:read',
    'task:manage',
    'recovery:read',
    'recovery:decide',
    'suppression:read',
    'suppression:manage',
  ]),
  doctor: new Set([
    'organization:read',
    'clinic:read',
    'feature_flag:read',
    'radar:read',
    'score:read',
    'portal:read',
    'request:read',
    'request:create',
    'improvement_plan:read',
    'task:read',
  ]),
  operator: new Set(['organization:read', 'clinic:read', 'feature_flag:read']),
  viewer: new Set([
    'organization:read',
    'clinic:read',
    'feature_flag:read',
    'radar:read',
    'score:read',
    'portal:read',
    'request:read',
    'improvement_plan:read',
    'task:read',
  ]),
};

const SPECIALIST_CAPABILITIES: ReadonlySet<Capability> = new Set([
  'organization:read',
  'clinic:read',
  'feature_flag:read',
  'integration:read',
  'radar:read',
  'radar:write',
  'radar:submit',
  'radar_report:export',
  'score:read',
  'score:calculate',
  'portal:read',
  'request:read',
  'request:create',
  'request:manage',
  'improvement_plan:read',
  'improvement_plan:manage',
  'task:read',
  'task:manage',
  'cockpit:read',
  'incident:read',
  'incident:manage',
  'meeting:read',
  'meeting:manage',
  'recovery:read',
  'recovery:simulate',
  'recovery:decide',
  'suppression:read',
  'suppression:manage',
]);

export function isPlatformAdmin(principal: Principal): boolean {
  return principal.platformRoles.includes('platform_admin');
}

export function hasOrganizationAccess(principal: Principal, organizationId: string): boolean {
  if (isPlatformAdmin(principal)) {
    return true;
  }

  return (
    principal.memberships.some(
      (membership) =>
        membership.organizationId === organizationId && membership.status === 'active',
    ) ||
    principal.assignments.some(
      (assignment) =>
        assignment.organizationId === organizationId && assignment.status === 'active',
    )
  );
}

export function hasClinicAccess(
  principal: Principal,
  organizationId: string,
  clinicId: string,
): boolean {
  if (isPlatformAdmin(principal)) {
    return true;
  }

  const membership = principal.memberships.find(
    (candidate) => candidate.organizationId === organizationId && candidate.status === 'active',
  );

  if (membership) {
    if (membership.role === 'organization_owner') {
      return true;
    }

    if (membership.scopes.some((scope) => scope.clinicId === null)) {
      return true;
    }

    if (membership.scopes.some((scope) => scope.clinicId === clinicId)) {
      return true;
    }
  }

  return principal.assignments.some(
    (assignment) =>
      assignment.organizationId === organizationId &&
      assignment.status === 'active' &&
      (assignment.clinicId === null || assignment.clinicId === clinicId),
  );
}

export function hasCapability(
  principal: Principal,
  organizationId: string,
  capability: Capability,
  clinicId?: string,
): boolean {
  if (isPlatformAdmin(principal)) {
    return true;
  }

  if (clinicId && !hasClinicAccess(principal, organizationId, clinicId)) {
    return false;
  }

  const membership = principal.memberships.find(
    (candidate) => candidate.organizationId === organizationId && candidate.status === 'active',
  );

  if (membership && ROLE_CAPABILITIES[membership.role].has(capability)) {
    return true;
  }

  const hasAssignment = principal.assignments.some(
    (assignment) =>
      assignment.organizationId === organizationId &&
      assignment.status === 'active' &&
      (!clinicId || assignment.clinicId === null || assignment.clinicId === clinicId),
  );

  return hasAssignment && SPECIALIST_CAPABILITIES.has(capability);
}
