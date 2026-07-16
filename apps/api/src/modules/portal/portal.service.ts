import {
  calculatePlanProgress,
  prioritizePortalOpportunities,
  type PortalAvailabilityState,
} from '@althion/domain';
import { Injectable } from '@nestjs/common';

import { RadarRepository, type ScoreDetail } from '../radar/radar.repository';
import { PortalFeatureService } from './portal-feature.service';
import { PortalRepository, type PortalStateRows } from './portal.repository';

const OPEN_REQUEST_STATUSES = new Set(['open', 'acknowledged', 'in_progress', 'waiting_customer']);

@Injectable()
export class PortalService {
  public constructor(
    private readonly feature: PortalFeatureService,
    private readonly portal: PortalRepository,
    private readonly radar: RadarRepository,
  ) {}

  public async getDashboard(accessToken: string, organizationId: string, clinicId: string) {
    await this.feature.ensureEnabled(accessToken, organizationId);
    const state = await this.portal.getState(accessToken, organizationId, clinicId);
    const detail = await this.latestScoreDetail(accessToken, organizationId, clinicId, state);
    const currentPlan = this.currentPlan(state);
    const planTasks = currentPlan
      ? state.tasks.filter((task) => task.improvement_plan_id === currentPlan.id)
      : [];
    const now = Date.now();
    const openRequests = state.requests.filter((request) =>
      OPEN_REQUEST_STATUSES.has(request.status),
    );
    const recommendationsById = new Map(
      detail?.recommendations.map((item) => [item.id, item] as const) ?? [],
    );
    const opportunities = detail
      ? prioritizePortalOpportunities(
          detail.recommendations.map((item) => ({
            id: item.id,
            priority: item.priority,
            sourceType: 'radar_recommendation' as const,
            title: item.title,
          })),
          3,
        ).flatMap((item) => {
          const recommendation = recommendationsById.get(item.id);
          if (!recommendation) return [];
          return {
            dimension: recommendation.dimension,
            evidenceMetricCode: recommendation.evidence_metric_code,
            id: recommendation.id,
            priority: recommendation.priority,
            rationale: recommendation.rationale,
            sourceType: 'radar_recommendation' as const,
            title: recommendation.title,
          };
        })
      : [];

    return {
      clinicId,
      generatedAt: new Date().toISOString(),
      integrations: state.integrations.map((integration) => ({
        availability: this.integrationAvailability(integration.status, integration.last_success_at),
        lastErrorCode: integration.last_error_code,
        lastSuccessAt: integration.last_success_at,
        provider: integration.provider,
        status: integration.status,
      })),
      opportunities,
      organizationId,
      plan: currentPlan
        ? {
            completedTasks: planTasks.filter((task) => task.status === 'completed').length,
            dueTasks: planTasks.filter(
              (task) =>
                task.due_at !== null &&
                new Date(task.due_at).getTime() < now &&
                !['completed', 'cancelled'].includes(task.status),
            ).length,
            id: currentPlan.id,
            progress: calculatePlanProgress(planTasks),
            status: currentPlan.status,
            title: currentPlan.title,
            totalTasks: planTasks.filter((task) => task.status !== 'cancelled').length,
            version: currentPlan.version,
          }
        : null,
      requests: {
        highPriorityOpen: openRequests.filter((request) =>
          ['high', 'urgent'].includes(request.priority),
        ).length,
        open: openRequests.length,
        totalVisible: state.requests.length,
      },
      score: this.scoreSummary(detail),
      sources: [
        {
          availability: 'source_blocked',
          key: 'leads',
          label: 'Leads e conversas',
          source: 'helena',
        },
        { availability: 'source_not_configured', key: 'agenda', label: 'Agenda', source: null },
        {
          availability: 'module_not_available',
          key: 'recovery',
          label: 'Recuperação executada',
          source: 'althion',
        },
        {
          availability: 'module_not_available',
          key: 'quality',
          label: 'Qualidade e IA',
          source: 'althion',
        },
      ],
      specialist: state.specialist
        ? { availability: 'available', ...state.specialist }
        : { availability: 'not_assigned' },
      trend: state.scores
        .filter((score) => score.status === 'calculated' && score.score_value !== null)
        .map((score) => ({
          calculatedAt: score.calculated_at,
          coverage: score.coverage,
          id: score.id,
          scoreValue: score.score_value,
        }))
        .reverse(),
    };
  }

  public async getIndicators(accessToken: string, organizationId: string, clinicId: string) {
    await this.feature.ensureEnabled(accessToken, organizationId);
    const state = await this.portal.getState(accessToken, organizationId, clinicId);
    const detail = await this.latestScoreDetail(accessToken, organizationId, clinicId, state);
    return {
      availability: detail
        ? detail.score.status === 'calculated'
          ? 'available'
          : 'insufficient_data'
        : 'source_not_configured',
      history: state.scores.map((score) => ({
        calculatedAt: score.calculated_at,
        coverage: score.coverage,
        id: score.id,
        scoreValue: score.score_value,
        status: score.status,
      })),
      latest: detail
        ? {
            components: detail.components,
            evidence: detail.evidence,
            formula: {
              status: detail.formula.status,
              version: detail.formula.version,
            },
            periodEnd: detail.assessment.period_end,
            periodStart: detail.assessment.period_start,
            score: detail.score,
          }
        : null,
    };
  }

  public async getOpportunities(accessToken: string, organizationId: string, clinicId: string) {
    await this.feature.ensureEnabled(accessToken, organizationId);
    const state = await this.portal.getState(accessToken, organizationId, clinicId);
    const detail = await this.latestScoreDetail(accessToken, organizationId, clinicId, state);
    return {
      availability: detail ? 'available' : 'source_not_configured',
      items: detail
        ? detail.recommendations.map((item) => ({
            ...item,
            sourceType: 'radar_recommendation' as const,
          }))
        : [],
      scoreId: detail?.score.id ?? null,
    };
  }

  public async getSpecialist(accessToken: string, organizationId: string, clinicId: string) {
    await this.feature.ensureEnabled(accessToken, organizationId);
    const state = await this.portal.getState(accessToken, organizationId, clinicId);
    return state.specialist
      ? { availability: 'available', ...state.specialist }
      : { availability: 'not_assigned' };
  }

  public async listPeople(accessToken: string, organizationId: string, clinicId: string) {
    await this.feature.ensureEnabled(accessToken, organizationId);
    return this.portal.listPeople(accessToken, organizationId, clinicId);
  }

  private async latestScoreDetail(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    state: PortalStateRows,
  ): Promise<ScoreDetail | null> {
    const latest = state.scores[0];
    return latest
      ? this.radar.getScore(accessToken, organizationId, clinicId, latest.id)
      : Promise.resolve(null);
  }

  private currentPlan(state: PortalStateRows) {
    return (
      state.plans.find((plan) => plan.status === 'active') ??
      state.plans.find((plan) => plan.status === 'draft') ??
      state.plans[0] ??
      null
    );
  }

  private scoreSummary(detail: ScoreDetail | null) {
    if (!detail) return { availability: 'source_not_configured' as PortalAvailabilityState };
    return {
      availability: (detail.score.status === 'calculated'
        ? 'available'
        : 'insufficient_data') as PortalAvailabilityState,
      calculatedAt: detail.score.calculated_at,
      coverage: detail.score.coverage,
      formulaStatus: detail.formula.status,
      formulaVersion: detail.formula.version,
      id: detail.score.id,
      periodEnd: detail.assessment.period_end,
      periodStart: detail.assessment.period_start,
      scoreValue: detail.score.score_value,
      status: detail.score.status,
    };
  }

  private integrationAvailability(status: string, lastSuccessAt: string | null) {
    if (status === 'blocked') return 'source_blocked';
    if (status === 'disabled') return 'source_not_configured';
    if (
      status === 'active' &&
      (!lastSuccessAt || Date.now() - new Date(lastSuccessAt).getTime() > 86_400_000)
    ) {
      return 'stale';
    }
    return status === 'active' ? 'available' : 'source_not_configured';
  }
}
