import { Module } from '@nestjs/common';

import { CockpitFeatureService } from './cockpit-feature.service';
import { CockpitController } from './cockpit.controller';
import { CockpitRepository } from './cockpit.repository';
import { CockpitService } from './cockpit.service';
import { IncidentsController } from './incidents.controller';
import { MeetingsController } from './meetings.controller';

@Module({
  controllers: [CockpitController, IncidentsController, MeetingsController],
  providers: [CockpitFeatureService, CockpitRepository, CockpitService],
})
export class CockpitModule {}
