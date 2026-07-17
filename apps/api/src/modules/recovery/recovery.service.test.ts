import { describe, expect, it } from 'vitest';

import { MockCrmProvider } from '../integrations/providers/mock-crm.provider';
import type { RecoveryFeatureService } from './recovery-feature.service';
import type { RecoveryRepository, SimulationCandidatePayload } from './recovery.repository';
import { RecoveryService } from './recovery.service';

const ORG = '11111111-1111-4111-8111-111111111111';
const CLINIC = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const feature = { ensureEnabled: async () => undefined } as unknown as RecoveryFeatureService;

describe('recovery service', () => {
  it('simulates from the mock provider without ever executing contacts', async () => {
    let persisted: {
      candidates: readonly SimulationCandidatePayload[];
      leadsEvaluated: number;
    } | null = null;
    const repository = {
      getGovernanceContext: async () => ({
        activeSuppressions: new Set<string>(),
        approvedActionAt: {},
        consents: {
          'mock-lead-in-progress': 'granted' as const,
          'mock-lead-unanswered': 'granted' as const,
        },
      }),
      runSimulation: async (
        _token: string,
        _org: string,
        _clinic: string,
        input: { candidates: readonly SimulationCandidatePayload[]; leadsEvaluated: number },
      ) => {
        persisted = input;
        return 'simulation-id';
      },
    } as unknown as RecoveryRepository;

    const service = new RecoveryService(feature, repository, new MockCrmProvider());
    const result = await service.simulate('token', ORG, CLINIC, 'key-1234567890123456', 'req-1');

    expect(result.status).toBe('completed');
    expect(result.policyVersion).toMatch(/provisional/);
    expect(result.leadsEvaluated).toBe(2);
    // Fixtures do mock são de jan/2026: fora das janelas da política em jul/2026.
    // Nenhum candidato é inventado para preencher a fila.
    expect(result.identified).toBe(0);
    expect(persisted).not.toBeNull();
    expect(persisted!.candidates).toHaveLength(0);
  });

  it('marks the queue as synthetic and without execution', async () => {
    const repository = {
      getQueue: async () => ({
        actions: [],
        opportunities: [],
        simulations: [],
        suppressions: [],
      }),
    } as unknown as RecoveryRepository;
    const service = new RecoveryService(feature, repository, new MockCrmProvider());
    const queue = await service.getQueue('token', ORG, CLINIC);
    expect(queue.provider).toBe('mock');
    expect(queue.executionAvailable).toBe(false);
  });
});
