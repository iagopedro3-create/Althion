import { z } from 'zod';

export const diagnosisSchema = z.object({
  clinicName: z.string().trim().min(2).max(160),
  consent: z.literal(true, {
    message: 'É necessário aceitar os termos de consentimento para enviar.',
  }),
  dailyContactAverage: z.coerce.number().int().min(0).max(100_000),
  email: z.union([z.literal(''), z.email().max(160)]).optional(),
  mainDifficulty: z.string().trim().min(10).max(2_000),
  name: z.string().trim().min(2).max(120),
  professionalsCount: z.coerce.number().int().min(1).max(10_000),
  specialty: z.string().trim().min(2).max(120),
  website: z.string().max(120).optional(),
  whatsapp: z
    .string()
    .trim()
    .min(8)
    .max(40)
    .regex(/^[0-9+()\-\s]*$/, 'Informe um WhatsApp profissional válido.'),
});

export type DiagnosisInput = z.infer<typeof diagnosisSchema>;

export const DIAGNOSIS_CHANNEL_CONFIGURED = Boolean(
  process.env.SUPABASE_URL &&
  (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
);
