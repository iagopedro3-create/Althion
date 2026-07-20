import type { Database, SaveGoogleAdsCredentialsInput } from '@althion/contracts';
import { Injectable } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';
import { translateCockpitError } from '../cockpit/cockpit-error';

type CredentialsRow = Database['public']['Tables']['google_ads_credentials']['Row'];
type CampaignRow = Database['public']['Tables']['google_ads_campaigns']['Row'];
type MetricsRow = Database['public']['Tables']['google_ads_metrics']['Row'];

@Injectable()
export class GoogleAdsRepository {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async getCredentials(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<CredentialsRow | null> {
    const { data, error } = await this.clients
      .createUserScoped(accessToken)
      .rpc('get_google_ads_connection', {
        target_clinic_id: clinicId,
        target_organization_id: organizationId,
      });

    if (error) throw translateCockpitError(error);
    return data[0] ?? null;
  }

  public async saveCredentials(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    input: SaveGoogleAdsCredentialsInput,
    idempotencyKey: string,
    requestId: string,
  ): Promise<string> {
    const result = await this.clients
      .createUserScoped(accessToken)
      .rpc('save_google_ads_credentials', {
        idempotency_key: idempotencyKey,
        request_id: requestId,
        target_clinic_id: clinicId,
        target_customer_id: input.customer_id,
        target_developer_token: input.developer_token,
        target_organization_id: organizationId,
        target_refresh_token: input.refresh_token,
      });

    if (result.error) throw translateCockpitError(result.error);
    return result.data as string;
  }

  public async listCampaigns(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<readonly CampaignRow[]> {
    const client = this.clients.createUserScoped(accessToken);
    const { data, error } = await client
      .from('google_ads_campaigns')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('clinic_id', clinicId)
      .order('name', { ascending: true });

    if (error) throw translateCockpitError(error);
    return data ?? [];
  }

  public async listMetrics(
    accessToken: string,
    organizationId: string,
    clinicId: string,
  ): Promise<readonly MetricsRow[]> {
    const client = this.clients.createUserScoped(accessToken);
    const { data, error } = await client
      .from('google_ads_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('clinic_id', clinicId)
      .order('date', { ascending: false });

    if (error) throw translateCockpitError(error);
    return data ?? [];
  }

  public async syncData(
    accessToken: string,
    organizationId: string,
    clinicId: string,
    campaigns: readonly {
      campaign_id: string;
      name: string;
      status: string;
      budget_micros: number;
    }[],
    metrics: readonly {
      campaign_id: string;
      date: string;
      clicks: number;
      impressions: number;
      cost_micros: number;
      conversions: number;
    }[],
    idempotencyKey: string,
    requestId: string,
  ): Promise<boolean> {
    const result = await this.clients.createUserScoped(accessToken).rpc('sync_google_ads_data', {
      idempotency_key: idempotencyKey,
      request_id: requestId,
      target_campaigns: campaigns.map((campaign) => ({ ...campaign })),
      target_clinic_id: clinicId,
      target_metrics: metrics.map((metric) => ({ ...metric })),
      target_organization_id: organizationId,
    });

    if (result.error) throw translateCockpitError(result.error);
    return result.data as boolean;
  }
}
