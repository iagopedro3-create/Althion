import {
  CAPACITY_NEAR_LIMIT_RATIO,
  COMPLEXITY_WEIGHTS,
  DEFAULT_CAPACITY_LIMIT_POINTS,
} from './policy';
import type { CockpitAssignmentLike, PortfolioCapacity } from './types';

export function evaluatePortfolioCapacity(
  assignments: readonly CockpitAssignmentLike[],
  capacityLimit: number | null,
): PortfolioCapacity {
  const usedPoints = assignments
    .filter((assignment) => assignment.status === 'active')
    .reduce((total, assignment) => total + COMPLEXITY_WEIGHTS[assignment.complexity], 0);

  const configured = capacityLimit !== null && Number.isInteger(capacityLimit) && capacityLimit > 0;
  const limitPoints = configured ? capacityLimit : DEFAULT_CAPACITY_LIMIT_POINTS;
  const usedRatio = Math.round((usedPoints / limitPoints) * 100) / 100;

  return {
    limitPoints,
    limitSource: configured ? 'configured' : 'default',
    state:
      usedRatio > 1
        ? 'over_limit'
        : usedRatio >= CAPACITY_NEAR_LIMIT_RATIO
          ? 'near_limit'
          : 'available',
    usedPoints,
    usedRatio,
  };
}
