import { z } from 'zod';

import type { PortalContext } from '@/lib/portal-context';

const numeric = z.coerce.number();
const availabilitySchema = z.enum([
  'available',
  'insufficient_data',
  'not_assigned',
  'source_blocked',
  'source_not_configured',
  'module_not_available',
  'stale',
]);

const scoreSchema = z
  .object({
    availability: availabilitySchema,
    calculatedAt: z.string().optional(),
    coverage: numeric.optional(),
    formulaStatus: z.enum(['draft', 'published', 'retired']).optional(),
    formulaVersion: z.string().optional(),
    id: z.uuid().optional(),
    periodEnd: z.string().optional(),
    periodStart: z.string().optional(),
    scoreValue: numeric.nullable().optional(),
    status: z.enum(['calculated', 'insufficient_data']).optional(),
  })
  .strict();

const trendPointSchema = z.object({
  calculatedAt: z.string(),
  coverage: numeric,
  id: z.uuid(),
  scoreValue: numeric,
});

const opportunitySchema = z.object({
  dimension: z.string().nullable(),
  evidenceMetricCode: z.string().nullable().optional(),
  evidence_metric_code: z.string().nullable().optional(),
  id: z.uuid(),
  priority: z.enum(['high', 'medium', 'low']),
  rationale: z.string(),
  rule_code: z.string().optional(),
  rule_version: z.string().optional(),
  sourceType: z.literal('radar_recommendation'),
  title: z.string(),
});

const specialistSchema = z.object({
  assignment_id: z.uuid().optional(),
  availability: availabilitySchema,
  display_name: z.string().optional(),
  profile_id: z.uuid().optional(),
  starts_at: z.string().optional(),
});

const portalDashboardSchema = z.object({
  clinicId: z.uuid(),
  generatedAt: z.string(),
  integrations: z.array(
    z.object({
      availability: availabilitySchema,
      lastErrorCode: z.string().nullable(),
      lastSuccessAt: z.string().nullable(),
      provider: z.string(),
      status: z.string(),
    }),
  ),
  opportunities: z.array(opportunitySchema),
  organizationId: z.uuid(),
  plan: z
    .object({
      completedTasks: z.number().int(),
      dueTasks: z.number().int(),
      id: z.uuid(),
      progress: z.number().int().nullable(),
      status: z.enum(['draft', 'active', 'completed', 'archived']),
      title: z.string(),
      totalTasks: z.number().int(),
      version: z.number().int(),
    })
    .nullable(),
  requests: z.object({
    highPriorityOpen: z.number().int(),
    open: z.number().int(),
    totalVisible: z.number().int(),
  }),
  score: scoreSchema,
  sources: z.array(
    z.object({
      availability: availabilitySchema,
      key: z.string(),
      label: z.string(),
      source: z.string().nullable(),
    }),
  ),
  specialist: specialistSchema,
  trend: z.array(trendPointSchema),
});

const componentSchema = z.object({
  contribution: numeric.nullable(),
  dimension: z.string(),
  id: z.uuid(),
  metric_code: z.string(),
  score_value: numeric.nullable(),
  status: z.enum(['calculated', 'insufficient_data']),
  weight: numeric,
});

const evidenceSchema = z.object({
  denominator: numeric.nullable(),
  metric_code: z.string(),
  normalized_value: numeric.nullable(),
  numerator: numeric.nullable(),
  quality: z.enum(['declared', 'verified']).nullable(),
  reason_code: z.string().nullable(),
  source: z.literal('manual').nullable(),
});

const scoreRowSchema = z.object({
  calculated_at: z.string(),
  coverage: numeric,
  id: z.uuid(),
  score_value: numeric.nullable(),
  status: z.enum(['calculated', 'insufficient_data']),
});

const portalIndicatorsSchema = z.object({
  availability: availabilitySchema,
  history: z.array(
    z.object({
      calculatedAt: z.string(),
      coverage: numeric,
      id: z.uuid(),
      scoreValue: numeric.nullable(),
      status: z.enum(['calculated', 'insufficient_data']),
    }),
  ),
  latest: z
    .object({
      components: z.array(componentSchema),
      evidence: z.array(evidenceSchema),
      formula: z.object({ status: z.string(), version: z.string() }),
      periodEnd: z.string(),
      periodStart: z.string(),
      score: scoreRowSchema,
    })
    .nullable(),
});

const portalOpportunitiesSchema = z.object({
  availability: availabilitySchema,
  items: z.array(opportunitySchema),
  scoreId: z.uuid().nullable(),
});

const portalPersonSchema = z.object({
  display_name: z.string(),
  person_kind: z.string(),
  profile_id: z.uuid(),
});

