import {
  COCKPIT_POLICY_VERSION,
  deriveNextBestActions,
  evaluateAccountHealth,
  evaluateIncidentSla,
  evaluatePortfolioCapacity,
  evaluateRequestSla,
  isPlatformAdmin,
  summarizeRequestSla,
  type AccountSignals,
  type Principal,
} from '@althion/domain';
import { ForbiddenException, Injectable } from '@nestjs/common';

import { CockpitFeatureService } from './cockpit-feature.service';
import { CockpitRepository, type AccountStateRows } from './cockpit.repository';

const OPEN_REQUEST_STATUSES = new Set(['open', 'acknowledged', 'in_progress', 'waiting_customer']);
const OPEN_INCIDENT_STATUSES = new Set(['open', 'investigating', 'mitigated']);
const HEALTH_ORDER = { attention: 1, critical: 0, healthy: 2 } as const;
const MAX_PORTFOLIO_ACCOUNTS = 20;

@Injectable()
export class CockpitService {
  public constructor(
    private readonly feature: CockpitFeatureService,
    private readonly cockpit: CockpitRepository,
  ) {}

  public async getPortfolio(accessToken: string, principal: Principal) {
    await this.feature.ensureEnabled(accessToken);
    this.ensureCockpitPrincipal(principal);

    const portfolio = await this.cockpit.getPortfolio(accessToken);
    const organizationsById = new Map(portfolio.organizations.map((row) => [row.id, row]));
    const accounts = portfolio.assignments.flatMap((assignment) => {
      const clinics = portfolio.clinics.filter(
        (clinic) =>
          clinic.organization_id === assignment.organization_id &&
          (assignment.clinic_id === null || clinic.id === assignment.clinic_id),
      );
      return clinics.map((clinic) => ({
        assignmentStartsAt: assignment.starts_at,
        clinicId: clinic.id,
        clinicName: clinic.name,
        complexity: assignment.complexity,
        organizationId: assignment.organization_id,
        organizationName: organizationsById.get(assignment.organization_id)?.name ?? null,
      }));
    });

    const now = new Date();
    const evaluated = await Promise.all(
      accounts.slice(0, MAX_PORTFOLIO_ACCOUNTS).map(async (account) => {
        const state = await this.cockpit.getAccountState(
          accessToken,
          account.organizationId,
          account.clinicId,
        );
        const signals = this.toSignals(state);
        const health = evaluateAccountHealth(signals, now);
        const sla = summarizeRequestSla(signals, now);
        const nextAction = deriveNextBestActions(signals, now, 1)[0] ?? null;
        return {
          ...account,
          health: { reasons: health.reasons, state: health.state },
          nextBestAction: nextAction,
          openIncidents: state.incidents.filter((incident) =>
            OPEN_INCIDENT_STATUSES.has(incident.status),
          ).length,
          scoreValue: signals.score?.scoreValue ?? null,
          slaAtRisk: sla.atRisk,
          slaBreached: sla.breached,
        };
      }),
    );

    evaluated.sort(
      (left, right) =>
        HEALTH_ORDER[left.health.state] - HEALTH_ORDER[right.health.state] ||
        (left.clinicName ?? '').localeCompare(right.clinicName ?? '', 'pt-BR'),
    );

    return {
      accounts: evaluated,
      capacity: portfolio.specialist
        ? {
            availability: 'available' as const,
            ...evaluatePortfolioCapacity(
              portfolio.assignments.map((assignment) => ({
                complexity: assignment.complexity,
                status: 'active' as const,
              })),
              portfolio.specialist.capacity_limit,
            ),
          }
        : { availability: 'not_assigned' as const },
      generatedAt: now.toISOString(),
      policyVersion: COCKPIT_POLICY_VERSION,
      truncated: accounts.length > MAX_PORTFOLIO_ACCOUNTS,
    };
  }

