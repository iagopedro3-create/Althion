import { z } from 'zod';

import type { PortalContext } from '@/lib/portal-context';

const numeric = z.coerce.number();

const healthReasonSchema = z.object({
  code: z.string(),
  evidence: z.string(),
  level: z.enum(['attention', 'critical']),
  riskCategory: z.enum([
    'performance',
    'responsiveness',
    'data_freshness',
    'engagement',
    'operational',
  ]),
  rule: z.string(),
});

const healthSchema = z.object({
  reasons: z.array(healthReasonSchema),
  state: z.enum(['healthy', 'attention', 'critical']),
});

const nextBestActionSchema = z.object({
  code: z.string(),
  evidence: z.string(),
  rank: z.number().int(),
  riskCategory: healthReasonSchema.shape.riskCategory,
  title: z.string(),
});

const slaSchema = z.object({
  deadlineAt: z.string(),
  elapsedRatio: numeric.nullable(),
  stage: z.enum(['acknowledgement', 'resolution']),
  state: z.enum(['on_track', 'at_risk', 'breached', 'met']),
});

const capacitySchema = z.union([
  z.object({
    availability: z.literal('available'),
    limitPoints: z.number().int(),
    limitSource: z.enum(['configured', 'default']),
    state: z.enum(['available', 'near_limit', 'over_limit']),
    usedPoints: z.number().int(),
    usedRatio: numeric,
  }),
  z.object({ availability: z.literal('not_assigned') }),
]);

const portfolioAccountSchema = z.object({
  assignmentStartsAt: z.string(),
  clinicId: z.uuid(),
  clinicName: z.string().nullable(),
  complexity: z.enum(['low', 'standard', 'high']),
  health: healthSchema,
  nextBestAction: nextBestActionSchema.nullable(),
  openIncidents: z.number().int(),
  organizationId: z.uuid(),
  organizationName: z.string().nullable(),
  scoreValue: numeric.nullable(),
  slaAtRisk: z.number().int(),
  slaBreached: z.number().int(),
});

const cockpitPortfolioSchema = z.object({
  accounts: z.array(portfolioAccountSchema),
  capacity: capacitySchema,
  generatedAt: z.string(),
  policyVersion: z.string(),
  truncated: z.boolean(),
});

const incidentSchema = z.object({
  acknowledgedAt: z.string().nullable(),
  category: z.enum([
    'integration_failure',
    'data_quality',
    'sla_breach',
    'engagement_risk',
    'operational',
    'other',
  ]),
  createdAt: z.string(),
  id: z.uuid(),
  resolvedAt: z.string().nullable(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  sla: slaSchema.nullable(),
  status: z.enum(['open', 'investigating', 'mitigated', 'resolved', 'closed']),
  subject: z.string(),
});

const meetingSchema = z.object({
  completedAt: z.string().nullable(),
  id: z.uuid(),
  purpose: z.enum(['onboarding', 'checkin', 'review', 'escalation', 'other']),
  scheduledAt: z.string(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
  summary: z.string().nullable(),
});

const accountRequestSchema = z.object({
  createdAt: z.string(),
  id: z.uuid(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  sla: slaSchema,
  status: z.enum(['open', 'acknowledged', 'in_progress', 'waiting_customer']),
  subject: z.string(),
});

const cockpitAccountSchema = z.object({
  clinicId: z.uuid(),
  generatedAt: z.string(),
  health: healthSchema,
  incidents: z.array(incidentSchema),
  meetings: z.array(meetingSchema),
  nextBestActions: z.array(nextBestActionSchema),
  organizationId: z.uuid(),
  plan: z
    .object({
      id: z.uuid(),
      overdueTasks: z.number().int(),
      status: z.enum(['draft', 'active', 'completed', 'archived']),
      title: z.string(),
      version: z.number().int(),
    })
    .nullable(),
  policyVersion: z.string(),
  requests: z.array(accountRequestSchema),
  score: z.object({
    availability: z.enum(['available', 'insufficient_data']),
    calculatedAt: z.string().optional(),
    coverage: numeric.optional(),
    id: z.uuid().optional(),
    scoreValue: numeric.nullable().optional(),
    status: z.enum(['calculated', 'insufficient_data']).optional(),
  }),
});

const commandResponseSchema = z.object({ id: z.uuid(), status: z.string() });

export type CockpitPortfolioView = z.infer<typeof cockpitPortfolioSchema>;
export type CockpitAccountView = z.infer<typeof cockpitAccountSchema>;
export type CockpitHealthReason = z.infer<typeof healthReasonSchema>;
export type CockpitSlaView = z.infer<typeof slaSchema>;

export type CockpitApiResult<T> =
  | { readonly data: T; readonly kind: 'success' }
  | { readonly kind: 'denied' | 'not_found' | 'unavailable' };

export type CockpitMutationResult<T> =
  | { readonly data: T; readonly kind: 'success' }
  | { readonly kind: 'conflict' | 'denied' | 'invalid' | 'not_found' | 'unavailable' };

const endpoint = (path: string): string | null => {
  const apiUrl = process.env.ALTHION_API_URL;
  return apiUrl ? `${apiUrl}${path}` : null;
};

const basePath = (context: PortalContext): string =>
  `/api/v1/organizations/${context.organizationId}/clinics/${context.clinicId}`;

async function readApi<T>(
  path: string,
  token: string,
  schema: z.ZodType<T>,
): Promise<CockpitApiResult<T>> {
  const url = endpoint(path);
  if (!url) return { kind: 'unavailable' };
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401 || response.status === 403) return { kind: 'denied' };
    if (response.status === 404) return { kind: 'not_found' };
    if (!response.ok) return { kind: 'unavailable' };
    const parsed = schema.safeParse(await response.json());
    return parsed.success ? { data: parsed.data, kind: 'success' } : { kind: 'unavailable' };
  } catch {
    return { kind: 'unavailable' };
  }
}

async function writeApi<T>(
  path: string,
  token: string,
  body: unknown,
  idempotencyKey: string,
  schema: z.ZodType<T>,
): Promise<CockpitMutationResult<T>> {
  const url = endpoint(path);
  if (!url) return { kind: 'unavailable' };
  try {
    const response = await fetch(url, {
      body: JSON.stringify(body),
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      method: 'POST',
    });
    if (response.status === 401 || response.status === 403) return { kind: 'denied' };
    if (response.status === 404) return { kind: 'not_found' };
    if (response.status === 409) return { kind: 'conflict' };
    if (response.status === 400 || response.status === 422) return { kind: 'invalid' };
    if (!response.ok) return { kind: 'unavailable' };
    const parsed = schema.safeParse(await response.json());
    return parsed.success ? { data: parsed.data, kind: 'success' } : { kind: 'unavailable' };
  } catch {
    return { kind: 'unavailable' };
  }
}

export const fetchCockpitPortfolio = (token: string) =>
  readApi('/api/v1/cockpit/portfolio', token, cockpitPortfolioSchema);

export const fetchCockpitAccount = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/cockpit/account`, token, cockpitAccountSchema);

export const createCockpitIncident = (
  token: string,
  context: PortalContext,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(`${basePath(context)}/incidents`, token, input, idempotencyKey, commandResponseSchema);

export const transitionCockpitIncident = (
  token: string,
  context: PortalContext,
  incidentId: string,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/incidents/${incidentId}/transitions`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );

export const createCockpitMeeting = (
  token: string,
  context: PortalContext,
  input: unknown,
  idempotencyKey: string,
) => writeApi(`${basePath(context)}/meetings`, token, input, idempotencyKey, commandResponseSchema);

export const transitionCockpitMeeting = (
  token: string,
  context: PortalContext,
  meetingId: string,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/meetings/${meetingId}/transitions`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );
