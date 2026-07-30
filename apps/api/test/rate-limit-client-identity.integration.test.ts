import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import 'reflect-metadata';
import request from 'supertest';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';

const CLIENT = '203.0.113.7';
const OTHER_CLIENT = '203.0.113.8';
/** Mesmo teto configurado em `app.module.ts`. */
const REQUESTS_PER_MINUTE = 100;
/** Rota pública: isola o rate limit de qualquer efeito de autenticação. */
const PROBE_ROUTE = '/health/live';

/**
 * Sobe o `AppModule` real — não um módulo de mentira — porque o que se prova
 * aqui é o arranjo de produção: `ClientIdentityThrottlerGuard` como `APP_GUARD`
 * somado ao `trust proxy` que `configureApplication` aplica.
 */
async function bootstrap(trustProxyHops: number): Promise<INestApplication> {
  const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = module.createNestApplication();

  if (trustProxyHops > 0) {
    const server = app.getHttpAdapter().getInstance() as {
      set: (setting: string, value: unknown) => unknown;
    };
    server.set('trust proxy', trustProxyHops);
  }

  await app.init();
  return app;
}

async function exhaustBudget(app: INestApplication, client: string): Promise<void> {
  for (let attempt = 0; attempt < REQUESTS_PER_MINUTE; attempt += 1) {
    await request(app.getHttpServer()).get(PROBE_ROUTE).set('X-Forwarded-For', client).expect(200);
  }
}

describe('rate limit client identity behind a proxy', () => {
  let app: INestApplication | undefined;

  beforeAll(() => {
    process.env.API_HOST = '127.0.0.1';
    process.env.API_PORT = '4000';
    process.env.CORS_ORIGINS = 'http://127.0.0.1:3000';
    process.env.LOG_LEVEL = 'fatal';
    process.env.NODE_ENV = 'test';
    process.env.SUPABASE_JWT_AUDIENCE = 'authenticated';
    process.env.SUPABASE_JWT_ISSUER = 'http://127.0.0.1:54321/auth/v1';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key-not-secret';
    process.env.SUPABASE_URL = 'http://127.0.0.1:54321';
  });

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it('gives each forwarded client its own budget when a proxy hop is trusted', async () => {
    app = await bootstrap(1);
    await exhaustBudget(app, CLIENT);

    // O cliente ruidoso esgota a própria cota...
    const blocked = await request(app.getHttpServer())
      .get(PROBE_ROUTE)
      .set('X-Forwarded-For', CLIENT)
      .expect(429);
    expect(blocked.headers['retry-after']).toBeDefined();

    // ...e ninguém mais é afetado por isso.
    await request(app.getHttpServer())
      .get(PROBE_ROUTE)
      .set('X-Forwarded-For', OTHER_CLIENT)
      .expect(200);
  }, 60_000);

  it('collapses every client into one budget when no proxy hop is trusted', async () => {
    // Este é o defeito que o incremento corrige: sem `trust proxy`, o endereço
    // observado é sempre o do proxy, então um cliente derruba os outros. Fixar
    // o comportamento aqui torna a regressão detectável — se um deploy futuro
    // esquecer `TRUST_PROXY_HOPS`, este teste continua descrevendo o que
    // acontece de verdade.
    app = await bootstrap(0);
    await exhaustBudget(app, CLIENT);

    await request(app.getHttpServer())
      .get(PROBE_ROUTE)
      .set('X-Forwarded-For', OTHER_CLIENT)
      .expect(429);
  }, 60_000);
});
