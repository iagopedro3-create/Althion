import { z } from 'zod';
import type { PortalContext } from '@/lib/portal-context';

const criterionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  maxScore: z.number().int(),
});

const rubricSchema = z.object({
  version: z.string(),
  title: z.string(),
  description: z.string(),
  criteria: z.array(criterionSchema),
  is_active: z.boolean(),
  created_at: z.string(),
});

const evaluationSchema = z.object({
  id: z.uuid(),
  organization_id: z.uuid(),
  clinic_id: z.uuid(),
  conversation_id: z.string(),
  evaluator_id: z.uuid(),
  rubric_version: z.string(),
  scores: z.record(z.string(), z.number().int()),
  total_score: z.coerce.number(),
  feedback: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

const clinicalFlagSchema = z.object({
  id: z.uuid(),
  organization_id: z.uuid(),
  clinic_id: z.uuid(),
  conversation_id: z.string(),
  flagged_at: z.string(),
  flagged_by_profile_id: z.uuid().nullable(),
  flag_reason: z.string(),
  status: z.enum(['pending', 'transferred', 'resolved']),
  resolved_at: z.string().nullable(),
  resolved_by_profile_id: z.uuid().nullable(),
  handoff_notes: z.string().nullable(),
});

const commandResponseSchema = z.object({ id: z.uuid() });

export type QualityRubricView = z.infer<typeof rubricSchema>;
export type QualityEvaluationView = z.infer<typeof evaluationSchema>;
export type QualityClinicalFlagView = z.infer<typeof clinicalFlagSchema>;

export type QualityApiResult<T> =
  | { readonly data: T; readonly kind: 'success' }
  | { readonly kind: 'denied' | 'not_found' | 'unavailable' };

export type QualityMutationResult<T> =
  | { readonly data: T; readonly kind: 'success' }
  | { readonly kind: 'conflict' | 'denied' | 'invalid' | 'not_found' | 'unavailable' };

const endpoint = (path: string): string | null => {
  const apiUrl = process.env.ALTHION_API_URL;
  return apiUrl ? `${apiUrl}${path}` : null;
};

const basePath = (context: PortalContext): string =>
  `/api/v1/organizations/${context.organizationId}/clinics/${context.clinicId}/quality`;

async function readApi<T>(
  path: string,
  token: string,
  schema: z.ZodType<T>,
): Promise<QualityApiResult<T>> {
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
): Promise<QualityMutationResult<T>> {
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

export const fetchQualityRubrics = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/rubrics`, token, z.array(rubricSchema));

export const fetchQualityEvaluations = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/evaluations`, token, z.array(evaluationSchema));

export const fetchQualityClinicalFlags = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/clinical-flags`, token, z.array(clinicalFlagSchema));

export const createQualityEvaluation = (
  token: string,
  context: PortalContext,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(`${basePath(context)}/evaluations`, token, input, idempotencyKey, commandResponseSchema);

export const flagClinicalConversation = (
  token: string,
  context: PortalContext,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/clinical-flags`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );

export const resolveClinicalFlag = (
  token: string,
  context: PortalContext,
  flagId: string,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/clinical-flags/${flagId}/resolve`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );
