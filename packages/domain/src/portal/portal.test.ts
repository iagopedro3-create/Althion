import { describe, expect, it } from 'vitest';

import {
  calculatePlanProgress,
  isPlanTransitionAllowed,
  isRequestTransitionAllowed,
  isTaskTransitionAllowed,
  prioritizePortalOpportunities,
} from './index';

describe('portal domain', () => {
  it('calculates progress without treating cancelled tasks as pending', () => {
    expect(
      calculatePlanProgress([{ status: 'completed' }, { status: 'todo' }, { status: 'cancelled' }]),
    ).toBe(50);
    expect(calculatePlanProgress([{ status: 'cancelled' }])).toBeNull();
  });

  it('prioritizes Radar recommendations deterministically', () => {
    expect(
      prioritizePortalOpportunities([
        { id: '1', priority: 'low', sourceType: 'radar_recommendation', title: 'Baixa' },
        { id: '2', priority: 'high', sourceType: 'radar_recommendation', title: 'Alta B' },
        { id: '3', priority: 'high', sourceType: 'radar_recommendation', title: 'Alta A' },
      ]).map((item) => item.id),
    ).toEqual(['3', '2', '1']);
  });

  it('enforces explicit workflow transitions', () => {
    expect(isRequestTransitionAllowed('open', 'acknowledged')).toBe(true);
    expect(isRequestTransitionAllowed('open', 'resolved')).toBe(false);
    expect(isPlanTransitionAllowed('draft', 'active')).toBe(true);
    expect(isPlanTransitionAllowed('completed', 'active')).toBe(false);
    expect(isTaskTransitionAllowed('blocked', 'in_progress')).toBe(true);
    expect(isTaskTransitionAllowed('completed', 'todo')).toBe(false);
  });
});
