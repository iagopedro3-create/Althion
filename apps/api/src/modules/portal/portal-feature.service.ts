import { Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseClientFactory } from '../database/supabase-client.factory';
import { unavailable } from './portal-error';

@Injectable()
export class PortalFeatureService {
  public constructor(private readonly clients: SupabaseClientFactory) {}

  public async ensureEnabled(accessToken: string, organizationId: string): Promise<void> {
    const client = this.clients.createUserScoped(accessToken);
    const flag = await client
      .from('feature_flags')
      .select('*')
      .eq('key', 'portal.client.v1')
      .maybeSingle();
    if (flag.error) throw unavailable();
    if (!flag.data) throw this.notAvailable();

    const override = await client
      .from('feature_flag_overrides')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('feature_flag_id', flag.data.id)
      .maybeSingle();
    if (override.error) throw unavailable();

    const overrideData = override.data;
    const overrideIsCurrent =
      overrideData !== null &&
      (!overrideData.expires_at || new Date(overrideData.expires_at).getTime() > Date.now());
    const enabled =
      overrideIsCurrent && overrideData ? overrideData.enabled : flag.data.default_enabled;
    if (!enabled) throw this.notAvailable();
  }

  private notAvailable(): NotFoundException {
    return new NotFoundException({
      code: 'PORTAL_NOT_AVAILABLE',
      message: 'O Portal do Cliente ainda não está disponível para esta organização.',
    });
  }
}
