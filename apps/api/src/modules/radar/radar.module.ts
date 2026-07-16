import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { RadarController } from './radar.controller';
import { RadarRepository } from './radar.repository';
import { RadarService } from './radar.service';

@Module({
  controllers: [RadarController],
  imports: [DatabaseModule],
  providers: [RadarRepository, RadarService],
})
export class RadarModule {}
