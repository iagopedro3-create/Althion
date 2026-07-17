import { Injectable } from '@nestjs/common';
import { calculateAttribution, type LeadAttributionSnapshot } from '@althion/domain';
import type { SaveGoogleAdsCredentialsInput } from '@althion/contracts';

import { GoogleAdsFeatureService } from './google-ads-feature.service';
import { GoogleAdsRepository } from './google-ads.repository';

@Injectable()
export class GoogleAdsService {
  public constructor(
    private readonly feature: GoogleAdsFeatureService,
    private readonly repository: GoogleAdsRepository,
  ) {}

  public async getCredentials(accessToken: string, organizationId: string, clinicId: string) {
    await this.feature.ensureEnabled(accessToken);
    return this.repository.getCredentials(accessToken, organizationId, clinicId);
  }

  public async saveCredentials(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: SaveGoogleAdsCredentialsInput,
    idempotencyKey: string,
    requestId: string,
  ) {
    await this.feature.ensureEnabled(accessToken);
    const id = await this.repository.saveCredentials(
      accessToken,
      organizationId,
      clinicId,
      input,
      idempotencyKey,
      requestId,
    );
    return { id };
  }

  public async listCampaigns(accessToken: string, organizationId: string, clinicId: string) {
    await this.feature.ensureEnabled(accessToken);
    return this.repository.listCampaigns(accessToken, organizationId, clinicId);
  }

  public async getAttributionSummary(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ) {
    await this.feature.ensureEnabled(accessToken);

    const [campaigns, metrics] = await Promise.all([
      this.repository.listCampaigns(accessToken, organizationId, clinicId),
      this.repository.listMetrics(accessToken, organizationId, clinicId),
    ]);

    // Generate enriched synthetic leads snapshots for sandbox attribution matching
    const leads: readonly LeadAttributionSnapshot[] = [
      {
        id: 'mock-lead-in-progress',
        createdAt: '2026-01-15T10:02:00.000Z',
        gclid: 'gclid-mock-111',
        utmSource: 'google',
        utmCampaign: 'camp-implantes',
        status: 'won',
        hasAppointment: true,
        hasConsultation: true,
      },
      {
        id: 'mock-lead-unanswered',
        createdAt: '2026-01-15T10:00:00.000Z',
        gclid: null,
        utmSource: 'google',
        utmCampaign: null, // Organic search without ad click id
        status: 'new',
        hasAppointment: false,
        hasConsultation: false,
      },
      {
        id: 'mock-lead-organic',
        createdAt: '2026-01-14T15:30:00.000Z',
        gclid: null,
        utmSource: 'google',
        utmCampaign: null,
        status: 'won',
        hasAppointment: true,
        hasConsultation: true,
      },
      {
        id: 'mock-lead-direct',
        createdAt: '2026-01-14T11:20:00.000Z',
        gclid: null,
        utmSource: null,
        utmCampaign: null,
        status: 'won',
        hasAppointment: true,
        hasConsultation: true,
      },
      {
        id: 'mock-lead-ads-2',
        createdAt: '2026-01-13T09:45:00.000Z',
        gclid: 'gclid-mock-222',
        utmSource: 'google-ads',
        utmCampaign: 'camp-clareamento',
        status: 'won',
        hasAppointment: true,
        hasConsultation: true,
      },
    ];

    const campaignSummaries = campaigns.map((c) => ({
      campaignId: c.campaign_id,
      name: c.name,
    }));

    const metricsSummaries = metrics.map((m) => ({
      campaignId: m.campaign_id,
      clicks: m.clicks,
      impressions: m.impressions,
      costMicros: Number(m.cost_micros),
      conversions: Number(m.conversions),
    }));

    const attribution = calculateAttribution(leads, campaignSummaries, metricsSummaries);

    return {
      attribution,
      campaignsCount: campaigns.length,
      leadsMatchedCount: attribution.matchedLeadsCount,
    };
  }

  public async sync(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    idempotencyKey: string,
    requestId: string,
  ) {
    await this.feature.ensureEnabled(accessToken);

    // Mock Google Ads SDK data generated for Sandbox
    const campaigns = [
      {
        campaign_id: 'camp-implantes',
        name: 'Implantes Dentários SP',
        status: 'ENABLED',
        budget_micros: 50000000, // R$ 50/dia
      },
      {
        campaign_id: 'camp-clareamento',
        name: 'Clareamento e Estética',
        status: 'ENABLED',
        budget_micros: 30000000, // R$ 30/dia
      },
      {
        campaign_id: 'camp-geral',
        name: 'Clínica Geral e Prevenção',
        status: 'PAUSED',
        budget_micros: 20000000, // R$ 20/dia
      },
    ];

    const metrics = [
      {
        campaign_id: 'camp-implantes',
        date: '2026-01-15',
        clicks: 45,
        impressions: 900,
        cost_micros: 180000000, // R$ 180.00
        conversions: 4.5,
      },
      {
        campaign_id: 'camp-clareamento',
        date: '2026-01-15',
        clicks: 30,
        impressions: 600,
        cost_micros: 90000000, // R$ 90.00
        conversions: 3.0,
      },
      {
        campaign_id: 'camp-implantes',
        date: '2026-01-14',
        clicks: 50,
        impressions: 1000,
        cost_micros: 200000000, // R$ 200.00
        conversions: 5.0,
      },
      {
        campaign_id: 'camp-clareamento',
        date: '2026-01-14',
        clicks: 25,
        impressions: 500,
        cost_micros: 75000000, // R$ 75.00
        conversions: 2.5,
      },
    ];

    await this.repository.syncData(
      accessToken,
      organizationId,
      clinicId,
      campaigns,
      metrics,
      idempotencyKey,
      requestId,
    );

    return {
      status: 'completed',
      campaignsSynced: campaigns.length,
      metricsSynced: metrics.length,
    };
  }
}
