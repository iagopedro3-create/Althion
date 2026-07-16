import { z, type ZodType } from 'zod';

export const httpUrlSchema = z.url().refine((value) => value.startsWith('http'), {
  message: 'A URL must use http or https',
});

export function parseEnvironment<T>(schema: ZodType<T>, source: NodeJS.ProcessEnv): T {
  const result = schema.safeParse(source);

  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join('.')).filter(Boolean);
    throw new Error(`Invalid environment configuration: ${[...new Set(fields)].join(', ')}`);
  }

  return result.data;
}
