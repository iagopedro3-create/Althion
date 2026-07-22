import { z } from 'zod';

export const saveGoogleAdsCredentialsSchema = z.object({
  refresh_token: z
    .string()
    .startsWith('mock_', 'Somente tokens sintéticos de sandbox são aceitos nesta fase')
    .max(512, 'Token sintético excede o tamanho permitido'),
  developer_token: z
    .string()
    .startsWith('mock_', 'Somente tokens sintéticos de sandbox são aceitos nesta fase')
    .max(512, 'Token sintético excede o tamanho permitido'),
  customer_id: z
    .string()
    .regex(
      /^[0-9-]+$/,
      'Identificador de cliente do Google Ads deve conter apenas números e traços',
    )
    .min(1, 'Identificador de cliente (Customer ID) é obrigatório')
    .max(64, 'Identificador de cliente excede o tamanho permitido'),
});

export const googleAdsClinicParamsSchema = z.object({
  organizationId: z.string().uuid('Identificador da organização inválido'),
  clinicId: z.string().uuid('Identificador da clínica inválido'),
});

export type SaveGoogleAdsCredentialsInput = z.infer<typeof saveGoogleAdsCredentialsSchema>;
