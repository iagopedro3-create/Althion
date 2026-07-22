import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ApiConfigService } from './config/api-config.service';
import { configureApplication } from './configure-application';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ApiConfigService);

  configureApplication(app, config);

  await app.listen(config.environment.API_PORT, config.environment.API_HOST);
}

void bootstrap();
