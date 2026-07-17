import { Module } from '@nestjs/common';

import { QualityFeatureService } from './quality-feature.service';
import { QualityController } from './quality.controller';
import { QualityRepository } from './quality.repository';
import { QualityService } from './quality.service';

@Module({
  controllers: [QualityController],
  providers: [QualityFeatureService, QualityRepository, QualityService],
  exports: [QualityService],
})
export class QualityModule {}
