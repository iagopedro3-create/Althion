import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { ApiExceptionFilter } from './common/http/api-exception.filter';
import type { ApiConfigService } from './config/api-config.service';

/** Adaptador HTTP que aceita configuração no estilo do Express. */
interface ConfigurableHttpServer {
  set?: (setting: string, value: unknown) => unknown;
}

/**
 * Rate limit agregado é pior que rate limit nenhum: um cliente ruidoso derruba
 * todos os outros. Só há motivo para avisar quando existe um proxy real à
 * frente — em desenvolvimento a API é acessada direto.
 */
export function warnsAboutAggregatedRateLimit(
  nodeEnv: 'development' | 'test' | 'production',
  trustProxyHops: number,
): boolean {
  return nodeEnv === 'production' && trustProxyHops === 0;
}

export function configureApplication(app: INestApplication, config: ApiConfigService): void {
  const logger = app.get(Logger);
  app.useLogger(logger);

  // O Express só deriva `req.ip`/`req.ips` do `X-Forwarded-For` quando confia
  // no proxy. Sem isto, o throttler identifica todos os clientes pelo endereço
  // do proxy e o limite vira um teto agregado da API inteira.
  const { NODE_ENV, TRUST_PROXY_HOPS } = config.environment;
  if (TRUST_PROXY_HOPS > 0) {
    const server = app.getHttpAdapter().getInstance() as ConfigurableHttpServer;
    server.set?.('trust proxy', TRUST_PROXY_HOPS);
  }

  if (warnsAboutAggregatedRateLimit(NODE_ENV, TRUST_PROXY_HOPS)) {
    logger.warn(
      'TRUST_PROXY_HOPS=0 em produção: o rate limit contará todos os clientes num balde só. ' +
        'Atrás da Vercel, defina TRUST_PROXY_HOPS=1.',
    );
  }

  app.use(helmet());
  app.enableCors({
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: config.environment.CORS_ORIGINS,
  });
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();
}
