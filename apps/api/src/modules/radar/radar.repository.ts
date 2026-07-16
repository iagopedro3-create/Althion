import type { Database, Json, RadarAssessmentInput } from '@althion/contracts';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';

import { SupabaseClientFactory } from '../database/supabase-client.factory';

type AssessmentRow = Database['public']['Tables']['radar_assessments']['Row'];
type MetricRow = Database['public']['Tables']['radar_metric_inputs']['Row'];
type ScoreRow = Database['public']['Tables']['althion_scores']['Row'];
type ScoreComponentRow = Database['public']['Tables']['althion_score_components']['Row'];
type EvidenceRow = Database['public']['Tables']['althion_score_evidence']['Row'];
type RecommendationRow = Database['public']['Tables']['radar_recommendations']['Row'];
type FormulaRow = Database['public']['Tables']['althion_score_formulas']['Row'];

export interface AssessmentSummary extends AssessmentRow {
  readonly score: Pick<ScoreRow, 'id' | 'score_value' | 'status' | 'coverage'> | null;
}

export interface AssessmentDetail extends AssessmentSummary {
  readonly metrics: readonly MetricRow[];
}

export interface ScoreDetail {
  readonly assessment: AssessmentRow;
  readonly components: readonly ScoreComponentRow[];
  readonly evidence: readonly EvidenceRow[];
  readonly formula: FormulaRow;
  readonly recommendations: readonly RecommendationRow[];
  readonly score: ScoreRow;
}

@Injectable()
export class RadarRepository {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async listAssessments(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<AssessmentSummary[]> {
    const client = this.clients.createUserScoped(accessToken);
    const assessments = await client
      .from('radar_assessments')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('clinic_id', clinicId)
      .is('deleted_at', null)
      .order('period_end', { ascending: false });
    if (assessments.error) throw this.translate(assessments.error);

    const assessmentIds = assessments.data.map((assessment) => assessment.id);
    const scores = assessmentIds.length
      ? await client
          .from('althion_scores')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('clinic_id', clinicId)
          .in('assessment_id', assessmentIds)
      : { data: [], error: null };
    if (scores.error) throw this.translate(scores.error);

    return assessments.data.map((assessment) => {
      const score = scores.data.find((candidate) => candidate.assessment_id === assessment.id);
      return {
        ...assessment,
        score: score
          ? {
              coverage: score.coverage,
              id: score.id,
              score_value: score.score_value,
              status: score.status,
            }
          : null,
      };
    });
  }

  public async getAssessment(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    assessmentId: string,
  ): Promise<AssessmentDetail | null> {
    const client = this.clients.createUserScoped(accessToken);
    const [assessment, metrics, scores] = await Promise.all([
      client
        .from('radar_assessments')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .eq('id', assessmentId)
        .is('deleted_at', null)
        .maybeSingle(),
      client
        .from('radar_metric_inputs')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('assessment_id', assessmentId)
        .order('metric_code'),
      client
        .from('althion_scores')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('assessment_id', assessmentId)
        .order('calculated_at', { ascending: false })
        .limit(1),
    ]);
    if (assessment.error || metrics.error || scores.error) {
      throw this.translate(assessment.error ?? metrics.error ?? scores.error);
    }
    if (!assessment.data) return null;
    const score = scores.data[0];

    return {
      ...assessment.data,
      metrics: metrics.data,
      score: score
        ? {
            coverage: score.coverage,
            id: score.id,
            score_value: score.score_value,
            status: score.status,
          }
        : null,
    };
  }

  public async createAssessment(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: RadarAssessmentInput,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients.createUserScoped(accessToken).rpc('create_radar_assessment', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_clinic_id: clinicId,
      target_metrics: input.metrics as Json,
      target_organization_id: organizationId,
      target_period_end: input.periodEnd,
      target_period_start: input.periodStart,
      target_unit_id: input.unitId ?? null,
    });
    if (result.error) throw this.translate(result.error);
    return result.data;
  }

