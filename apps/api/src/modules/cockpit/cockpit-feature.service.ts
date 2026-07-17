import { Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';
import { unavailable } from './cockpit-error';

@Injectable()
export class CockpitFeatureService {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  // O Cockpit é interno e transversal às organizações; a flag é global, sem override por tenant.
  public async ensureEnabled(accessToken: string): Promise<void> {
    const client = this.clients.createUserScoped(accessToken);
    const flag = await client
      .from('feature_flags')
      .select('*')
      .eq('key', 'cockpit.specialist.v1')
      .maybeSingle();
    if (flag.error) throw unavailable();
    if (!flag.data?.default_enabled) {
      throw new NotFoundException({
        code: 'COCKPIT_NOT_AVAILABLE',
        message: 'O Cockpit do Especialista ainda não está disponível.',
      });
    }
  }
}
