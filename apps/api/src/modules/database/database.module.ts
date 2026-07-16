import { Global, Module } from '@nestjs/common';

import { SupabaseClientFactory } from './supabase-client.factory';

@Global()
@Module({
  exports: [SupabaseClientFactory],
  providers: [SupabaseClientFactory],
})
export class DatabaseModule {}
