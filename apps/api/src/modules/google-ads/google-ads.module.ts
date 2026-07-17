import { Module } from '@nestjs/common';

import { GoogleAdsFeatureService } from './google-ads-feature.service';
import { GoogleAdsController } from './google-ads.controller';
import { GoogleAdsRepository } from './google-ads.repository';
import { GoogleAdsService } from './google-ads.service';

@Module({
  controllers: [GoogleAdsController],
  providers: [GoogleAdsFeatureService, GoogleAdsRepository, GoogleAdsService],
  exports: [GoogleAdsService],
})
export class GoogleAdsModule {}