const requestRowSchema = z.object({
  acknowledged_at: z.string().nullable(),
  assignee_profile_id: z.uuid().nullable(),
  category: z.enum([
    'access',
    'integration',
    'data_quality',
    'operational_support',
    'meeting',
    'other',
  ]),
  clinic_id: z.uuid(),
  closed_at: z.string().nullable(),
  created_at: z.string(),
  details: z.string(),
  id: z.uuid(),
  organization_id: z.uuid(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  requester_profile_id: z.uuid(),
  resolved_at: z.string().nullable(),
  status: z.enum(['open', 'acknowledged', 'in_progress', 'waiting_customer', 'resolved', 'closed']),
  subject: z.string(),
  updated_at: z.string(),
});

const requestHistorySchema = z.object({
  changed_at: z.string(),
  changed_by_profile_id: z.uuid(),
  from_status: requestRowSchema.shape.status.nullable(),
  id: z.uuid(),
  reason_code: z.string().nullable(),
  to_status: requestRowSchema.shape.status,
});

const portalRequestsSchema = z.object({
  items: z.array(requestRowSchema),
  nextCursor: z.uuid().nullable(),
});

const portalRequestDetailSchema = z.object({
  history: z.array(requestHistorySchema),
  request: requestRowSchema,
});

const planRowSchema = z.object({
  activated_at: z.string().nullable(),
  archived_at: z.string().nullable(),
  clinic_id: z.uuid(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  id: z.uuid(),
  organization_id: z.uuid(),
  period_end: z.string().nullable(),
  period_start: z.string().nullable(),
  source_score_id: z.uuid().nullable(),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  title: z.string(),
  updated_at: z.string(),
  version: z.number().int(),
});

const taskRowSchema = z.object({
  assignee_profile_id: z.uuid().nullable(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  due_at: z.string().nullable(),
  id: z.uuid(),
  improvement_plan_id: z.uuid(),
  priority: z.enum(['low', 'normal', 'high']),
  radar_recommendation_id: z.uuid().nullable(),
  status: z.enum(['todo', 'in_progress', 'blocked', 'completed', 'cancelled']),
  title: z.string(),
});

const planHistorySchema = z.object({
  changed_at: z.string(),
  from_status: planRowSchema.shape.status.nullable(),
  id: z.uuid(),
  reason_code: z.string().nullable(),
  to_status: planRowSchema.shape.status,
});

const taskHistorySchema = z.object({
  changed_at: z.string(),
  from_status: taskRowSchema.shape.status.nullable(),
  id: z.uuid(),
  reason_code: z.string().nullable(),
  task_id: z.uuid(),
  to_status: taskRowSchema.shape.status,
});

const improvementPlanDetailSchema = z.object({
  history: z.array(planHistorySchema),
  plan: planRowSchema.nullable(),
  progress: z.number().int().nullable(),
  taskHistory: z.array(taskHistorySchema),
  tasks: z.array(taskRowSchema),
});

const commandResponseSchema = z.object({ id: z.uuid(), status: z.string() });

export type PortalDashboardView = z.infer<typeof portalDashboardSchema>;
export type PortalIndicatorsView = z.infer<typeof portalIndicatorsSchema>;
export type PortalOpportunitiesView = z.infer<typeof portalOpportunitiesSchema>;
export type PortalPersonView = z.infer<typeof portalPersonSchema>;
export type PortalRequestView = z.infer<typeof requestRowSchema>;
export type PortalRequestDetailView = z.infer<typeof portalRequestDetailSchema>;
export type ImprovementPlanDetailView = z.infer<typeof improvementPlanDetailSchema>;

export type PortalApiResult<T> =
  | { readonly data: T; readonly kind: 'success' }
  | { readonly kind: 'denied' | 'not_found' | 'unavailable' };

export type PortalMutationResult<T> =
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
): Promise<PortalApiResult<T>> {
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
): Promise<PortalMutationResult<T>> {
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

export const fetchPortalDashboard = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/portal/dashboard`, token, portalDashboardSchema);

export const fetchPortalIndicators = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/portal/indicators`, token, portalIndicatorsSchema);

export const fetchPortalOpportunities = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/portal/opportunities`, token, portalOpportunitiesSchema);

export const fetchPortalSpecialist = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/portal/specialist`, token, specialistSchema);

export const fetchPortalPeople = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/portal/people`, token, z.array(portalPersonSchema));

export const fetchPortalRequests = (
  token: string,
  context: PortalContext,
  filters?: { category?: string; cursor?: string; status?: string },
) => {
  const query = new URLSearchParams();
  if (filters?.category) query.set('category', filters.category);
  if (filters?.cursor) query.set('cursor', filters.cursor);
  if (filters?.status) query.set('status', filters.status);
  const suffix = query.size ? `?${query}` : '';
  return readApi(`${basePath(context)}/requests${suffix}`, token, portalRequestsSchema);
};

export const fetchPortalRequest = (token: string, context: PortalContext, requestId: string) =>
  readApi(`${basePath(context)}/requests/${requestId}`, token, portalRequestDetailSchema);

export const fetchImprovementPlan = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/improvement-plans/current`, token, improvementPlanDetailSchema);

export const createPortalRequest = (
  token: string,
  context: PortalContext,
  input: unknown,
  idempotencyKey: string,
) => writeApi(`${basePath(context)}/requests`, token, input, idempotencyKey, commandResponseSchema);

export const transitionPortalRequest = (
  token: string,
  context: PortalContext,
  requestId: string,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/requests/${requestId}/transitions`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );

export const createImprovementPlan = (
  token: string,
  context: PortalContext,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/improvement-plans`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );

export const transitionImprovementPlan = (
  token: string,
  context: PortalContext,
  planId: string,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/improvement-plans/${planId}/transitions`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );

export const createPortalTask = (
  token: string,
  context: PortalContext,
  planId: string,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/improvement-plans/${planId}/tasks`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );

export const transitionPortalTask = (
  token: string,
  context: PortalContext,
  taskId: string,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/tasks/${taskId}/transitions`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );
