import { z } from 'zod';

// Formulário de contato comercial (B2B) do site público. Sem PII de paciente.
// Governança pendente de aprovação jurídica; ver docs/plans/site-institucional.md.
export const contactSchema = z.object({
  clinic: z.string().trim().min(2).max(160),
  consent: z.literal(true, { message: 'É necessário concordar com o uso dos dados para contato.' }),
  email: z.email().max(160),
  message: z.string().trim().max(1_000).optional(),
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[0-9+()\-\s]*$/)
    .optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

// Enquanto o destino do lead e a base legal não forem aprovados, o canal fica desligado:
// nada é persistido nem encaminhado. [DESTINO DO LEAD E BASE LEGAL A APROVAR]
export const CONTACT_CHANNEL_CONFIGURED = false;
