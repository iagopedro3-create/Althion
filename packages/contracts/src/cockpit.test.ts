import { describe, expect, it } from 'vitest';

import {
  createIncidentSchema,
  createMeetingSchema,
  incidentListQuerySchema,
  incidentTransitionSchema,
  meetingTransitionSchema,
} from './cockpit';

describe('cockpit contracts', () => {
  it('accepts a bounded operational incident with default severity', () => {
    expect(
      createIncidentSchema.parse({
        category: 'data_quality',
        details: 'Cobertura declarada do Radar caiu abaixo do esperado.',
        subject: 'Cobertura em queda',
      }),
    ).toMatchObject({ severity: 'medium' });
  });

  it('rejects incident texts outside the allowed bounds', () => {
    expect(
      createIncidentSchema.safeParse({
        category: 'operational',
        details: 'curto',
        subject: 'Oi',
      }).success,
    ).toBe(false);
  });

  it('validates transition enums and reason codes', () => {
    expect(
      incidentTransitionSchema.safeParse({ reasonCode: 'Nope!', toStatus: 'investigating' })
        .success,
    ).toBe(false);
    expect(
      meetingTransitionSchema.parse({ reasonCode: 'client_confirmed', toStatus: 'completed' })
        .toStatus,
    ).toBe('completed');
  });

  it('requires an offset datetime for meetings and coerces pagination', () => {
    expect(
      createMeetingSchema.safeParse({ purpose: 'checkin', scheduledAt: '2026-08-01' }).success,
    ).toBe(false);
    expect(
      createMeetingSchema.safeParse({
        purpose: 'checkin',
        scheduledAt: '2026-08-01T14:00:00.000-03:00',
      }).success,
    ).toBe(true);
    expect(incidentListQuerySchema.parse({ limit: '10' }).limit).toBe(10);
  });
});
