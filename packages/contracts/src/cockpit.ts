import {
  INCIDENT_CATEGORIES,
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  MEETING_PURPOSES,
  MEETING_STATUSES,
} from '@althion/domain';
import { z } from 'zod';

export const cockpitClinicParamsSchema = z.object({
  clinicId: z.uuid(),
  organizationId: z.uuid(),
});

export const incidentParamsSchema = cockpitClinicParamsSchema.extend({ incidentId: z.uuid() });
export const meetingParamsSchema = cockpitClinicParamsSchema.extend({ meetingId: z.uuid() });

const reasonCodeSchema = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9_]{2,63}$/)
  .optional();

export const incidentListQuerySchema = z.object({
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  severity: z.enum(INCIDENT_SEVERITIES).optional(),
  status: z.enum(INCIDENT_STATUSES).optional(),
});

export const createIncidentSchema = z.object({
  category: z.enum(INCIDENT_CATEGORIES),
  details: z.string().trim().min(10).max(1_000),
  severity: z.enum(INCIDENT_SEVERITIES).default('medium'),
  subject: z.string().trim().min(5).max(160),
});

export const incidentTransitionSchema = z.object({
  reasonCode: reasonCodeSchema,
  toStatus: z.enum(INCIDENT_STATUSES),
});

export const meetingListQuerySchema = z.object({
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  status: z.enum(MEETING_STATUSES).optional(),
});

export const createMeetingSchema = z.object({
  purpose: z.enum(MEETING_PURPOSES),
  scheduledAt: z.iso.datetime({ offset: true }),
  summary: z.string().trim().min(5).max(500).nullable().optional(),
});

export const meetingTransitionSchema = z.object({
  reasonCode: reasonCodeSchema,
  summary: z.string().trim().min(5).max(500).nullable().optional(),
  toStatus: z.enum(MEETING_STATUSES),
});

export type IncidentListQuery = z.infer<typeof incidentListQuerySchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type IncidentTransitionInput = z.infer<typeof incidentTransitionSchema>;
export type MeetingListQuery = z.infer<typeof meetingListQuerySchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type MeetingTransitionInput = z.infer<typeof meetingTransitionSchema>;