  public async replaceAssessment(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    assessmentId: string,
    input: RadarAssessmentInput,
    requestId: string,
  ): Promise<void> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .rpc('replace_radar_assessment', {
        request_id: requestId,
        target_assessment_id: assessmentId,
        target_clinic_id: clinicId,
        target_metrics: input.metrics as Json,
        target_organization_id: organizationId,
        target_period_end: input.periodEnd,
        target_period_start: input.periodStart,
        target_unit_id: input.unitId ?? null,
      });
    if (result.error) throw this.translate(result.error);
  }

  public async submitAssessment(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    assessmentId: string,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients.createUserScoped(accessToken).rpc('submit_radar_assessment', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_assessment_id: assessmentId,
      target_clinic_id: clinicId,
      target_organization_id: organizationId,
    });
    if (result.error) throw this.translate(result.error);
    return result.data;
  }

  public async listScores(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<ScoreRow[]> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .from('althion_scores')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('clinic_id', clinicId)
      .order('calculated_at', { ascending: false });
    if (result.error) throw this.translate(result.error);
    return result.data;
  }

  public async getScore(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    scoreId: string,
  ): Promise<ScoreDetail | null> {
    const client = this.clients.createUserScoped(accessToken);
    const score = await client
      .from('althion_scores')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('clinic_id', clinicId)
      .eq('id', scoreId)
      .maybeSingle();
    if (score.error) throw this.translate(score.error);
    if (!score.data) return null;

    const [assessment, formula, components, evidence, recommendations] = await Promise.all([
      client
        .from('radar_assessments')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('id', score.data.assessment_id)
        .single(),
      client.from('althion_score_formulas').select('*').eq('id', score.data.formula_id).single(),
      client
        .from('althion_score_components')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('score_id', scoreId)
        .order('weight', { ascending: false }),
      client
        .from('althion_score_evidence')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('score_id', scoreId)
        .order('metric_code'),
      client
        .from('radar_recommendations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('score_id', scoreId)
        .order('priority'),
    ]);
    const error =
      assessment.error ??
      formula.error ??
      components.error ??
      evidence.error ??
      recommendations.error;
    if (error) throw this.translate(error);
    if (
      !assessment.data ||
      !formula.data ||
      !components.data ||
      !evidence.data ||
      !recommendations.data
    ) {
      throw this.unavailable();
    }

    return {
      assessment: assessment.data,
      components: components.data,
      evidence: evidence.data,
      formula: formula.data,
      recommendations: recommendations.data,
      score: score.data,
    };
  }

  public async recordExport(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    assessmentId: string,
    requestId: string,
  ): Promise<void> {
    const result = await this.clients.createUserScoped(accessToken).rpc('record_radar_export', {
      request_id: requestId,
      target_assessment_id: assessmentId,
      target_clinic_id: clinicId,
      target_organization_id: organizationId,
    });
    if (result.error) throw this.translate(result.error);
  }

  private translate(error: PostgrestError | null): Error {
    if (!error) return this.unavailable();
    if (error.code === '42501') {
      return new ForbiddenException({ code: 'ACCESS_DENIED', message: 'Acesso não autorizado.' });
    }
    if (error.code === 'P0002') {
      return new NotFoundException({
        code: 'RADAR_NOT_FOUND',
        message: 'Diagnóstico não encontrado.',
      });
    }
    if (error.code === '55000' || error.code === '55P03') {
      return new ConflictException({
        code: 'RADAR_STATE_CONFLICT',
        message: 'O diagnóstico foi alterado ou já foi enviado.',
      });
    }
    if (error.code === '22023' || error.code === '23503' || error.code === '23514') {
      return new BadRequestException({
        code: 'RADAR_INPUT_INVALID',
        message: 'Os dados do diagnóstico são inválidos.',
      });
    }
    return this.unavailable();
  }

  private unavailable(): ServiceUnavailableException {
    return new ServiceUnavailableException({
      code: 'DATA_SERVICE_UNAVAILABLE',
      message: 'Não foi possível consultar os dados agora.',
    });
  }
}
