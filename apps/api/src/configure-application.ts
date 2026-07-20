import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { ApiExceptionFilter } from './common/http/api-exception.filter';
import type { ApiConfigService } from './config/api-config.service';

export function configureApplication(app: INestApplication, config: ApiConfigService): void {
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors({
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: config.environment.CORS_ORIGINS,
  });
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();
}
