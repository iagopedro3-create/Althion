import {
  RECOVERY_ACTION_STATUSES,
  RECOVERY_OPPORTUNITY_STATUSES,
  RECOVERY_SUPPRESSION_REASONS,
} from '@althion/domain';
import { z } from 'zod';

export const recoveryClinicParamsSchema = z.object({
  clinicId: z.uuid(),
  organizationId: z.uuid(),
});

export const recoveryOpportunityParamsSchema = recoveryClinicParamsSchema.extend({
  opportunityId: z.uuid(),
});
export const recoveryActionParamsSchema = recoveryClinicParamsSchema.extend({
  actionId: z.uuid(),
});
export const recoverySuppressionParamsSchema = recoveryClinicParamsSchema.extend({
  suppressionId: z.uuid(),
});

const reasonCodeSchema = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9_]{2,63}$/)
  .optional();

export const recoveryOpportunityListQuerySchema = z.object({
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  status: z.enum(RECOVERY_OPPORTUNITY_STATUSES).optional(),
});

export const recoveryOpportunityDecisionSchema = z.object({
  decision: z.enum(['approved', 'discarded']),
  reasonCode: reasonCodeSchema,
});

export const recoveryActionDecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  reasonCode: reasonCodeSchema,
});

export const createSuppressionSchema = z.object({
  expiresAt: z.iso.datetime({ offset: true }).nullable().optional(),
  externalLeadRef: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[A-Za-z0-9_.:-]+$/),
  reason: z.enum(RECOVERY_SUPPRESSION_REASONS),
});

export type RecoveryOpportunityListQuery = z.infer<typeof recoveryOpportunityListQuerySchema>;
export type RecoveryOpportunityDecisionInput = z.infer<typeof recoveryOpportunityDecisionSchema>;
export type RecoveryActionDecisionInput = z.infer<typeof recoveryActionDecisionSchema>;
export type CreateSuppressionInput = z.infer<typeof createSuppressionSchema>;

export const RECOVERY_ACTION_DECISIONS = ['approved', 'rejected'] as const;
export const RECOVERY_OPPORTUNITY_DECISIONS = ['approved', 'discarded'] as const;
export { RECOVERY_ACTION_STATUSES, RECOVERY_OPPORTUNITY_STATUSES };
