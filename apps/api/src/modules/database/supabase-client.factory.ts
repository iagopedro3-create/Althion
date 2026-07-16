import type { Database } from '@althion/contracts';
import { Injectable } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { ApiConfigService } from '../../config/api-config.service';

@Injectable()
export class SupabaseClientFactory {
  public constructor(private readonly config: ApiConfigService) {}

  public createUserScoped(accessToken: string): SupabaseClient<Database> {
    return createClient<Database>(
      this.config.environment.SUPABASE_URL,
      this.config.environment.SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    );
  }
}
