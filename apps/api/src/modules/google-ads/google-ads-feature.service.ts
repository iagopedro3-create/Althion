import { Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';
import { unavailable } from '../cockpit/cockpit-error';

@Injectable()
export class GoogleAdsFeatureService {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async ensureEnabled(accessToken: string): Promise<void> {
    const client = this.clients.createUserScoped(accessToken);
    const flag = await client
      .from('feature_flags')
      .select('*')
      .eq('key', 'google.ads.v1')
      .maybeSingle();

    if (flag.error) throw unavailable();
    if (!flag.data?.default_enabled) {
      throw new NotFoundException({
        code: 'GOOGLE_ADS_NOT_AVAILABLE',
        message: 'O módulo Google Ads Leitura ainda não está disponível.',
      });
    }
  }
}
