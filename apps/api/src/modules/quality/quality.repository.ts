import type {
  Database,
  CreateEvaluationInput,
  CreateClinicalFlagInput,
  ResolveClinicalFlagInput,
} from '@althion/contracts';
import { Injectable } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';
import { translateCockpitError } from '../cockpit/cockpit-error';

type RubricRow = Database['public']['Tables']['quality_rubrics']['Row'];
type EvaluationRow = Database['public']['Tables']['quality_evaluations']['Row'];
type ClinicalFlagRow = Database['public']['Tables']['quality_clinical_flags']['Row'];

@Injectable()
export class QualityRepository {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async listRubrics(accessToken: string): Promise<readonly RubricRow[]> {
    const client = this.clients.createUserScoped(accessToken);
    const { data, error } = await client
      .from('quality_rubrics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw translateCockpitError(error);
    return data ?? [];
  }

  public async listEvaluations(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<readonly EvaluationRow[]> {
    const client = this.clients.createUserScoped(accessToken);
    const { data, error } = await client
      .from('quality_evaluations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (error) throw translateCockpitError(error);
    return data ?? [];
  }

  public async listClinicalFlags(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<readonly ClinicalFlagRow[]> {
    const client = this.clients.createUserScoped(accessToken);
    const { data, error } = await client
      .from('quality_clinical_flags')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('clinic_id', clinicId)
      .order('flagged_at', { ascending: false });

    if (error) throw translateCockpitError(error);
    return data ?? [];
  }

  public async createEvaluation(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: CreateEvaluationInput,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .rpc('create_quality_evaluation', {
        idempotency_key: idempotencyKey,
        request_id: requestId,
        target_clinic_id: clinicId,
        target_conversation_id: input.conversationId,
        target_feedback: input.feedback ?? null,
        target_organization_id: organizationId,
        target_rubric_version: input.rubricVersion,
        target_scores: input.scores,
      });

    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }

  public async flagConversation(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: CreateClinicalFlagInput,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .rpc('flag_clinical_conversation', {
        idempotency_key: idempotencyKey,
        request_id: requestId,
        target_clinic_id: clinicId,
        target_conversation_id: input.conversationId,
        target_flag_reason: input.flagReason,
        target_organization_id: organizationId,
      });

    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }

  public async resolveClinicalFlag(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    flagId: string,
    input: ResolveClinicalFlagInput,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .rpc('resolve_clinical_flag', {
        idempotency_key: idempotencyKey,
        request_id: requestId,
        target_clinic_id: clinicId,
        target_flag_id: flagId,
        target_handoff_notes: input.handoffNotes,
        target_organization_id: organizationId,
      });

    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }
}
