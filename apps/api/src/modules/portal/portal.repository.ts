import type { Database } from '@althion/contracts';
import { Injectable } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';
import { translatePortalError } from './portal-error';

type ScoreRow = Database['public']['Tables']['althion_scores']['Row'];
type RequestRow = Database['public']['Tables']['requests']['Row'];
type PlanRow = Database['public']['Tables']['improvement_plans']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type IntegrationRow = Database['public']['Tables']['integrations']['Row'];
type SpecialistRow = Database['public']['Functions']['get_portal_specialist']['Returns'][number];
type PersonRow = Database['public']['Functions']['get_portal_people']['Returns'][number];

export interface PortalStateRows {
  readonly integrations: readonly IntegrationRow[];
  readonly plans: readonly PlanRow[];
  readonly requests: readonly RequestRow[];
  readonly scores: readonly ScoreRow[];
  readonly specialist: SpecialistRow | null;
  readonly tasks: readonly TaskRow[];
}

@Injectable()
export class PortalRepository {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async getState(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<PortalStateRows> {
    const client = this.clients.createUserScoped(accessToken);
    const [scores, requests, plans, integrations, specialist] = await Promise.all([
      client
        .from('althion_scores')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .order('calculated_at', { ascending: false })
        .limit(24),
      client
        .from('requests')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(100),
      client
        .from('improvement_plans')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .neq('status', 'archived')
        .order('version', { ascending: false })
        .limit(20),
      client
        .from('integrations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('provider'),
      client.rpc('get_portal_specialist', {
        target_clinic_id: clinicId,
        target_organization_id: organizationId,
      }),
    ]);
    const error =
      scores.error ?? requests.error ?? plans.error ?? integrations.error ?? specialist.error;
    if (error) throw translatePortalError(error);

    const planRows = plans.data ?? [];
    const planIds = planRows.map((plan) => plan.id);
    const tasks = planIds.length
      ? await client
          .from('tasks')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('clinic_id', clinicId)
          .in('improvement_plan_id', planIds)
          .order('due_at', { ascending: true, nullsFirst: false })
      : { data: [], error: null };
    if (tasks.error) throw translatePortalError(tasks.error);

    return {
      integrations: integrations.data ?? [],
      plans: planRows,
      requests: requests.data ?? [],
      scores: scores.data ?? [],
      specialist: (specialist.data ?? [])[0] ?? null,
      tasks: tasks.data ?? [],
    };
  }

  public async listPeople(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<readonly PersonRow[]> {
    const result = await this.clients.createUserScoped(accessToken).rpc('get_portal_people', {
      target_clinic_id: clinicId,
      target_organization_id: organizationId,
    });
    if (result.error) throw translatePortalError(result.error);
    return result.data ?? [];
  }
}
