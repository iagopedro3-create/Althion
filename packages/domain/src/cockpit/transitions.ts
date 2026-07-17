import type { IncidentStatus, MeetingStatus } from './types';

const INCIDENT_TRANSITIONS: Readonly<Record<IncidentStatus, ReadonlySet<IncidentStatus>>> = {
  closed: new Set(),
  investigating: new Set(['mitigated', 'resolved', 'closed']),
  mitigated: new Set(['investigating', 'resolved', 'closed']),
  open: new Set(['investigating', 'resolved', 'closed']),
  resolved: new Set(['closed', 'investigating']),
};

const MEETING_TRANSITIONS: Readonly<Record<MeetingStatus, ReadonlySet<MeetingStatus>>> = {
  cancelled: new Set(),
  completed: new Set(),
  no_show: new Set(),
  scheduled: new Set(['completed', 'cancelled', 'no_show']),
};

export const isIncidentTransitionAllowed = (from: IncidentStatus, to: IncidentStatus): boolean =>
  INCIDENT_TRANSITIONS[from].has(to);

export const isMeetingTransitionAllowed = (from: MeetingStatus, to: MeetingStatus): boolean =>
  MEETING_TRANSITIONS[from].has(to);
