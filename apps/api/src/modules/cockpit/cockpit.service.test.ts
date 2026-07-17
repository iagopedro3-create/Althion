import type { Principal } from '@althion/domain';
import { describe, expect, it } from 'vitest';

import type { CockpitFeatureService } from './cockpit-feature.service';
import type { AccountStateRows, CockpitRepository, PortfolioRows } from './cockpit.repository';
import { CockpitService } from './cockpit.service';

const ORG = '11111111-1111-4111-8111-111111111111';
const CLINIC = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const feature = { ensureEnabled: async () => undefined } as unknown as CockpitFeatureService;

const emptyState: AccountStateRows = {
  incidents: [],
  meetings: [],
  plans: [],
  requests: [],
  scores: [],
  tasks: [],
};

const portfolio: PortfolioRows = {
  assignments: [
    {
      clinic_id: null,
      complexity: 'high',
      created_at: '2026-07-01T00:00:00Z',
      ends_at: null,
      id: '60000000-0000-4000-8000-000000000001',
      organization_id: ORG,
      specialist_id: '50000000-0000-4000-8000-000000000001',
      starts_at: '2026-07-01T00:00:00Z',
      status: 'active',
      updated_at: '2026-07-01T00:00:00Z',
    },
  ],
  clinics: [
    {
      created_at: '2026-07-01T00:00:00Z',
      deleted_at: null,
      id: CLINIC,
      name: 'Clínica sintética',
      organization_id: ORG,
      slug: 'clinica-sintetica',
      status: 'active',
      timezone: 'America/Sao_Paulo',
      updated_at: '2026-07-01T00:00:00Z',
    },
  ],
  organizations: [
    {
      created_at: '2026-07-01T00:00:00Z',
      deleted_at: null,
      id: ORG,
      name: 'Organização sintética',
      retention_policy_version: null,
      slug: 'organizacao-sintetica',
      status: 'active',
      timezone: 'America/Sao_Paulo',
      updated_at: '2026-07-01T00:00:00Z',
    },
  ],
  specialist: {
    capacity_limit: 10,
    created_at: '2026-07-01T00:00:00Z',
    id: '50000000-0000-4000-8000-000000000001',
    profile_id: '99999999-9999-4999-8999-999999999999',
    status: 'active',
    updated_at: '2026-07-01T00:00:00Z',
  },
};

const repository = {
  getAccountState: async () => emptyState,
  getPortfolio: async () => portfolio,
} as unknown as CockpitRepository;

const specialistPrincipal: Principal = {
  assignments: [{ clinicId: null, organizationId: ORG, status: 'active' }],
  memberships: [],
  platformRoles: [],
  profileId: '99999999-9999-4999-8999-999999999999',
  subject: '88888888-8888-4888-8888-888888888888',
};

describe('cockpit service', () => {
  it('denies the portfolio to principals without an active assignment', async () => {
    const service = new CockpitService(feature, repository);
    const denied: Principal = { ...specialistPrincipal, assignments: [] };
    await expect(service.getPortfolio('token', denied)).rejects.toMatchObject({
      status: 403,
    });
  });

  it('projects portfolio accounts with health, capacity and next action', async () => {
    const service = new CockpitService(feature, repository);
    const result = await service.getPortfolio('token', specialistPrincipal);

    expect(result.accounts).toHaveLength(1);
    const account = result.accounts[0]!;
    expect(account.clinicName).toBe('Clínica sintética');
    expect(account.complexity).toBe('high');
    expect(account.health.state).toBe('attention');
    expect(account.nextBestAction?.code).toBe('refresh_assessment');
    expect(result.capacity).toMatchObject({
      availability: 'available',
      limitPoints: 10,
      limitSource: 'configured',
      usedPoints: 3,
    });
    expect(result.policyVersion).toMatch(/provisional/);
  });

  it('never converts a missing score into a number in the account view', async () => {
    const service = new CockpitService(feature, repository);
    const account = await service.getAccount('token', ORG, CLINIC);
    expect(account.score).toEqual({ availability: 'insufficient_data' });
    expect(account.health.reasons.map((reason) => reason.code)).toContain('no_assessment');
    expect(account.nextBestActions.map((action) => action.code)).toEqual([
      'refresh_assessment',
      'schedule_checkin',
    ]);
  });
});
