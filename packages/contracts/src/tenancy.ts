import { TENANT_ROLES } from '@althion/domain';
import { z } from 'zod';

export const organizationIdParamsSchema = z.object({
  organizationId: z.uuid(),
});

export const membershipIdParamsSchema = organizationIdParamsSchema.extend({
  membershipId: z.uuid(),
});

const organizationScopeSchema = z.object({
  type: z.literal('organization'),
});

const clinicScopeSchema = z.object({
  clinicId: z.uuid(),
  type: z.literal('clinic'),
});

const unitScopeSchema = z.object({
  clinicId: z.uuid(),
  type: z.literal('unit'),
  unitId: z.uuid(),
});

export const createMembershipSchema = z.object({
  profileId: z.uuid(),
  role: z.enum(TENANT_ROLES),
  scope: z.discriminatedUnion('type', [
    organizationScopeSchema,
    clinicScopeSchema,
    unitScopeSchema,
  ]),
});

export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
