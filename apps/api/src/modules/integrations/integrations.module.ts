import { Module } from '@nestjs/common';

import { HelenaCrmProvider } from './providers/helena-crm.provider';
import { MockCrmProvider } from './providers/mock-crm.provider';

@Module({
  exports: [HelenaCrmProvider, MockCrmProvider],
  providers: [HelenaCrmProvider, MockCrmProvider],
})
export class IntegrationsModule {}
