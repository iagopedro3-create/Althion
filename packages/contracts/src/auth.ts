import { PLATFORM_ROLES, TENANT_ROLES } from '@althion/domain';
import { z } from 'zod';

const uuidSchema = z.uuid();

export const membershipScopeSchema = z.object({
  clinicId: uuidSchema.nullable(),
  unitId: uuidSchema.nullable(),
});

export const principalMembershipSchema = z.object({
  organizationId: uuidSchema,
  role: z.enum(TENANT_ROLES),
  scopes: z.array(membershipScopeSchema),
  status: z.enum(['active', 'invited', 'revoked', 'expired']),
});

export const principalAssignmentSchema = z.object({
  clinicId: uuidSchema.nullable(),
  organizationId: uuidSchema,
  status: z.enum(['active', 'ended']),
});

/** Nível de garantia da sessão: `aal1` = só senha, `aal2` = senha + segundo fator. */
export const assuranceLevelSchema = z.enum(['aal1', 'aal2']);

export type AssuranceLevel = z.infer<typeof assuranceLevelSchema>;

export const principalResponseSchema = z.object({
  assignments: z.array(principalAssignmentSchema),
  assuranceLevel: assuranceLevelSchema.default('aal1'),
  memberships: z.array(principalMembershipSchema),
  platformRoles: z.array(z.enum(PLATFORM_ROLES)),
  profileId: uuidSchema,
  subject: uuidSchema,
});

export type PrincipalResponse = z.infer<typeof principalResponseSchema>;
