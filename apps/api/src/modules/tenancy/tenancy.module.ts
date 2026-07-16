import { Module } from '@nestjs/common';

import { TenancyController } from './tenancy.controller';
import { TenancyRepository } from './tenancy.repository';
import { TenancyService } from './tenancy.service';

@Module({
  controllers: [TenancyController],
  providers: [TenancyRepository, TenancyService],
})
export class TenancyModule {}