  public async getAccount(accessToken: string, organizationId: string, clinicId: string) {
    await this.feature.ensureEnabled(accessToken);
    const state = await this.cockpit.getAccountState(accessToken, organizationId, clinicId);
    const signals = this.toSignals(state);
    const now = new Date();
    const health = evaluateAccountHealth(signals, now);
    const latestScore = state.scores[0] ?? null;
    const currentPlan =
      state.plans.find((plan) => plan.status === 'active') ??
      state.plans.find((plan) => plan.status === 'draft') ??
      null;

    return {
      clinicId,
      generatedAt: now.toISOString(),
      health: { reasons: health.reasons, state: health.state },
      incidents: state.incidents.map((incident) => ({
        acknowledgedAt: incident.acknowledged_at,
        category: incident.category,
        createdAt: incident.created_at,
        id: incident.id,
        resolvedAt: incident.resolved_at,
        severity: incident.severity,
        sla: OPEN_INCIDENT_STATUSES.has(incident.status)
          ? evaluateIncidentSla(
              {
                acknowledgedAt: incident.acknowledged_at,
                createdAt: incident.created_at,
                resolvedAt: incident.resolved_at,
                severity: incident.severity,
                status: incident.status,
              },
              now,
            )
          : null,
        status: incident.status,
        subject: incident.subject,
      })),
      meetings: state.meetings.map((meeting) => ({
        completedAt: meeting.completed_at,
        id: meeting.id,
        purpose: meeting.purpose,
        scheduledAt: meeting.scheduled_at,
        status: meeting.status,
        summary: meeting.summary,
      })),
      nextBestActions: deriveNextBestActions(signals, now, 5),
      organizationId,
      plan: currentPlan
        ? {
            id: currentPlan.id,
            overdueTasks: state.tasks.filter(
              (task) =>
                task.improvement_plan_id === currentPlan.id &&
                task.due_at !== null &&
                new Date(task.due_at).getTime() < now.getTime() &&
                !['completed', 'cancelled'].includes(task.status),
            ).length,
            status: currentPlan.status,
            title: currentPlan.title,
            version: currentPlan.version,
          }
        : null,
      policyVersion: COCKPIT_POLICY_VERSION,
      requests: state.requests
        .filter((request) => OPEN_REQUEST_STATUSES.has(request.status))
        .map((request) => ({
          createdAt: request.created_at,
          id: request.id,
          priority: request.priority,
          sla: evaluateRequestSla(
            {
              acknowledgedAt: request.acknowledged_at,
              createdAt: request.created_at,
              priority: request.priority,
              resolvedAt: request.resolved_at,
              status: request.status,
              waitingCustomerSince:
                request.status === 'waiting_customer' ? request.updated_at : null,
            },
            now,
          ),
          status: request.status,
          subject: request.subject,
        })),
      score: latestScore
        ? {
            availability:
              latestScore.status === 'calculated'
                ? ('available' as const)
                : ('insufficient_data' as const),
            calculatedAt: latestScore.calculated_at,
            coverage: latestScore.coverage,
            id: latestScore.id,
            scoreValue: latestScore.score_value,
            status: latestScore.status,
          }
        : { availability: 'insufficient_data' as const },
    };
  }

  private ensureCockpitPrincipal(principal: Principal): void {
    const hasActiveAssignment = principal.assignments.some(
      (assignment) => assignment.status === 'active',
    );
    if (!isPlatformAdmin(principal) && !hasActiveAssignment) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'O Cockpit é exclusivo do Especialista de Relacionamento.',
      });
    }
  }

  private toSignals(state: AccountStateRows): AccountSignals {
    const latestScore = state.scores[0] ?? null;
    return {
      incidents: state.incidents.map((incident) => ({
        acknowledgedAt: incident.acknowledged_at,
        createdAt: incident.created_at,
        resolvedAt: incident.resolved_at,
        severity: incident.severity,
        status: incident.status,
      })),
      meetings: state.meetings.map((meeting) => ({
        completedAt: meeting.completed_at,
        status: meeting.status,
      })),
      plans: state.plans.map((plan) => ({ status: plan.status })),
      requests: state.requests.map((request) => ({
        acknowledgedAt: request.acknowledged_at,
        createdAt: request.created_at,
        priority: request.priority,
        resolvedAt: request.resolved_at,
        status: request.status,
        // Aproximação v1: o relógio congela na última atualização em waiting_customer.
        waitingCustomerSince: request.status === 'waiting_customer' ? request.updated_at : null,
      })),
      score: latestScore
        ? {
            calculatedAt: latestScore.calculated_at,
            scoreValue: latestScore.score_value,
            status: latestScore.status,
          }
        : null,
      tasks: state.tasks.map((task) => ({ dueAt: task.due_at, status: task.status })),
    };
  }
}
