import type { Database } from '@althion/contracts';
import type { IncidentSeverity, IncidentStatus, MeetingStatus } from '@althion/domain';
import { BadRequestException, Injectable } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';
import { translateCockpitError } from './cockpit-error';

type AssignmentRow = Database['public']['Tables']['relationship_assignments']['Row'];
type SpecialistRow = Database['public']['Tables']['relationship_specialists']['Row'];
type OrganizationRow = Database['public']['Tables']['organizations']['Row'];
type ClinicRow = Database['public']['Tables']['clinics']['Row'];
type ScoreRow = Database['public']['Tables']['althion_scores']['Row'];
type RequestRow = Database['public']['Tables']['requests']['Row'];
type PlanRow = Database['public']['Tables']['improvement_plans']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type IncidentRow = Database['public']['Tables']['account_incidents']['Row'];
type MeetingRow = Database['public']['Tables']['account_meetings']['Row'];

export interface PortfolioRows {
  readonly assignments: readonly AssignmentRow[];
  readonly clinics: readonly ClinicRow[];
  readonly organizations: readonly OrganizationRow[];
  readonly specialist: SpecialistRow | null;
}

export interface AccountStateRows {
  readonly incidents: readonly IncidentRow[];
  readonly meetings: readonly MeetingRow[];
  readonly plans: readonly PlanRow[];
  readonly requests: readonly RequestRow[];
  readonly scores: readonly ScoreRow[];
  readonly tasks: readonly TaskRow[];
}

@Injectable()
export class CockpitRepository {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async getPortfolio(accessToken: string): Promise<PortfolioRows> {
    const client = this.clients.createUserScoped(accessToken);
    const [specialist, assignments] = await Promise.all([
      client.from('relationship_specialists').select('*').maybeSingle(),
      client
        .from('relationship_assignments')
        .select('*')
        .eq('status', 'active')
        .order('starts_at', { ascending: true }),
    ]);
    if (specialist.error) throw translateCockpitError(specialist.error);
    if (assignments.error) throw translateCockpitError(assignments.error);

    const assignmentRows = assignments.data ?? [];
    const organizationIds = [...new Set(assignmentRows.map((row) => row.organization_id))];
    if (!organizationIds.length) {
      return {
        assignments: assignmentRows,
        clinics: [],
        organizations: [],
        specialist: specialist.data ?? null,
      };
    }

    const [organizations, clinics] = await Promise.all([
      client.from('organizations').select('*').in('id', organizationIds).order('name'),
      client.from('clinics').select('*').in('organization_id', organizationIds).order('name'),
    ]);
    if (organizations.error) throw translateCockpitError(organizations.error);
    if (clinics.error) throw translateCockpitError(clinics.error);

    return {
      assignments: assignmentRows,
      clinics: clinics.data ?? [],
      organizations: organizations.data ?? [],
      specialist: specialist.data ?? null,
    };
  }

