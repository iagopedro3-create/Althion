export const PORTAL_AVAILABILITY_STATES = [
  'available',
  'insufficient_data',
  'not_assigned',
  'handled_externally',
  'source_blocked',
  'source_not_configured',
  'module_not_available',
  'stale',
] as const;

export type PortalAvailabilityState = (typeof PORTAL_AVAILABILITY_STATES)[number];

export const REQUEST_CATEGORIES = [
  'access',
  'integration',
  'data_quality',
  'operational_support',
  'meeting',
  'other',
] as const;

export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

export const REQUEST_STATUSES = [
  'open',
  'acknowledged',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed',
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;

export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

export const IMPROVEMENT_PLAN_STATUSES = ['draft', 'active', 'completed', 'archived'] as const;

export type ImprovementPlanStatus = (typeof IMPROVEMENT_PLAN_STATUSES)[number];

export const TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'completed', 'cancelled'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'normal', 'high'] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const PORTAL_OPPORTUNITY_PRIORITIES = ['high', 'medium', 'low'] as const;

export type PortalOpportunityPriority = (typeof PORTAL_OPPORTUNITY_PRIORITIES)[number];

export interface PortalOpportunity {
  readonly id: string;
  readonly priority: PortalOpportunityPriority;
  readonly sourceType: 'radar_recommendation';
  readonly title: string;
}

export interface PlanTaskLike {
  readonly status: TaskStatus;
}
