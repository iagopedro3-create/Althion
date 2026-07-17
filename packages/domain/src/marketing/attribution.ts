export interface LeadAttributionSnapshot {
  readonly id: string;
  readonly createdAt: string; // ISO date string
  readonly gclid: string | null;
  readonly utmSource: string | null;
  readonly utmCampaign: string | null;
  readonly status: string;
  readonly hasAppointment: boolean;
  readonly hasConsultation: boolean;
}

export interface AdMetricSummary {
  readonly campaignId: string;
  readonly clicks: number;
  readonly impressions: number;
  readonly costMicros: number;
  readonly conversions: number;
}

export interface CampaignSummary {
  readonly campaignId: string;
  readonly name: string;
}

export interface AttributionSummary {
  readonly totalAdSpend: number;
  readonly totalAdClicks: number;
  readonly totalAdConversions: number; // Google Ads pixels
  readonly matchedLeadsCount: number; // Leads with GCLID or UTM Google Ads source
  readonly matchedConsultationsCount: number; // Leads with GCLID/UTM who finished consultation
  readonly totalLeadsCount: number;
  readonly totalConsultationsCount: number;
  readonly coverageRatio: number; // matchedLeadsCount / totalLeadsCount
  readonly uncertaintyRatio: number; // Leads from Google search without GCLID (cookie rejection, organic) / totalLeadsCount
  readonly costPerMatchedLead: number;
  readonly costPerConsultation: number;
}

export function calculateAttribution(
  leads: readonly LeadAttributionSnapshot[],
  campaigns: readonly CampaignSummary[],
  metrics: readonly AdMetricSummary[],
): AttributionSummary {
  const campaignsMap = new Map(campaigns.map((c) => [c.campaignId, c.name] as const));
  const totalAdSpendMicros = metrics.reduce((sum, m) => sum + m.costMicros, 0);
  const totalAdSpend = Number((totalAdSpendMicros / 1000000).toFixed(2));
  const totalAdClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalAdConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);

  const totalLeadsCount = leads.length;
  const totalConsultationsCount = leads.filter((l) => l.hasConsultation).length;

  let matchedLeadsCount = 0;
  let matchedConsultationsCount = 0;
  let organicGoogleLeadsWithoutGclid = 0;

  for (const lead of leads) {
    const isGoogleAdAttributed =
      lead.gclid !== null ||
      lead.utmSource === 'google-ads' ||
      lead.utmSource === 'google_ads' ||
      (lead.utmSource === 'google' &&
        lead.utmCampaign !== null &&
        (campaignsMap.has(lead.utmCampaign) || Array.from(campaignsMap.values()).includes(lead.utmCampaign)));

    if (isGoogleAdAttributed) {
      matchedLeadsCount++;
      if (lead.hasConsultation) {
        matchedConsultationsCount++;
      }
    } else if (lead.utmSource === 'google' && lead.gclid === null) {
      // Traffic from google but without ad identification
      organicGoogleLeadsWithoutGclid++;
    }
  }

  const coverageRatio = totalLeadsCount > 0 ? Number((matchedLeadsCount / totalLeadsCount).toFixed(4)) : 0;
  const uncertaintyRatio =
    totalLeadsCount > 0 ? Number((organicGoogleLeadsWithoutGclid / totalLeadsCount).toFixed(4)) : 0;

  const costPerMatchedLead = matchedLeadsCount > 0 ? Number((totalAdSpend / matchedLeadsCount).toFixed(2)) : 0;
  const costPerConsultation =
    matchedConsultationsCount > 0 ? Number((totalAdSpend / matchedConsultationsCount).toFixed(2)) : 0;

  return {
    totalAdSpend,
    totalAdClicks,
    totalAdConversions,
    matchedLeadsCount,
    matchedConsultationsCount,
    totalLeadsCount,
    totalConsultationsCount,
    coverageRatio,
    uncertaintyRatio,
    costPerMatchedLead,
    costPerConsultation,
  };
}
