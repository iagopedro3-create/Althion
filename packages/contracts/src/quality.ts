import { z } from 'zod';

export const qualityClinicParamsSchema = z.object({
  clinicId: z.uuid(),
  organizationId: z.uuid(),
});

export const qualityEvaluationParamsSchema = qualityClinicParamsSchema.extend({
  evaluationId: z.uuid(),
});

export const clinicalFlagParamsSchema = qualityClinicParamsSchema.extend({
  flagId: z.uuid(),
});

// Validator score: integer between 0 and 5
const scoreValueSchema = z.number().int().min(0).max(5);

export const createEvaluationSchema = z.object({
  conversationId: z.string().trim().min(1).max(255),
  rubricVersion: z.string().trim().min(1).max(30),
  scores: z.record(z.string(), scoreValueSchema),
  feedback: z.string().trim().max(1000).optional(),
});

export const createClinicalFlagSchema = z.object({
  conversationId: z.string().trim().min(1).max(255),
  flagReason: z.string().trim().min(1).max(1000),
});

export const resolveClinicalFlagSchema = z.object({
  handoffNotes: z.string().trim().min(1).max(1000),
});

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
export type CreateClinicalFlagInput = z.infer<typeof createClinicalFlagSchema>;
export type ResolveClinicalFlagInput = z.infer<typeof resolveClinicalFlagSchema>;
