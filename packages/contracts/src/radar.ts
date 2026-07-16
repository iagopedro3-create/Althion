import { RADAR_METRIC_CODES } from '@althion/domain';
import { z } from 'zod';

const isoDateSchema = z.iso.date();

export const radarMetricInputSchema = z
  .object({
    code: z.enum(RADAR_METRIC_CODES),
    denominator: z.coerce.number().int().min(0).max(1_000_000_000),
    numerator: z.coerce.number().int().min(0).max(1_000_000_000),
    observation: z.string().trim().max(280).optional(),
    quality: z.enum(['declared', 'verified']).default('declared'),
    source: z.literal('manual').default('manual'),
  })
  .superRefine((input, context) => {
    if (input.numerator > input.denominator) {
      context.addIssue({
        code: 'custom',
        message: 'O numerador não pode ser maior que o denominador.',
        path: ['numerator'],
      });
    }
  });

export const radarAssessmentInputSchema = z
  .object({
    metrics: z.array(radarMetricInputSchema).min(1).max(RADAR_METRIC_CODES.length),
    periodEnd: isoDateSchema,
    periodStart: isoDateSchema,
    unitId: z.uuid().nullable().optional(),
  })
  .superRefine((input, context) => {
    const start = new Date(`${input.periodStart}T00:00:00Z`);
    const end = new Date(`${input.periodEnd}T00:00:00Z`);
    const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;

    if (days < 7 || days > 92) {
      context.addIssue({
        code: 'custom',
        message: 'O período deve ter entre 7 e 92 dias.',
        path: ['periodEnd'],
      });
    }

    const codes = input.metrics.map((metric) => metric.code);
    if (new Set(codes).size !== codes.length) {
      context.addIssue({
        code: 'custom',
        message: 'Cada métrica pode ser informada apenas uma vez.',
        path: ['metrics'],
      });
    }
  });

export const organizationClinicParamsSchema = z.object({
  clinicId: z.uuid(),
  organizationId: z.uuid(),
});

export const radarAssessmentParamsSchema = organizationClinicParamsSchema.extend({
  assessmentId: z.uuid(),
});

export const scoreParamsSchema = organizationClinicParamsSchema.extend({
  scoreId: z.uuid(),
});

export const scoreComparisonQuerySchema = z
  .object({
    currentScoreId: z.uuid(),
    previousScoreId: z.uuid(),
  })
  .refine((input) => input.currentScoreId !== input.previousScoreId, {
    message: 'Selecione dois scores diferentes.',
    path: ['previousScoreId'],
  });

export type RadarAssessmentInput = z.infer<typeof radarAssessmentInputSchema>;
export type RadarMetricInput = z.infer<typeof radarMetricInputSchema>;
export type ScoreComparisonQuery = z.infer<typeof scoreComparisonQuerySchema>;
