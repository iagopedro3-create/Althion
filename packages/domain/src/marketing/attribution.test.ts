import { describe, expect, it } from 'vitest';
import { calculateAttribution, type LeadAttributionSnapshot, type AdMetricSummary } from './attribution';

describe('google ads attribution calculation', () => {
  it('correctly aggregates ad spend, clicks, conversions and calculates metrics', () => {
    const campaigns = [
      { campaignId: 'camp-1', name: 'Implante Dentário SP' },
      { campaignId: 'camp-2', name: 'Clareamento Dental' },
    ];

    const metrics: AdMetricSummary[] = [
      { campaignId: 'camp-1', clicks: 120, impressions: 2400, costMicros: 480000000, conversions: 12.0 }, // Spend: 480.00
      { campaignId: 'camp-2', clicks: 80, impressions: 1600, costMicros: 320000000, conversions: 8.0 },  // Spend: 320.00
    ];

    const leads: LeadAttributionSnapshot[] = [
      // Google Ads Attributed Leads (with GCLID or ad utm)
      { id: 'l-1', createdAt: '2026-07-17', gclid: 'gclid-111', utmSource: 'google', utmCampaign: 'implantes', status: 'won', hasAppointment: true, hasConsultation: true },
      { id: 'l-2', createdAt: '2026-07-17', gclid: null, utmSource: 'google-ads', utmCampaign: 'clareamento', status: 'lost', hasAppointment: false, hasConsultation: false },
      { id: 'l-3', createdAt: '2026-07-17', gclid: 'gclid-222', utmSource: 'google', utmCampaign: 'implantes', status: 'won', hasAppointment: true, hasConsultation: true },
      // Organic Google Search Lead (no GCLID, source=google)
      { id: 'l-4', createdAt: '2026-07-17', gclid: null, utmSource: 'google', utmCampaign: null, status: 'won', hasAppointment: true, hasConsultation: true },
      // Direct/Organic Traffic Lead (not google)
      { id: 'l-5', createdAt: '2026-07-17', gclid: null, utmSource: null, utmCampaign: null, status: 'won', hasAppointment: true, hasConsultation: true },
    ];

    const result = calculateAttribution(leads, campaigns, metrics);

    // Totals
    expect(result.totalAdSpend).toBe(800.00); // 480 + 320
    expect(result.totalAdClicks).toBe(200);   // 120 + 80
    expect(result.totalAdConversions).toBe(20); // 12 + 8

    // Leads & Consultations
    expect(result.totalLeadsCount).toBe(5);
    expect(result.totalConsultationsCount).toBe(4); // l-1, l-3, l-4, l-5
    expect(result.matchedLeadsCount).toBe(3); // l-1, l-2, l-3
    expect(result.matchedConsultationsCount).toBe(2); // l-1, l-3

    // Cost calculations
    expect(result.costPerMatchedLead).toBe(266.67); // 800 / 3
    expect(result.costPerConsultation).toBe(400.00); // 800 / 2

    // Coverage & Uncertainty ratios
    expect(result.coverageRatio).toBe(0.6000); // 3 / 5
    expect(result.uncertaintyRatio).toBe(0.2000); // 1 / 5 (l-4 is organic google search without ad click id)
  });

  it('handles empty lists gracefully without throwing division by zero', () => {
    const result = calculateAttribution([], [], []);
    expect(result.totalAdSpend).toBe(0);
    expect(result.totalLeadsCount).toBe(0);
    expect(result.matchedLeadsCount).toBe(0);
    expect(result.coverageRatio).toBe(0);
    expect(result.uncertaintyRatio).toBe(0);
    expect(result.costPerMatchedLead).toBe(0);
    expect(result.costPerConsultation).toBe(0);
  });
});
