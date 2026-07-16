import type {
  CreateImprovementPlanInput,
  CreateTaskInput,
  Database,
  ImprovementPlanTransitionInput,
  TaskTransitionInput,
} from '@althion/contracts';
import { Injectable } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';
import { translatePortalError } from '../portal/portal-error';

type PlanRow = Database['public']['Tables']['improvement_plans']['Row'];
type PlanHistoryRow = Database['public']['Tables']['improvement_plan_status_history']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type TaskHistoryRow = Database['public']['Tables']['task_status_history']['Row'];

export interface ImprovementPlanDetail {
  readonly history: readonly PlanHistoryRow[];
  readonly plan: PlanRow;
  readonly taskHistory: readonly TaskHistoryRow[];
  readonly tasks: readonly TaskRow[];
}

@Injectable()
export class ImprovementPlansRepository {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async getCurrent(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<ImprovementPlanDetail | null> {
    const client = this.clients.createUserScoped(accessToken);
    const plans = await client
      .from('improvement_plans')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('clinic_id', clinicId)
      .neq('status', 'archived')
      .order('version', { ascending: false })
      .limit(20);
    if (plans.error) throw translatePortalError(plans.error);
    const plan =
      plans.data.find((candidate) => candidate.status === 'active') ??
      plans.data.find((candidate) => candidate.status === 'draft') ??
      plans.data[0] ??
      null;
    if (!plan) return null;

    const [tasks, history] = await Promise.all([
      client
        .from('tasks')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .eq('improvement_plan_id', plan.id)
        .order('due_at', { ascending: true, nullsFirst: false })
        .order('created_at'),
      client
        .from('improvement_plan_status_history')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .eq('improvement_plan_id', plan.id)
        .order('changed_at'),
    ]);
    const error = tasks.error ?? history.error;
    if (error) throw translatePortalError(error);

    const taskRows = tasks.data ?? [];
    const taskIds = taskRows.map((task) => task.id);
    const taskHistory = taskIds.length
      ? await client
          .from('task_status_history')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('clinic_id', clinicId)
          .in('task_id', taskIds)
          .order('changed_at')
      : { data: [], error: null };
    if (taskHistory.error) throw translatePortalError(taskHistory.error);

    return {
      history: history.data ?? [],
      plan,
      taskHistory: taskHistory.data ?? [],
      tasks: taskRows,
    };
  }

  public async createPlan(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: CreateImprovementPlanInput,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients.createUserScoped(accessToken).rpc('create_improvement_plan', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_clinic_id: clinicId,
      target_organization_id: organizationId,
      target_period_end: input.periodEnd ?? null,
      target_period_start: input.periodStart ?? null,
      target_source_score_id: input.sourceScoreId ?? null,
      target_title: input.title,
    });
    if (result.error) throw translatePortalError(result.error);
    return result.data;
  }

  public async transitionPlan(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    planId: string,
    input: ImprovementPlanTransitionInput,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .rpc('transition_improvement_plan', {
        idempotency_key: idempotencyKey,
        request_id: requestId,
        target_clinic_id: clinicId,
        target_organization_id: organizationId,
        target_plan_id: planId,
        target_reason_code: input.reasonCode ?? null,
        target_status: input.toStatus,
      });
    if (result.error) throw translatePortalError(result.error);
    return result.data;
  }

  public async createTask(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    planId: string,
    input: CreateTaskInput,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients.createUserScoped(accessToken).rpc('create_portal_task', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_assignee_profile_id: input.assigneeProfileId ?? null,
      target_clinic_id: clinicId,
      target_due_at: input.dueAt ?? null,
      target_organization_id: organizationId,
      target_plan_id: planId,
      target_priority: input.priority,
      target_radar_recommendation_id: input.radarRecommendationId ?? null,
      target_title: input.title,
    });
    if (result.error) throw translatePortalError(result.error);
    return result.data;
  }

  public async transitionTask(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    taskId: string,
    input: TaskTransitionInput,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients.createUserScoped(accessToken).rpc('transition_portal_task', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_clinic_id: clinicId,
      target_organization_id: organizationId,
      target_reason_code: input.reasonCode ?? null,
      target_status: input.toStatus,
      target_task_id: taskId,
    });
    if (result.error) throw translatePortalError(result.error);
    return result.data;
  }
}
