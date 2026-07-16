import type {
  CreateRequestInput,
  Database,
  RequestListQuery,
  RequestTransitionInput,
} from '@althion/contracts';
import { BadRequestException, Injectable } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';
import { translatePortalError } from '../portal/portal-error';

type RequestRow = Database['public']['Tables']['requests']['Row'];
type HistoryRow = Database['public']['Tables']['request_status_history']['Row'];

export interface RequestDetail {
  readonly history: readonly HistoryRow[];
  readonly request: RequestRow;
}

@Injectable()
export class RequestsRepository {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async list(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    filters: RequestListQuery,
  ): Promise<{ items: readonly RequestRow[]; nextCursor: string | null }> {
    const client = this.clients.createUserScoped(accessToken);
    let cursorCreatedAt: string | null = null;
    if (filters.cursor) {
      const cursor = await client
        .from('requests')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .eq('id', filters.cursor)
        .maybeSingle();
      if (cursor.error) throw translatePortalError(cursor.error);
      if (!cursor.data) {
        throw new BadRequestException({
          code: 'PORTAL_CURSOR_INVALID',
          message: 'O cursor de paginação não pertence a esta clínica.',
        });
      }
      cursorCreatedAt = cursor.data.created_at;
    }

    let query = client
      .from('requests')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('clinic_id', clinicId);
    if (filters.category) query = query.eq('category', filters.category);
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
    if (result.error) throw translatePortalError(result.error);
    const hasNext = result.data.length > filters.limit;
    const items = result.data.slice(0, filters.limit);
    return { items, nextCursor: hasNext ? (items.at(-1)?.id ?? null) : null };
  }

  public async get(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    requestId: string,
  ): Promise<RequestDetail | null> {
    const client = this.clients.createUserScoped(accessToken);
    const [request, history] = await Promise.all([
      client
        .from('requests')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .eq('id', requestId)
        .maybeSingle(),
      client
        .from('request_status_history')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .eq('request_id', requestId)
        .order('changed_at'),
    ]);
    const error = request.error ?? history.error;
    if (error) throw translatePortalError(error);
    return request.data ? { history: history.data ?? [], request: request.data } : null;
  }

  public async create(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: CreateRequestInput,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients.createUserScoped(accessToken).rpc('create_portal_request', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_category: input.category,
      target_clinic_id: clinicId,
      target_details: input.details,
      target_organization_id: organizationId,
      target_priority: input.priority,
      target_subject: input.subject,
    });
    if (result.error) throw translatePortalError(result.error);
    return result.data;
  }

  public async transition(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    portalRequestId: string,
    input: RequestTransitionInput,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .rpc('transition_portal_request', {
        idempotency_key: idempotencyKey,
        request_id: requestId,
        target_clinic_id: clinicId,
        target_organization_id: organizationId,
        target_reason_code: input.reasonCode ?? null,
        target_request_id: portalRequestId,
        target_status: input.toStatus,
      });
    if (result.error) throw translatePortalError(result.error);
    return result.data;
  }
}
