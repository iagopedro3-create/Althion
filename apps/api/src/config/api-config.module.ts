import { Global, Module } from '@nestjs/common';

import { ApiConfigService } from './api-config.service';

@Global()
@Module({
  exports: [ApiConfigService],
  providers: [ApiConfigService],
})
export class ApiConfigModule {}
