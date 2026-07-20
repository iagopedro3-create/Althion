import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';
import { ApiConfigService } from '../src/config/api-config.service';
import { configureApplication } from '../src/configure-application';

describe('API foundation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.API_HOST = '127.0.0.1';
    process.env.API_PORT = '4000';
    process.env.CORS_ORIGINS = 'http://127.0.0.1:3000';
    process.env.LOG_LEVEL = 'fatal';
    process.env.NODE_ENV = 'test';
    process.env.SUPABASE_JWT_AUDIENCE = 'authenticated';
    process.env.SUPABASE_JWT_ISSUER = 'http://127.0.0.1:54321/auth/v1';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key-not-secret';
    process.env.SUPABASE_URL = 'http://127.0.0.1:54321';

    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    configureApplication(app, app.get(ApiConfigService));
    await app.init();
  }, 30_000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('exposes a public liveness endpoint', async () => {
    const response = await request(app.getHttpServer()).get('/health/live').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-request-id']).toBeTypeOf('string');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('allows preflight only for configured browser origins', async () => {
    const allowed = await request(app.getHttpServer())
      .options('/health/live')
      .set('Access-Control-Request-Method', 'GET')
      .set('Origin', 'http://127.0.0.1:3000')
      .expect(204);

    expect(allowed.headers['access-control-allow-origin']).toBe('http://127.0.0.1:3000');

    const denied = await request(app.getHttpServer())
      .options('/health/live')
      .set('Access-Control-Request-Method', 'GET')
      .set('Origin', 'https://attacker.example')
      .expect(204);

    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects protected endpoints without a bearer token', async () => {
    await request(app.getHttpServer()).get('/api/v1/me').expect(401);
    await request(app.getHttpServer())
      .get(
        '/api/v1/organizations/10000000-0000-4000-8000-000000000001/clinics/20000000-0000-4000-8000-000000000001/radar-assessments',
      )
      .expect(401);
    await request(app.getHttpServer())
      .get(
        '/api/v1/organizations/10000000-0000-4000-8000-000000000001/clinics/20000000-0000-4000-8000-000000000001/portal/dashboard',
      )
      .expect(401);
    await request(app.getHttpServer())
      .get(
        '/api/v1/organizations/10000000-0000-4000-8000-000000000001/clinics/20000000-0000-4000-8000-000000000001/google-ads/credentials',
      )
      .expect(401);
  });
});
