import { Module } from '@nestjs/common';

import { PortalModule } from '../portal/portal.module';
import { RequestsController } from './requests.controller';
import { RequestsRepository } from './requests.repository';
import { RequestsService } from './requests.service';

@Module({
  controllers: [RequestsController],
  imports: [PortalModule],
  providers: [RequestsRepository, RequestsService],
})
export class RequestsModule {}
