import { Module } from '@nestjs/common';

import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtVerifierService } from './jwt-verifier.service';
import { MeController } from './me.controller';
import { PrincipalRepository } from './principal.repository';
import { PrincipalService } from './principal.service';

@Module({
  controllers: [MeController],
  exports: [JwtAuthGuard, PrincipalService],
  providers: [JwtAuthGuard, JwtVerifierService, PrincipalRepository, PrincipalService],
})
export class AuthModule {}
