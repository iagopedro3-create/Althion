import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';

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
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('exposes a public liveness endpoint', async () => {
    const response = await request(app.getHttpServer()).get('/health/live').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-request-id']).toBeTypeOf('string');
  });

  it('rejects protected endpoints without a bearer token', async () => {
    await request(app.getHttpServer()).get('/api/v1/me').expect(401);
    await request(app.getHttpServer())
      .get(
        '/api/v1/organizations/10000000-0000-4000-8000-000000000001/clinics/20000000-0000-4000-8000-000000000001/radar-assessments',
      )
      .expect(401);
  });
});
