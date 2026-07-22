import { describe, expect, it } from 'vitest';
import type { GoogleAdsFeatureService } from './google-ads-feature.service';
import type { GoogleAdsRepository } from './google-ads.repository';
import { GoogleAdsService } from './google-ads.service';

const ORG = '11111111-1111-4111-8111-111111111111';
const CLINIC = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
type SyncCampaigns = Parameters<GoogleAdsRepository['syncData']>[3];
type SyncMetrics = Parameters<GoogleAdsRepository['syncData']>[4];

const feature = { ensureEnabled: async () => undefined } as unknown as GoogleAdsFeatureService;

describe('google ads service', () => {
  it('calls repository methods for credentials and campaigns list', async () => {
    let getCredentialsCalled = false;
    let saveCredentialsCalled = false;
    let listCampaignsCalled = false;

    const repository = {
      getCredentials: async () => {
        getCredentialsCalled = true;
        return null;
      },
      saveCredentials: async () => {
        saveCredentialsCalled = true;
        return 'cred-123';
      },
      listCampaigns: async () => {
        listCampaignsCalled = true;
        return [];
      },
    } as unknown as GoogleAdsRepository;

    const service = new GoogleAdsService(feature, repository);

    const credentials = await service.getCredentials('token', ORG, CLINIC);
    await service.saveCredentials(
      'token',
      ORG,
      CLINIC,
      {
        customer_id: '123-456-7890',
        developer_token: 'mock_developer',
        refresh_token: 'mock_refresh',
      },
      'idempotency-1',
      'req-1',
    );
    await service.listCampaigns('token', ORG, CLINIC);

    expect(getCredentialsCalled).toBe(true);
    expect(credentials).toBeNull();
    expect(saveCredentialsCalled).toBe(true);
    expect(listCampaignsCalled).toBe(true);
  });

  it('calculates marketing attribution using synced campaigns and metrics', async () => {
    const repository = {
      listCampaigns: async () => [
        { campaign_id: 'camp-implantes', name: 'Implantes Dentários SP', budget_micros: 50000000 },
      ],
      listMetrics: async () => [
        {
          campaign_id: 'camp-implantes',
          date: '2026-01-15',
          clicks: 10,
          impressions: 100,
          cost_micros: 20000000,
          conversions: 1.0,
        },
      ],
    } as unknown as GoogleAdsRepository;

    const service = new GoogleAdsService(feature, repository);
    const summary = await service.getAttributionSummary('token', ORG, CLINIC);

    expect(summary.campaignsCount).toBe(1);
    expect(summary.attribution.totalAdSpend).toBe(20.0); // 20000000 micros = 20.00
    expect(summary.attribution.totalAdClicks).toBe(10);
    expect(summary.leadsMatchedCount).toBe(2); // 'mock-lead-in-progress' and 'mock-lead-ads-2'
    expect(summary.attribution.matchedConsultationsCount).toBe(2);
  });

  it('triggers mock Google Ads data sync in sandbox', async () => {
    let syncedCampaigns: SyncCampaigns = [];
    let syncedMetrics: SyncMetrics = [];

    const repository = {
      syncData: async (
        _token: string,
        _org: string,
        _clinic: string,
        campaigns: SyncCampaigns,
        metrics: SyncMetrics,
      ) => {
        syncedCampaigns = campaigns;
        syncedMetrics = metrics;
        return true;
      },
    } as unknown as GoogleAdsRepository;

    const service = new GoogleAdsService(feature, repository);
    const res = await service.sync('token', ORG, CLINIC, 'idem-sync', 'req-sync');

    expect(res.status).toBe('completed');
    expect(res.campaignsSynced).toBe(3);
    expect(res.metricsSynced).toBe(4);
    expect(syncedCampaigns).toHaveLength(3);
    expect(syncedMetrics).toHaveLength(4);
  });
});
