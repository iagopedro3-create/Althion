import { describe, expect, it } from 'vitest';
import type { QualityFeatureService } from './quality-feature.service';
import type { QualityRepository } from './quality.repository';
import { QualityService } from './quality.service';

const ORG = '11111111-1111-4111-8111-111111111111';
const CLINIC = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const feature = { ensureEnabled: async () => undefined } as unknown as QualityFeatureService;

describe('quality service', () => {
  it('lists rubrics, evaluations, and flags calling repository', async () => {
    let listRubricsCalled = false;
    let listEvaluationsCalled = false;
    let listClinicalFlagsCalled = false;

    const repository = {
      listRubrics: async () => {
        listRubricsCalled = true;
        return [];
      },
      listEvaluations: async () => {
        listEvaluationsCalled = true;
        return [];
      },
      listClinicalFlags: async () => {
        listClinicalFlagsCalled = true;
        return [];
      },
    } as unknown as QualityRepository;

    const service = new QualityService(feature, repository);

    await service.listRubrics('token');
    await service.listEvaluations('token', ORG, CLINIC);
    await service.listClinicalFlags('token', ORG, CLINIC);

    expect(listRubricsCalled).toBe(true);
    expect(listEvaluationsCalled).toBe(true);
    expect(listClinicalFlagsCalled).toBe(true);
  });

  it('delegates createEvaluation, flagConversation, and resolveClinicalFlag to repository', async () => {
    let createdEvaluation = false;
    let flaggedConversation = false;
    let resolvedFlag = false;

    const repository = {
      createEvaluation: async () => {
        createdEvaluation = true;
        return 'eval-123';
      },
      flagConversation: async () => {
        flaggedConversation = true;
        return 'flag-123';
      },
      resolveClinicalFlag: async () => {
        resolvedFlag = true;
        return 'flag-123';
      },
    } as unknown as QualityRepository;

    const service = new QualityService(feature, repository);

    const resEval = await service.createEvaluation(
      'token',
      ORG,
      CLINIC,
      {
        conversationId: 'conv-1',
        rubricVersion: '1.0.0',
        scores: { criteria1: 5 },
      },
      'idempotency-1',
      'req-1',
    );

    const resFlag = await service.flagConversation(
      'token',
      ORG,
      CLINIC,
      {
        conversationId: 'conv-1',
        flagReason: 'clinical',
      },
      'idempotency-2',
      'req-2',
    );

    const resResolve = await service.resolveClinicalFlag(
      'token',
      ORG,
      CLINIC,
      'flag-123',
      { handoffNotes: 'resolved' },
      'idempotency-3',
      'req-3',
    );

    expect(createdEvaluation).toBe(true);
    expect(resEval.id).toBe('eval-123');

    expect(flaggedConversation).toBe(true);
    expect(resFlag.id).toBe('flag-123');

    expect(resolvedFlag).toBe(true);
    expect(resResolve.id).toBe('flag-123');
  });
});
