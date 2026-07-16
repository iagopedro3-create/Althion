import type { PlanTaskLike, PortalOpportunity } from './types';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export function prioritizePortalOpportunities(
  opportunities: readonly PortalOpportunity[],
  limit = 3,
): readonly PortalOpportunity[] {
  if (!Number.isInteger(limit) || limit < 0) return [];

  return [...opportunities]
    .sort(
      (left, right) =>
        PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority] ||
        left.title.localeCompare(right.title, 'pt-BR'),
    )
    .slice(0, limit);
}

export function calculatePlanProgress(tasks: readonly PlanTaskLike[]): number | null {
  const eligible = tasks.filter((task) => task.status !== 'cancelled');
  if (!eligible.length) return null;

  const completed = eligible.filter((task) => task.status === 'completed').length;
  return Math.round((completed / eligible.length) * 100);
}
