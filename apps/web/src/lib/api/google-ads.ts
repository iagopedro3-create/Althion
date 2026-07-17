import { z } from 'zod';
import type { PortalContext } from '@/lib/portal-context';

const credentialsSchema = z.object({
  id: z.uuid(),
  organization_id: z.uuid(),
  clinic_id: z.uuid(),
  customer_id: z.string(),
  status: z.enum(['active', 'disabled', 'error']),
  last_sync_at: z.string().nullable(),
  last_error_code: z.string().nullable(),
});

const campaignSchema = z.object({
  id: z.uuid(),
  campaign_id: z.string(),
  name: z.string(),
  status: z.string(),
  budget_micros: z.coerce.number(),
});

const attributionSummarySchema = z.object({
  attribution: z.object({
    totalAdSpend: z.number(),
    totalAdClicks: z.number().int(),
    totalAdConversions: z.number(),
    matchedLeadsCount: z.number().int(),
    matchedConsultationsCount: z.number().int(),
    totalLeadsCount: z.number().int(),
    totalConsultationsCount: z.number().int(),
    coverageRatio: z.number(),
    uncertaintyRatio: z.number(),
    costPerMatchedLead: z.number(),
    costPerConsultation: z.number(),
  }),
  campaignsCount: z.number().int(),
  leadsMatchedCount: z.number().int(),
});

const syncResultSchema = z.object({
  status: z.literal('completed'),
  campaignsSynced: z.number().int(),
  metricsSynced: z.number().int(),
});

const commandResponseSchema = z.object({ id: z.uuid() });

export type GoogleAdsCredentialsView = z.infer<typeof credentialsSchema>;
export type GoogleAdsCampaignView = z.infer<typeof campaignSchema>;
export type GoogleAdsAttributionView = z.infer<typeof attributionSummarySchema>;

export type GoogleAdsApiResult<T> =
  | { readonly data: T; readonly kind: 'success' }
  | { readonly kind: 'denied' | 'not_found' | 'unavailable' };

export type GoogleAdsMutationResult<T> =
  | { readonly data: T; readonly kind: 'success' }
  | { readonly kind: 'conflict' | 'denied' | 'invalid' | 'not_found' | 'unavailable' };

const endpoint = (path: string): string | null => {
  const apiUrl = process.env.ALTHION_API_URL;
  return apiUrl ? `${apiUrl}${path}` : null;
};

const basePath = (context: PortalContext): string =>
  `/api/v1/organizations/${context.organizationId}/clinics/${context.clinicId}/google-ads`;

async function readApi<T>(
  path: string,
  token: string,
  schema: z.ZodType<T>,
): Promise<GoogleAdsApiResult<T>> {
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
): Promise<GoogleAdsMutationResult<T>> {
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

export const fetchGoogleAdsCredentials = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/credentials`, token, credentialsSchema);

export const saveGoogleAdsCredentials = (
  token: string,
  context: PortalContext,
  input: unknown,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/credentials`,
    token,
    input,
    idempotencyKey,
    commandResponseSchema,
  );

export const fetchGoogleAdsCampaigns = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/campaigns`, token, z.array(campaignSchema));

export const fetchGoogleAdsAttribution = (token: string, context: PortalContext) =>
  readApi(`${basePath(context)}/attribution`, token, attributionSummarySchema);

export const syncGoogleAds = (
  token: string,
  context: PortalContext,
  idempotencyKey: string,
) =>
  writeApi(
    `${basePath(context)}/sync`,
    token,
    {},
    idempotencyKey,
    syncResultSchema,
  );
