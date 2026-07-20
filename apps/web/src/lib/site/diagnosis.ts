import { z } from 'zod';

export const diagnosisSchema = z.object({
  avgResponseTime: z.string().trim().min(1).max(80),
  city: z.string().trim().min(2).max(120),
  clinicName: z.string().trim().min(2).max(160),
  consent: z.literal(true, {
    message: 'É necessário aceitar os termos de consentimento para enviar.',
  }),
  email: z.email().max(160),
  investsAds: z.enum(['sim', 'nao']),
  mainChannel: z.enum(['whatsapp', 'redes', 'site', 'indicacao']),
  mainDifficulty: z.string().trim().min(2).max(1_000),
  monthlyContacts: z.string().trim().min(1).max(40),
  name: z.string().trim().min(2).max(120),
  professionalsCount: z.string().trim().min(1).max(40),
  role: z.string().trim().min(2).max(120),
  specialty: z.string().trim().min(2).max(120),
  website: z.string().max(0).optional(),
  whatsapp: z
    .string()
    .trim()
    .min(8)
    .max(40)
    .regex(/^[0-9+()\-\s]*$/, 'Informe um WhatsApp profissional válido.'),
});

export type DiagnosisInput = z.infer<typeof diagnosisSchema>;

// O canal permanece desligado até destino, retenção, base legal e antiabuso serem aprovados.
export const DIAGNOSIS_CHANNEL_CONFIGURED = false;
