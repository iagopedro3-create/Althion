import type { Database, Json } from '@althion/contracts';
import type { RecoveryGovernanceContext } from '@althion/domain';
import { Injectable } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';
import { translateCockpitError } from '../cockpit/cockpit-error';

type SimulationRow = Database['public']['Tables']['recovery_simulations']['Row'];
type OpportunityRow = Database['public']['Tables']['recovery_opportunities']['Row'];
type ActionRow = Database['public']['Tables']['recovery_actions']['Row'];
type SuppressionRow = Database['public']['Tables']['recovery_suppressions']['Row'];

export interface RecoveryQueueRows {
  readonly actions: readonly ActionRow[];
  readonly opportunities: readonly OpportunityRow[];
  readonly simulations: readonly SimulationRow[];
  readonly suppressions: readonly SuppressionRow[];
}

export interface SimulationCandidatePayload {
  readonly action_type: string;
  readonly evidence: Readonly<Record<string, string | null>>;
  readonly external_lead_ref: string;
  readonly lead_label: string | null;
  readonly rule_code: string;
  readonly rule_version: string;
}

export interface SimulationExclusionPayload {
  readonly external_lead_ref: string;
  readonly reason: string;
  readonly rule_code: string;
}

@Injectable()
export class RecoveryRepository {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async getQueue(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<RecoveryQueueRows> {
    const client = this.clients.createUserScoped(accessToken);
    const [simulations, opportunities, actions, suppressions] = await Promise.all([
      client
        .from('recovery_simulations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(10),
      client
        .from('recovery_opportunities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(100),
      client
        .from('recovery_actions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(100),
      client
        .from('recovery_suppressions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);
    const error = simulations.error ?? opportunities.error ?? actions.error ?? suppressions.error;
    if (error) throw translateCockpitError(error);
    return {
      actions: actions.data ?? [],
      opportunities: opportunities.data ?? [],
      simulations: simulations.data ?? [],
      suppressions: suppressions.data ?? [],
    };
  }

  public async getGovernanceContext(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<RecoveryGovernanceContext> {
    const client = this.clients.createUserScoped(accessToken);
    const [consents, suppressions, approvedActions] = await Promise.all([
      client
        .from('recovery_consents')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId),
      client
        .from('recovery_suppressions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .is('revoked_at', null),
      client
        .from('recovery_actions')
        .select('decided_at, opportunity_id, recovery_opportunities!inner(external_lead_ref)')
        .eq('organization_id', organizationId)
        .eq('clinic_id', clinicId)
        .eq('status', 'approved'),
    ]);
    const error = consents.error ?? suppressions.error ?? approvedActions.error;
    if (error) throw translateCockpitError(error);

    const now = Date.now();
    const approvedActionAt: Record<string, string[]> = {};
    for (const row of approvedActions.data ?? []) {
      const record = row as unknown as {
        decided_at: string | null;
        recovery_opportunities: { external_lead_ref: string };
      };
      if (!record.decided_at) continue;
      const ref = record.recovery_opportunities.external_lead_ref;
      (approvedActionAt[ref] ??= []).push(record.decided_at);
    }

    return {
      activeSuppressions: new Set(
        (suppressions.data ?? [])
          .filter((row) => row.expires_at === null || new Date(row.expires_at).getTime() > now)
          .map((row) => row.external_lead_ref),
      ),
      approvedActionAt,
      consents: Object.fromEntries(
        (consents.data ?? []).map((row) => [row.external_lead_ref, row.state]),
      ),
    };
  }

  public async runSimulation(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: {
      candidates: readonly SimulationCandidatePayload[];
      exclusions: readonly SimulationExclusionPayload[];
      leadsEvaluated: number;
      policyVersion: string;
      windowEnd: string;
      windowStart: string;
    },
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients.createUserScoped(accessToken).rpc('run_recovery_simulation', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_candidates: input.candidates as unknown as Json,
      target_clinic_id: clinicId,
      target_exclusions: input.exclusions as unknown as Json,
      target_leads_evaluated: input.leadsEvaluated,
      target_organization_id: organizationId,
      target_policy_version: input.policyVersion,
      target_window_end: input.windowEnd,
      target_window_start: input.windowStart,
    });
    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }

  public async decideOpportunity(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    opportunityId: string,
    input: { decision: string; reasonCode?: string | undefined },
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .rpc('decide_recovery_opportunity', {
        idempotency_key: idempotencyKey,
        request_id: requestId,
        target_clinic_id: clinicId,
        target_decision: input.decision,
        target_opportunity_id: opportunityId,
        target_organization_id: organizationId,
        target_reason_code: input.reasonCode ?? null,
      });
    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }

  public async decideAction(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    actionId: string,
    input: { decision: string; reasonCode?: string | undefined },
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients.createUserScoped(accessToken).rpc('decide_recovery_action', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_action_id: actionId,
      target_clinic_id: clinicId,
      target_decision: input.decision,
      target_organization_id: organizationId,
      target_reason_code: input.reasonCode ?? null,
    });
    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }

  public async createSuppression(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: { expiresAt?: string | null | undefined; externalLeadRef: string; reason: string },
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .rpc('create_recovery_suppression', {
        idempotency_key: idempotencyKey,
        request_id: requestId,
        target_clinic_id: clinicId,
        target_expires_at: input.expiresAt ?? null,
        target_external_lead_ref: input.externalLeadRef,
        target_organization_id: organizationId,
        target_reason: input.reason,
      });
    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }

  public async revokeSuppression(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    suppressionId: string,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .rpc('revoke_recovery_suppression', {
        idempotency_key: idempotencyKey,
        request_id: requestId,
        target_clinic_id: clinicId,
        target_organization_id: organizationId,
        target_suppression_id: suppressionId,
      });
    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }
}
