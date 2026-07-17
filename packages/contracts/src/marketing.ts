import { z } from 'zod';

export const saveGoogleAdsCredentialsSchema = z.object({
  refresh_token: z.string().min(1, 'Token de refresh do Google Ads é obrigatório'),
  developer_token: z.string().min(1, 'Token de desenvolvedor (developer token) é obrigatório'),
  customer_id: z
    .string()
    .regex(/^[0-9-]+$/, 'Identificador de cliente do Google Ads deve conter apenas números e traços')
    .min(1, 'Identificador de cliente (Customer ID) é obrigatório'),
});

export const googleAdsClinicParamsSchema = z.object({
  organizationId: z.string().uuid('Identificador da organização inválido'),
  clinicId: z.string().uuid('Identificador da clínica inválido'),
});

export type SaveGoogleAdsCredentialsInput = z.infer<typeof saveGoogleAdsCredentialsSchema>;
