import { Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';
import { unavailable } from '../cockpit/cockpit-error';

@Injectable()
export class RecoveryFeatureService {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  // Flag global e interna, como no Cockpit: sem override por organização.
  public async ensureEnabled(accessToken: string): Promise<void> {
    const client = this.clients.createUserScoped(accessToken);
    const flag = await client
      .from('feature_flags')
      .select('*')
      .eq('key', 'recovery.engine.v1')
      .maybeSingle();
    if (flag.error) throw unavailable();
    if (!flag.data?.default_enabled) {
      throw new NotFoundException({
        code: 'RECOVERY_NOT_AVAILABLE',
        message: 'O Recovery Engine ainda não está disponível.',
      });
    }
  }
}
