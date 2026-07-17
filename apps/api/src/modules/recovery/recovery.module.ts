import { Module } from '@nestjs/common';

import { IntegrationsModule } from '../integrations/integrations.module';
import { RecoveryFeatureService } from './recovery-feature.service';
import { RecoveryController } from './recovery.controller';
import { RecoveryRepository } from './recovery.repository';
import { RecoveryService } from './recovery.service';

@Module({
  controllers: [RecoveryController],
  imports: [IntegrationsModule],
  providers: [RecoveryFeatureService, RecoveryRepository, RecoveryService],
})
export class RecoveryModule {}
