import { Module } from '@nestjs/common';

import { PortalModule } from '../portal/portal.module';
import { ImprovementPlansController, PortalTasksController } from './improvement-plans.controller';
import { ImprovementPlansRepository } from './improvement-plans.repository';
import { ImprovementPlansService } from './improvement-plans.service';

@Module({
  controllers: [ImprovementPlansController, PortalTasksController],
  imports: [PortalModule],
  providers: [ImprovementPlansRepository, ImprovementPlansService],
})
export class ImprovementPlansModule {}
