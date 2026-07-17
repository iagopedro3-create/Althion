import { z } from 'zod';

import type { PortalContext } from '@/lib/portal-context';

const simulationSchema = z.object({
  created_at: z.string(),
  excluded_frequency: z.number().int(),
  excluded_no_consent: z.number().int(),
  excluded_suppressed: z.number().int(),
  id: z.uuid(),
  leads_evaluated: z.number().int(),
  opportunities_identified: z.number().int(),
  policy_version: z.string(),
  provider: z.literal('mock'),
  status: z.enum(['completed', 'failed']),
  window_end: z.string(),
  window_start: z.string(),
});

const opportunitySchema = z.object({
  created_at: z.string(),
  decided_at: z.string().nullable(),
  evidence: z.record(z.string(), z.unknown()),
  expires_at: z.string(),
  external_lead_ref: z.string(),
  id: z.uuid(),
  lead_label: z.string().nullable(),
  reason_code: z.string().nullable(),
  rule_code: z.enum(['lead_no_response', 'attended_no_booking']),
  rule_version: z.string(),
  simulation_id: z.uuid(),
  status: z.enum(['identified', 'approved', 'discarded', 'expired']),
});

const actionSchema = z.object({
  action_type: z.enum(['contact_lead', 'offer_booking']),
  created_at: z.string(),
  decided_at: z.string().nullable(),
  expires_at: z.string(),
  id: z.uuid(),
  opportunity_id: z.uuid(),
  reason_code: z.string().nullable(),
  status: z.enum(['recommended', 'approved', 'rejected', 'expired']),
});

const suppressionSchema = z.object({
  created_at: z.string(),
  expires_at: z.string().nullable(),
  external_lead_ref: z.string(),
  id: z.uuid(),
  reason: z.enum(['opt_out', 'complaint', 'manual_review', 'other']),
  revoked_at: z.string().nullable(),
});

const queueSchema = z.object({
  actions: z.array(actionSchema),
  executionAvailable: z.literal(false),
  opportunities: z.array(opportunitySchema),
  provider: z.literal('mock'),
  simulations: z.array(simulationSchema),
  suppressions: z.array(suppressionSchema),
});

const simulationResultSchema = z.object({
  id: z.uuid(),
  identified: z.number().int(),
  leadsEvaluated: z.number().int(),
  policyVersion: z.string(),
  status: z.literal('completed'),
});

const commandResponseSchema = z.object({ id: z.uuid(), status: z.string() });

export type RecoveryQueueView = z.infer<typeof queueSchema>;
export type RecoveryOpportunityView = z.infer<typeof opportunitySchema>;
export type RecoveryActionView = z.infer<typeof actionSchema>;

export type RecoveryApiResult<T> =
  | { readonly data: T; readonly kind: 'success' }
  | { readonly kind: 'denied' | 'not_found' | 'unavailable' };

export type RecoveryMutationResult<T> =
  | { readonly data: T; readonly kind: 'success' }
  | { readonly kind: 'conflict' | 'denied' | 'invalid' | 'not_found' | 'unavailable' };

const endpoint = (path: string): string | null => {
  const apiUrl = process.env.ALTHION_API_URL;
  return apiUrl ? `${apiUrl}${path}` : null;
};

const basePath = (context: PortalContext): string =>
  `/api/v1/organizations/${context.organizationId}/clinics/${context.clinicId}/recovery`;

async function readApi<T>(
  path: string,
  token: string,
  schema: z.ZodType<T>,
): Promise<RecoveryApiResult<T>> {
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
): Promise<RecoveryMutationResult<T>> {
  const url = endpoint(path);
  if (!url) return { kind: 'unavailable' };
  try {
    const response = await fetch(url, {
      body: JSON.stringify(body ?? {}),
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

export const fetchRecoveryQueue = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/queue`, token, queueSchema);

export const runRecoverySimulation = (
  token: string,
  context: PortalContext,
  idempotencyKey: string,
) =>
  writeApi(`${basePath(context)}/simulations`, token, {}, idempotencyKey, simulationResultSchema);

export const decideRecoveryOpportunity = (
  token: string,
  context: PortalContext,
  opportunityId: string,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/opportunities/${opportunityId}/decisions`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );

export const decideRecoveryAction = (
  token: string,
  context: PortalContext,
  actionId: string,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/actions/${actionId}/decisions`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );

export const createRecoverySuppression = (
  token: string,
  context: PortalContext,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/suppressions`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );

export const revokeRecoverySuppression = (
  token: string,
  context: PortalContext,
  suppressionId: string,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/suppressions/${suppressionId}/revoke`,
    token,
    {},
    idempotencyKey,
    commandResponseSchema,
  );
