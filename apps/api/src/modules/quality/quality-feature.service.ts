import { Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';
import { unavailable } from '../cockpit/cockpit-error';

@Injectable()
export class QualityFeatureService {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async ensureEnabled(accessToken: string): Promise<void> {
    const client = this.clients.createUserScoped(accessToken);
    const flag = await client
      .from('feature_flags')
      .select('*')
      .eq('key', 'quality.engine.v1')
      .maybeSingle();
    if (flag.error) throw unavailable();
    if (!flag.data?.default_enabled) {
      throw new NotFoundException({
        code: 'QUALITY_NOT_AVAILABLE',
        message: 'O Quality Engine ainda não está disponível.',
      });
    }
  }
}
