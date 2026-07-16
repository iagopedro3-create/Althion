import type { ImprovementPlanStatus, RequestStatus, TaskStatus } from './types';

const REQUEST_TRANSITIONS: Readonly<Record<RequestStatus, ReadonlySet<RequestStatus>>> = {
  acknowledged: new Set(['in_progress', 'closed']),
  closed: new Set(),
  in_progress: new Set(['waiting_customer', 'resolved', 'closed']),
  open: new Set(['acknowledged', 'closed']),
  resolved: new Set(['closed', 'in_progress']),
  waiting_customer: new Set(['in_progress', 'resolved', 'closed']),
};

const PLAN_TRANSITIONS: Readonly<
  Record<ImprovementPlanStatus, ReadonlySet<ImprovementPlanStatus>>
> = {
  active: new Set(['completed', 'archived']),
  archived: new Set(),
  completed: new Set(['archived']),
  draft: new Set(['active', 'archived']),
};

const TASK_TRANSITIONS: Readonly<Record<TaskStatus, ReadonlySet<TaskStatus>>> = {
  blocked: new Set(['todo', 'in_progress', 'cancelled']),
  cancelled: new Set(),
  completed: new Set(),
  in_progress: new Set(['blocked', 'completed', 'cancelled']),
  todo: new Set(['in_progress', 'blocked', 'completed', 'cancelled']),
};

export const isRequestTransitionAllowed = (from: RequestStatus, to: RequestStatus): boolean =>
  REQUEST_TRANSITIONS[from].has(to);

export const isPlanTransitionAllowed = (
  from: ImprovementPlanStatus,
  to: ImprovementPlanStatus,
): boolean => PLAN_TRANSITIONS[from].has(to);

export const isTaskTransitionAllowed = (from: TaskStatus, to: TaskStatus): boolean =>
  TASK_TRANSITIONS[from].has(to);
