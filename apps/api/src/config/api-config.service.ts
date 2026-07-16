import { parseEnvironment } from '@althion/config';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

const apiEnvironmentSchema = z.object({
  API_HOST: z.string().min(1).default('127.0.0.1'),
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  CORS_ORIGINS: z
    .string()
    .default('http://127.0.0.1:3000')
    .transform((value) => value.split(',').map((origin) => origin.trim()))
    .pipe(z.array(z.url()).min(1)),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SUPABASE_JWT_AUDIENCE: z.string().min(1).default('authenticated'),
  SUPABASE_JWT_ISSUER: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  SUPABASE_URL: z.url(),
});

export type ApiEnvironment = z.infer<typeof apiEnvironmentSchema>;

@Injectable()
export class ApiConfigService {
  public readonly environment: ApiEnvironment;

  public constructor() {
    this.environment = parseEnvironment(apiEnvironmentSchema, process.env);
  }

  public get jwksUrl(): URL {
    return new URL('/auth/v1/.well-known/jwks.json', this.environment.SUPABASE_URL);
  }
}
