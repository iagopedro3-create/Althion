import { z } from 'zod';

const publicConfigSchema = z.object({
  publishableKey: z.string().min(20),
  url: z.url(),
});

export function getSupabasePublicConfig() {
  const result = publicConfigSchema.safeParse({
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  if (!result.success) {
    throw new Error('Supabase public configuration is missing');
  }

  return result.data;
}
