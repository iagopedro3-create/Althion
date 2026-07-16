import { describe, expect, it } from 'vitest';

import { radarAssessmentInputSchema } from './radar';

const metric = {
  code: 'first_response_within_sla',
  denominator: 10,
  numerator: 8,
  quality: 'declared',
  source: 'manual',
} as const;

describe('radarAssessmentInputSchema', () => {
  it('accepts a traceable administrative ratio', () => {
    expect(
      radarAssessmentInputSchema.safeParse({
        metrics: [metric],
        periodEnd: '2026-06-30',
        periodStart: '2026-06-01',
      }).success,
    ).toBe(true);
  });

  it('rejects duplicate metrics and incompatible periods', () => {
    const result = radarAssessmentInputSchema.safeParse({
      metrics: [metric, metric],
      periodEnd: '2026-06-03',
      periodStart: '2026-06-01',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          'O período deve ter entre 7 e 92 dias.',
          'Cada métrica pode ser informada apenas uma vez.',
        ]),
      );
    }
  });

  it('rejects a numerator greater than the eligible denominator', () => {
    const result = radarAssessmentInputSchema.safeParse({
      metrics: [{ ...metric, numerator: 11 }],
      periodEnd: '2026-06-30',
      periodStart: '2026-06-01',
    });

    expect(result.success).toBe(false);
  });
});
