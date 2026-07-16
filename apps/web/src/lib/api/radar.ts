import { z } from 'zod';

const numeric = z.coerce.number();

const clinicSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  organization_id: z.uuid(),
});

const scoreSummarySchema = z.object({
  coverage: numeric,
  id: z.uuid(),
  score_value: numeric.nullable(),
  status: z.enum(['calculated', 'insufficient_data']),
});

const assessmentSchema = z.object({
  clinic_id: z.uuid(),
  created_at: z.string(),
  id: z.uuid(),
  organization_id: z.uuid(),
  period_end: z.string(),
  period_start: z.string(),
  questionnaire_version: z.string(),
  score: scoreSummarySchema.nullable(),
  status: z.enum(['draft', 'submitted']),
  submitted_at: z.string().nullable(),
  unit_id: z.uuid().nullable(),
});

const metricSchema = z.object({
  denominator: numeric,
  id: z.uuid(),
  metric_code: z.string(),
  numerator: numeric,
  observation: z.string().nullable(),
  quality: z.enum(['declared', 'verified']),
  source: z.literal('manual'),
});

const assessmentDetailSchema = assessmentSchema.extend({ metrics: z.array(metricSchema) });

const scoreRowSchema = z.object({
  assessment_id: z.uuid(),
  calculated_at: z.string(),
  clinic_id: z.uuid(),
  coverage: numeric,
  formula_id: z.uuid(),
  id: z.uuid(),
  organization_id: z.uuid(),
  score_value: numeric.nullable(),
  status: z.enum(['calculated', 'insufficient_data']),
});

const scoreComponentSchema = z.object({
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

const recommendationSchema = z.object({
  dimension: z.string().nullable(),
  evidence_metric_code: z.string().nullable(),
  id: z.uuid(),
  priority: z.enum(['high', 'medium', 'low']),
  rationale: z.string(),
  rule_code: z.string(),
  rule_version: z.string(),
  title: z.string(),
});

const scoreDetailSchema = z.object({
  assessment: assessmentSchema.omit({ score: true }),
  components: z.array(scoreComponentSchema),
  evidence: z.array(evidenceSchema),
  formula: z.object({
    minimum_coverage: numeric,
    status: z.enum(['draft', 'published', 'retired']),
    version: z.string(),
  }),
  recommendations: z.array(recommendationSchema),
  score: scoreRowSchema,
});

const previewSchema = z.object({
  components: z.array(
    z.object({
      contribution: numeric.nullable(),
      dimension: z.string(),
      score: numeric.nullable(),
      status: z.enum(['calculated', 'insufficient_data']),
      weight: numeric,
    }),
  ),
  coverage: numeric,
  formulaStatus: z.literal('draft'),
  formulaVersion: z.string(),
  recommendations: z.array(
    z.object({
      code: z.string(),
      dimension: z.string().nullable(),
      priority: z.enum(['high', 'medium', 'low']),
      rationale: z.string(),
      title: z.string(),
    }),
  ),
  score: numeric.nullable(),
  status: z.enum(['calculated', 'insufficient_data']),
});

const scoreComparisonSchema = z.object({
  componentChanges: z.array(
    z.object({
      current: numeric.nullable(),
      delta: numeric.nullable(),
      dimension: z.string(),
      previous: numeric.nullable(),
    }),
  ),
  current: scoreRowSchema,
  formulaChanged: z.boolean(),
  periodComparable: z.boolean(),
  previous: scoreRowSchema,
});

export type ClinicView = z.infer<typeof clinicSchema>;
export type RadarAssessmentView = z.infer<typeof assessmentSchema>;
export type RadarAssessmentDetail = z.infer<typeof assessmentDetailSchema>;
export type RadarPreview = z.infer<typeof previewSchema>;
export type ScoreDetailView = z.infer<typeof scoreDetailSchema>;
export type ScoreRowView = z.infer<typeof scoreRowSchema>;
export type ScoreComparisonView = z.infer<typeof scoreComparisonSchema>;

export type ApiResult<T> =
  | { readonly data: T; readonly kind: 'success' }
  | { readonly kind: 'denied' | 'not_found' | 'unavailable' };

const endpoint = (path: string): string | null => {
  const apiUrl = process.env.ALTHION_API_URL;
  return apiUrl ? `${apiUrl}${path}` : null;
};

async function readApi<T>(
  path: string,
  token: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  const url = endpoint(path);
  if (!url) return { kind: 'unavailable' };
  try {
    const response = await fetch(url, {
      ...init,
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, ...init?.headers },
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

const basePath = (organizationId: string, clinicId: string): string =>
  `/api/v1/organizations/${organizationId}/clinics/${clinicId}`;

export const fetchClinics = (token: string, organizationId: string) =>
  readApi(`/api/v1/organizations/${organizationId}/clinics`, token, z.array(clinicSchema));

export const fetchRadarAssessments = (token: string, organizationId: string, clinicId: string) =>
  readApi(
    `${basePath(organizationId, clinicId)}/radar-assessments`,
    token,
    z.array(assessmentSchema),
  );

export const fetchRadarAssessment = (
  token: string,
  organizationId: string,
  clinicId: string,
  assessmentId: string,
) =>
  readApi(
    `${basePath(organizationId, clinicId)}/radar-assessments/${assessmentId}`,
    token,
    assessmentDetailSchema,
  );

export const fetchRadarPreview = (
  token: string,
  organizationId: string,
  clinicId: string,
  assessmentId: string,
) =>
  readApi(
    `${basePath(organizationId, clinicId)}/radar-assessments/${assessmentId}/calculate`,
    token,
    previewSchema,
    { method: 'POST' },
  );

export const fetchScores = (token: string, organizationId: string, clinicId: string) =>
  readApi(`${basePath(organizationId, clinicId)}/scores`, token, z.array(scoreRowSchema));

export const fetchScore = (
  token: string,
  organizationId: string,
  clinicId: string,
  scoreId: string,
) => readApi(`${basePath(organizationId, clinicId)}/scores/${scoreId}`, token, scoreDetailSchema);

export const fetchScoreComparison = (
  token: string,
  organizationId: string,
  clinicId: string,
  currentScoreId: string,
  previousScoreId: string,
) =>
  readApi(
    `${basePath(organizationId, clinicId)}/score-comparisons?${new URLSearchParams({ currentScoreId, previousScoreId })}`,
    token,
    scoreComparisonSchema,
  );

export const apiEndpoint = endpoint;
