import { describe, expect, it } from 'vitest';

import {
  createSuppressionSchema,
  recoveryActionDecisionSchema,
  recoveryOpportunityDecisionSchema,
  recoveryOpportunityListQuerySchema,
} from './recovery';

describe('recovery contracts', () => {
  it('accepts bounded governance inputs', () => {
    expect(
      createSuppressionSchema.parse({ externalLeadRef: 'mock-lead-01', reason: 'opt_out' }),
    ).toMatchObject({ reason: 'opt_out' });
    expect(recoveryOpportunityListQuerySchema.parse({ limit: '10' }).limit).toBe(10);
  });

  it('rejects execution-like or malformed decisions', () => {
    expect(recoveryOpportunityDecisionSchema.safeParse({ decision: 'executed' }).success).toBe(
      false,
    );
    expect(
      recoveryActionDecisionSchema.safeParse({ decision: 'approved', reasonCode: 'Bad Code' })
        .success,
    ).toBe(false);
    expect(
      createSuppressionSchema.safeParse({ externalLeadRef: 'x y', reason: 'opt_out' }).success,
    ).toBe(false);
  });
});
