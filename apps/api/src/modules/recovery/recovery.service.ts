import { RECOVERY_DAY_MS, simulateRecovery, type RecoveryLeadSnapshot } from '@althion/domain';
import { Injectable } from '@nestjs/common';

import { MockCrmProvider } from '../integrations/providers/mock-crm.provider';
import { RecoveryFeatureService } from './recovery-feature.service';
import { RecoveryRepository } from './recovery.repository';

const SIMULATION_WINDOW_DAYS = 60;

@Injectable()
export class RecoveryService {
  public constructor(
    private readonly feature: RecoveryFeatureService,
    private readonly recovery: RecoveryRepository,
    private readonly mockCrm: MockCrmProvider,
  ) {}

  public async getQueue(accessToken: string, organizationId: string, clinicId: string) {
    await this.feature.ensureEnabled(accessToken);
    const queue = await this.recovery.getQueue(accessToken, organizationId, clinicId);
    return {
      ...queue,
      executionAvailable: false,
      provider: 'mock' as const,
    };
  }

  // A simulação lê exclusivamente o MockCrmProvider (a Helena opera em paralelo e
  // executa o contato por conta própria) e nunca envia contato: o resultado
  // termina em oportunidades e ações a decidir.
  public async simulate(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    idempotencyKey: string,
    requestId: string,
  ) {
    await this.feature.ensureEnabled(accessToken);

    const now = new Date();
    const [leadsPage, opportunitiesPage, contactsPage, context] = await Promise.all([
      this.mockCrm.listLeads({ limit: 100 }),
      this.mockCrm.listOpportunities({ limit: 100 }),
      this.mockCrm.listContacts({ limit: 100 }),
      this.recovery.getGovernanceContext(accessToken, organizationId, clinicId),
    ]);

    const wonLeadRefs = new Set(
      opportunitiesPage.items
        .filter((item) => item.normalizedStatus === 'won' && item.leadExternalId)
        .map((item) => item.leadExternalId as string),
    );
    const contactLabels = new Map(
      contactsPage.items.map((item) => [item.externalId, item.displayLabel] as const),
    );
    const snapshots: readonly RecoveryLeadSnapshot[] = leadsPage.items.map((lead) => ({
      externalId: lead.externalId,
      firstResponseAt: lead.firstResponseAt,
      hasWonOpportunity: wonLeadRefs.has(lead.externalId),
      label: lead.contactExternalId ? (contactLabels.get(lead.contactExternalId) ?? null) : null,
      receivedAt: lead.receivedAt,
      status: lead.status,
    }));

    const result = simulateRecovery(snapshots, context, now);
    const simulationId = await this.recovery.runSimulation(
      accessToken,
      organizationId,
      clinicId,
      {
        candidates: result.candidates.map((candidate) => ({
          action_type: candidate.actionType,
          evidence: candidate.evidence,
          external_lead_ref: candidate.externalLeadRef,
          lead_label: candidate.leadLabel,
          rule_code: candidate.ruleCode,
          rule_version: candidate.ruleVersion,
        })),
        exclusions: result.exclusions.map((exclusion) => ({
          external_lead_ref: exclusion.externalLeadRef,
          reason: exclusion.reason,
          rule_code: exclusion.ruleCode,
        })),
        leadsEvaluated: result.leadsEvaluated,
        policyVersion: result.policyVersion,
        windowEnd: now.toISOString(),
        windowStart: new Date(
          now.getTime() - SIMULATION_WINDOW_DAYS * RECOVERY_DAY_MS,
        ).toISOString(),
      },
      idempotencyKey,
      requestId,
    );

    return {
      id: simulationId,
      identified: result.candidates.length,
      leadsEvaluated: result.leadsEvaluated,
      policyVersion: result.policyVersion,
      status: 'completed' as const,
    };
  }
}
