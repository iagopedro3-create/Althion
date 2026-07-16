import type { RadarAssessmentInput } from '@althion/contracts';
import {
  calculateAlthionScore,
  buildScoreRecommendations,
  RADAR_METRIC_CODES,
  type RadarMetricCode,
  type ScoreMetricInput,
} from '@althion/domain';
import { Injectable, NotFoundException } from '@nestjs/common';

import { escapeCsvCell } from './csv';
import { RadarRepository, type ScoreDetail } from './radar.repository';

const isRadarMetricCode = (value: string): value is RadarMetricCode =>
  RADAR_METRIC_CODES.some((code) => code === value);

@Injectable()
export class RadarService {
  public constructor(private readonly repository: RadarRepository) {}

  public listAssessments(accessToken: string, organizationId: string, clinicId: string) {
    return this.repository.listAssessments(accessToken, organizationId, clinicId);
  }

  public async getAssessment(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    assessmentId: string,
  ) {
    const assessment = await this.repository.getAssessment(
      accessToken,
      organizationId,
      clinicId,
      assessmentId,
    );
    if (!assessment) throw this.notFound();
    return assessment;
  }

  public createAssessment(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: RadarAssessmentInput,
    idempotencyKey: string,
    requestId: string,
  ) {
    return this.repository.createAssessment(
      accessToken,
      organizationId,
      clinicId,
      input,
      idempotencyKey,
      requestId,
    );
  }

  public replaceAssessment(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    assessmentId: string,
    input: RadarAssessmentInput,
    requestId: string,
  ) {
    return this.repository.replaceAssessment(
      accessToken,
      organizationId,
      clinicId,
      assessmentId,
      input,
      requestId,
    );
  }

  public submitAssessment(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    assessmentId: string,
    idempotencyKey: string,
    requestId: string,
  ) {
    return this.repository.submitAssessment(
      accessToken,
      organizationId,
      clinicId,
      assessmentId,
      idempotencyKey,
      requestId,
    );
  }

  public async previewAssessment(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    assessmentId: string,
  ) {
    const assessment = await this.getAssessment(
      accessToken,
      organizationId,
      clinicId,
      assessmentId,
    );
    const inputs = assessment.metrics.flatMap((metric): ScoreMetricInput[] => {
      if (!isRadarMetricCode(metric.metric_code)) return [];
      return [
        {
          code: metric.metric_code,
          denominator: metric.denominator,
          numerator: metric.numerator,
          quality: metric.quality,
          source: metric.source,
        },
      ];
    });
    const result = calculateAlthionScore(inputs);
    return { ...result, recommendations: buildScoreRecommendations(result) };
  }

  public listScores(accessToken: string, organizationId: string, clinicId: string) {
    return this.repository.listScores(accessToken, organizationId, clinicId);
  }

  public async getScore(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    scoreId: string,
  ): Promise<ScoreDetail> {
    const score = await this.repository.getScore(accessToken, organizationId, clinicId, scoreId);
    if (!score) throw this.notFound();
    return score;
  }

  public async compareScores(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    currentScoreId: string,
    previousScoreId: string,
  ) {
    const [current, previous] = await Promise.all([
      this.getScore(accessToken, organizationId, clinicId, currentScoreId),
      this.getScore(accessToken, organizationId, clinicId, previousScoreId),
    ]);
    const componentByDimension = new Map(
      previous.components.map((component) => [component.dimension, component]),
    );

    return {
      current: current.score,
      formulaChanged: current.formula.version !== previous.formula.version,
      periodComparable:
        this.periodDays(current.assessment.period_start, current.assessment.period_end) ===
        this.periodDays(previous.assessment.period_start, previous.assessment.period_end),
      previous: previous.score,
      componentChanges: current.components.map((component) => {
        const previousComponent = componentByDimension.get(component.dimension);
        return {
          current: component.score_value,
          delta:
            component.score_value !== null &&
            previousComponent !== undefined &&
            previousComponent.score_value !== null
              ? component.score_value - previousComponent.score_value
              : null,
          dimension: component.dimension,
          previous: previousComponent?.score_value ?? null,
        };
      }),
    };
  }

  public async exportAssessmentCsv(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    assessmentId: string,
    requestId: string,
  ): Promise<string> {
    const assessment = await this.getAssessment(
      accessToken,
      organizationId,
      clinicId,
      assessmentId,
    );
    const rows = [
      [
        'assessment_id',
        'period_start',
        'period_end',
        'metric_code',
        'numerator',
        'denominator',
        'source',
        'quality',
        'observation',
      ],
      ...assessment.metrics.map((metric) => [
        assessment.id,
        assessment.period_start,
        assessment.period_end,
        metric.metric_code,
        metric.numerator,
        metric.denominator,
        metric.source,
        metric.quality,
        metric.observation,
      ]),
    ];
    await this.repository.recordExport(
      accessToken,
      organizationId,
      clinicId,
      assessmentId,
      requestId,
    );
    return `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')}\r\n`;
  }

  private periodDays(start: string, end: string): number {
    return Math.floor(
      (new Date(`${end}T00:00:00Z`).getTime() - new Date(`${start}T00:00:00Z`).getTime()) /
        86_400_000 +
        1,
    );
  }

  private notFound(): NotFoundException {
    return new NotFoundException({
      code: 'RADAR_NOT_FOUND',
      message: 'Diagnóstico ou Score não encontrado.',
    });
  }
}
