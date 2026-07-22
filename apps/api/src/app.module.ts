import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { CapabilitiesGuard } from './common/auth/capabilities.guard';
import { MfaGuard } from './common/auth/mfa.guard';
import { RequestContextMiddleware } from './common/http/request-context.middleware';
import { ApiConfigModule } from './config/api-config.module';
import { ApiConfigService } from './config/api-config.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { CockpitModule } from './modules/cockpit/cockpit.module';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { ImprovementPlansModule } from './modules/improvement-plans/improvement-plans.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { PortalModule } from './modules/portal/portal.module';
import { RadarModule } from './modules/radar/radar.module';
import { RecoveryModule } from './modules/recovery/recovery.module';
import { RequestsModule } from './modules/requests/requests.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { QualityModule } from './modules/quality/quality.module';
import { GoogleAdsModule } from './modules/google-ads/google-ads.module';

@Module({
  imports: [
    ApiConfigModule,
    DatabaseModule,
    LoggerModule.forRootAsync({
      imports: [ApiConfigModule],
      inject: [ApiConfigService],
      useFactory: (config: ApiConfigService) => ({
        pinoHttp: {
          level: config.environment.LOG_LEVEL,
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.body.password',
              'req.body.token',
              'res.headers.set-cookie',
            ],
            remove: true,
          },
        },
      }),
    }),
    ThrottlerModule.forRoot([{ limit: 100, ttl: 60_000 }]),
    AuthModule,
    CockpitModule,
    HealthModule,
    ImprovementPlansModule,
    IntegrationsModule,
    PortalModule,
    RadarModule,
    RecoveryModule,
    RequestsModule,
    TenancyModule,
    QualityModule,
    GoogleAdsModule,
  ],
  providers: [
    { provide: APP_GUARD, useExisting: ThrottlerGuard },
    ThrottlerGuard,
    { provide: APP_GUARD, useExisting: JwtAuthGuard },
    { provide: APP_GUARD, useExisting: MfaGuard },
    MfaGuard,
    { provide: APP_GUARD, useExisting: CapabilitiesGuard },
    CapabilitiesGuard,
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
