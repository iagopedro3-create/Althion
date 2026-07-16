import {
  organizationClinicParamsSchema,
  radarAssessmentInputSchema,
  radarAssessmentParamsSchema,
  scoreComparisonQuerySchema,
  scoreParamsSchema,
  type RadarAssessmentInput,
  type ScoreComparisonQuery,
} from '@althion/contracts';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { z } from 'zod';

import { CurrentAccessToken } from '../../common/auth/current-access-token.decorator';
import { RequireCapability } from '../../common/auth/require-capability.decorator';
import { CurrentRequestId } from '../../common/http/current-request-id.decorator';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { RadarService } from './radar.service';

const idempotencyKeySchema = z.string().trim().min(16).max(200);

@Controller('api/v1/organizations/:organizationId/clinics/:clinicId')
export class RadarController {
  public constructor(private readonly radar: RadarService) {}

  @Get('radar-assessments')
  @RequireCapability('radar:read')
  public listAssessments(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(organizationClinicParamsSchema))
    params: z.infer<typeof organizationClinicParamsSchema>,
  ) {
    return this.radar.listAssessments(token, params.organizationId, params.clinicId);
  }

  @Post('radar-assessments')
  @RequireCapability('radar:write')
  public async createAssessment(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(organizationClinicParamsSchema))
    params: z.infer<typeof organizationClinicParamsSchema>,
    @Body(new ZodValidationPipe(radarAssessmentInputSchema)) input: RadarAssessmentInput,
  ): Promise<{ id: string; status: 'draft' }> {
    const id = await this.radar.createAssessment(
      token,
      params.organizationId,
      params.clinicId,
      input,
      this.parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { id, status: 'draft' };
  }

  @Get('radar-assessments/:assessmentId')
  @RequireCapability('radar:read')
  public getAssessment(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(radarAssessmentParamsSchema))
    params: z.infer<typeof radarAssessmentParamsSchema>,
  ) {
    return this.radar.getAssessment(
      token,
      params.organizationId,
      params.clinicId,
      params.assessmentId,
    );
  }

  @Patch('radar-assessments/:assessmentId')
  @RequireCapability('radar:write')
  public async replaceAssessment(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Param(new ZodValidationPipe(radarAssessmentParamsSchema))
    params: z.infer<typeof radarAssessmentParamsSchema>,
    @Body(new ZodValidationPipe(radarAssessmentInputSchema)) input: RadarAssessmentInput,
  ): Promise<{ id: string; status: 'draft' }> {
    await this.radar.replaceAssessment(
      token,
      params.organizationId,
      params.clinicId,
      params.assessmentId,
      input,
      requestId,
    );
    return { id: params.assessmentId, status: 'draft' };
  }

  @Post('radar-assessments/:assessmentId/calculate')
  @RequireCapability('score:calculate')
  public previewAssessment(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(radarAssessmentParamsSchema))
    params: z.infer<typeof radarAssessmentParamsSchema>,
  ) {
    return this.radar.previewAssessment(
      token,
      params.organizationId,
      params.clinicId,
      params.assessmentId,
    );
  }

  @Post('radar-assessments/:assessmentId/submit')
  @RequireCapability('radar:submit')
  public async submitAssessment(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Param(new ZodValidationPipe(radarAssessmentParamsSchema))
    params: z.infer<typeof radarAssessmentParamsSchema>,
  ): Promise<{ scoreId: string; status: 'submitted' }> {
    const scoreId = await this.radar.submitAssessment(
      token,
      params.organizationId,
      params.clinicId,
      params.assessmentId,
      this.parseIdempotencyKey(idempotencyKey),
      requestId,
    );
    return { scoreId, status: 'submitted' };
  }

  @Get('radar-assessments/:assessmentId/export.csv')
  @RequireCapability('radar_report:export')
  public async exportAssessment(
    @CurrentAccessToken() token: string,
    @CurrentRequestId() requestId: string,
    @Param(new ZodValidationPipe(radarAssessmentParamsSchema))
    params: z.infer<typeof radarAssessmentParamsSchema>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const csv = await this.radar.exportAssessmentCsv(
      token,
      params.organizationId,
      params.clinicId,
      params.assessmentId,
      requestId,
    );
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="althion-radar-${params.assessmentId}.csv"`,
    );
    response.setHeader('Cache-Control', 'private, no-store');
    return csv;
  }

  @Get('scores')
  @RequireCapability('score:read')
  public listScores(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(organizationClinicParamsSchema))
    params: z.infer<typeof organizationClinicParamsSchema>,
  ) {
    return this.radar.listScores(token, params.organizationId, params.clinicId);
  }

  @Get('scores/:scoreId')
  @RequireCapability('score:read')
  public getScore(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(scoreParamsSchema))
    params: z.infer<typeof scoreParamsSchema>,
  ) {
    return this.radar.getScore(token, params.organizationId, params.clinicId, params.scoreId);
  }

  @Get('score-comparisons')
  @RequireCapability('score:read')
  public compareScores(
    @CurrentAccessToken() token: string,
    @Param(new ZodValidationPipe(organizationClinicParamsSchema))
    params: z.infer<typeof organizationClinicParamsSchema>,
    @Query(new ZodValidationPipe(scoreComparisonQuerySchema)) query: ScoreComparisonQuery,
  ) {
    return this.radar.compareScores(
      token,
      params.organizationId,
      params.clinicId,
      query.currentScoreId,
      query.previousScoreId,
    );
  }

  private parseIdempotencyKey(value: string | undefined): string {
    const result = idempotencyKeySchema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Informe uma chave de idempotência válida.',
      });
    }
    return result.data;
  }
}
