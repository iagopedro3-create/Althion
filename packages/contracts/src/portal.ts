import {
  IMPROVEMENT_PLAN_STATUSES,
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '@althion/domain';
import { z } from 'zod';

export const portalClinicParamsSchema = z.object({
  clinicId: z.uuid(),
  organizationId: z.uuid(),
});

export const requestParamsSchema = portalClinicParamsSchema.extend({ requestId: z.uuid() });
export const improvementPlanParamsSchema = portalClinicParamsSchema.extend({ planId: z.uuid() });
export const taskParamsSchema = portalClinicParamsSchema.extend({ taskId: z.uuid() });

export const requestListQuerySchema = z.object({
  category: z.enum(REQUEST_CATEGORIES).optional(),
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  status: z.enum(REQUEST_STATUSES).optional(),
});

export const createRequestSchema = z.object({
  category: z.enum(REQUEST_CATEGORIES),
  details: z.string().trim().min(10).max(1_000),
  priority: z.enum(REQUEST_PRIORITIES).default('normal'),
  subject: z.string().trim().min(5).max(160),
});

export const requestTransitionSchema = z.object({
  reasonCode: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]{2,63}$/)
    .optional(),
  toStatus: z.enum(REQUEST_STATUSES),
});

export const createImprovementPlanSchema = z
  .object({
    periodEnd: z.iso.date().nullable().optional(),
    periodStart: z.iso.date().nullable().optional(),
    sourceScoreId: z.uuid().nullable().optional(),
    title: z.string().trim().min(5).max(160),
  })
  .superRefine((input, context) => {
    const hasStart = Boolean(input.periodStart);
    const hasEnd = Boolean(input.periodEnd);
    if (hasStart !== hasEnd) {
      context.addIssue({
        code: 'custom',
        message: 'Informe o início e o fim do período juntos.',
        path: hasStart ? ['periodEnd'] : ['periodStart'],
      });
    }
    if (input.periodStart && input.periodEnd && input.periodStart > input.periodEnd) {
      context.addIssue({
        code: 'custom',
        message: 'O fim do período deve ser posterior ao início.',
        path: ['periodEnd'],
      });
    }
  });

export const improvementPlanTransitionSchema = z.object({
  reasonCode: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]{2,63}$/)
    .optional(),
  toStatus: z.enum(IMPROVEMENT_PLAN_STATUSES),
});

export const createTaskSchema = z.object({
  assigneeProfileId: z.uuid().nullable().optional(),
  dueAt: z.iso.datetime({ offset: true }).nullable().optional(),
  priority: z.enum(TASK_PRIORITIES).default('normal'),
  radarRecommendationId: z.uuid().nullable().optional(),
  title: z.string().trim().min(5).max(160),
});

export const taskTransitionSchema = z.object({
  reasonCode: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]{2,63}$/)
    .optional(),
  toStatus: z.enum(TASK_STATUSES),
});

export type RequestListQuery = z.infer<typeof requestListQuerySchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type RequestTransitionInput = z.infer<typeof requestTransitionSchema>;
export type CreateImprovementPlanInput = z.infer<typeof createImprovementPlanSchema>;
export type ImprovementPlanTransitionInput = z.infer<typeof improvementPlanTransitionSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type TaskTransitionInput = z.infer<typeof taskTransitionSchema>;