  public async getAccountState(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<AccountStateRows> {
    const client = this.clients.createUserScoped(accessToken);
    const [scores, requests, plans, incidents, meetings] = await Promise.all([
      client
        .from('althion_scores')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .order('calculated_at', { ascending: false })
        .limit(12),
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
        .limit(10),
      client
        .from('account_incidents')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(50),
      client
        .from('account_meetings')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .order('scheduled_at', { ascending: false })
        .limit(50),
    ]);
    const error =
      scores.error ?? requests.error ?? plans.error ?? incidents.error ?? meetings.error;
    if (error) throw translateCockpitError(error);

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
    if (tasks.error) throw translateCockpitError(tasks.error);

    return {
      incidents: incidents.data ?? [],
      meetings: meetings.data ?? [],
      plans: planRows,
      requests: requests.data ?? [],
      scores: scores.data ?? [],
      tasks: tasks.data ?? [],
    };
  }

  public async listIncidents(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    filters: {
      cursor?: string | undefined;
      limit: number;
      severity?: IncidentSeverity | undefined;
      status?: IncidentStatus | undefined;
    },
  ): Promise<{ items: readonly IncidentRow[]; nextCursor: string | null }> {
    const client = this.clients.createUserScoped(accessToken);
    let cursorCreatedAt: string | null = null;
    if (filters.cursor) {
      const cursor = await client
        .from('account_incidents')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .eq('id', filters.cursor)
        .maybeSingle();
      if (cursor.error) throw translateCockpitError(cursor.error);
      if (!cursor.data) {
        throw new BadRequestException({
          code: 'COCKPIT_CURSOR_INVALID',
          message: 'O cursor de paginação não pertence a esta clínica.',
        });
      }
      cursorCreatedAt = cursor.data.created_at;
    }

    let query = client
      .from('account_incidents')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('clinic_id', clinicId);
    if (filters.severity) query = query.eq('severity', filters.severity);
    if (filters.status) query = query.eq('status', filters.status);
    if (cursorCreatedAt && filters.cursor) {
      query = query.or(
        `created_at.lt.${cursorCreatedAt},and(created_at.eq.${cursorCreatedAt},id.lt.${filters.cursor})`,
      );
    }

    const result = await query
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(filters.limit + 1);
    if (result.error) throw translateCockpitError(result.error);
    const hasNext = result.data.length > filters.limit;
    const items = result.data.slice(0, filters.limit);
    return { items, nextCursor: hasNext ? (items.at(-1)?.id ?? null) : null };
  }

  public async listMeetings(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    filters: { cursor?: string | undefined; limit: number; status?: MeetingStatus | undefined },
  ): Promise<{ items: readonly MeetingRow[]; nextCursor: string | null }> {
    const client = this.clients.createUserScoped(accessToken);
    let cursorScheduledAt: string | null = null;
    if (filters.cursor) {
      const cursor = await client
        .from('account_meetings')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .eq('id', filters.cursor)
        .maybeSingle();
      if (cursor.error) throw translateCockpitError(cursor.error);
      if (!cursor.data) {
        throw new BadRequestException({
          code: 'COCKPIT_CURSOR_INVALID',
          message: 'O cursor de paginação não pertence a esta clínica.',
        });
      }
      cursorScheduledAt = cursor.data.scheduled_at;
    }

    let query = client
      .from('account_meetings')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('clinic_id', clinicId);
    if (filters.status) query = query.eq('status', filters.status);
    if (cursorScheduledAt && filters.cursor) {
      query = query.or(
        `scheduled_at.lt.${cursorScheduledAt},and(scheduled_at.eq.${cursorScheduledAt},id.lt.${filters.cursor})`,
      );
    }

    const result = await query
      .order('scheduled_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(filters.limit + 1);
    if (result.error) throw translateCockpitError(result.error);
    const hasNext = result.data.length > filters.limit;
    const items = result.data.slice(0, filters.limit);
    return { items, nextCursor: hasNext ? (items.at(-1)?.id ?? null) : null };
  }

  public async createIncident(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: { category: string; details: string; severity: string; subject: string },
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients.createUserScoped(accessToken).rpc('create_account_incident', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_category: input.category,
      target_clinic_id: clinicId,
      target_details: input.details,
      target_organization_id: organizationId,
      target_severity: input.severity,
      target_subject: input.subject,
    });
    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }

  public async transitionIncident(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    incidentId: string,
    input: { reasonCode?: string | undefined; toStatus: string },
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .rpc('transition_account_incident', {
        idempotency_key: idempotencyKey,
        request_id: requestId,
        target_clinic_id: clinicId,
        target_incident_id: incidentId,
        target_organization_id: organizationId,
        target_reason_code: input.reasonCode ?? null,
        target_status: input.toStatus,
      });
    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }

  public async createMeeting(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: { purpose: string; scheduledAt: string; summary?: string | null | undefined },
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients.createUserScoped(accessToken).rpc('create_account_meeting', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_clinic_id: clinicId,
      target_organization_id: organizationId,
      target_purpose: input.purpose,
      target_scheduled_at: input.scheduledAt,
      target_summary: input.summary ?? null,
    });
    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }

  public async transitionMeeting(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    meetingId: string,
    input: {
      reasonCode?: string | undefined;
      summary?: string | null | undefined;
      toStatus: string;
    },
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .rpc('transition_account_meeting', {
        idempotency_key: idempotencyKey,
        request_id: requestId,
        target_clinic_id: clinicId,
        target_meeting_id: meetingId,
        target_organization_id: organizationId,
        target_reason_code: input.reasonCode ?? null,
        target_status: input.toStatus,
        target_summary: input.summary ?? null,
      });
    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }
}
