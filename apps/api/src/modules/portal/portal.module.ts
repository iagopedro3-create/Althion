import { Module } from '@nestjs/common';

import { RadarModule } from '../radar/radar.module';
import { PortalController } from './portal.controller';
import { PortalFeatureService } from './portal-feature.service';
import { PortalRepository } from './portal.repository';
import { PortalService } from './portal.service';

@Module({
  controllers: [PortalController],
  exports: [PortalFeatureService],
  imports: [RadarModule],
  providers: [PortalFeatureService, PortalRepository, PortalService],
})
export class PortalModule {}
