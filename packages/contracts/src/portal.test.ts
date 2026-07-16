import { describe, expect, it } from 'vitest';

import {
  createImprovementPlanSchema,
  createRequestSchema,
  createTaskSchema,
  requestListQuerySchema,
} from './portal';

describe('portal contracts', () => {
  it('accepts bounded administrative requests', () => {
    expect(
      createRequestSchema.parse({
        category: 'data_quality',
        details: 'Revisar a cobertura declarada no último Radar.',
        subject: 'Cobertura do Radar',
      }),
    ).toMatchObject({ priority: 'normal' });
  });

  it('rejects incomplete plan periods', () => {
    expect(
      createImprovementPlanSchema.safeParse({
        periodStart: '2026-07-01',
        title: 'Melhorar continuidade administrativa',
      }).success,
    ).toBe(false);
  });

  it('coerces safe pagination and validates task dates', () => {
    expect(requestListQuerySchema.parse({ limit: '20' }).limit).toBe(20);
    expect(
      createTaskSchema.safeParse({
        dueAt: 'not-a-date',
        title: 'Revisar o processo de acompanhamento',
      }).success,
    ).toBe(false);
  });
});
