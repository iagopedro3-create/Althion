'use server';

import { saveGoogleAdsCredentials, syncGoogleAds } from '@/lib/api/google-ads';
import { createClient } from '@/lib/supabase/server';

export interface ActionResponse {
  readonly ok: boolean;
  readonly error?: string;
}

export async function saveCredentialsAction(input: {
  readonly organizationId: string;
  readonly clinicId: string;
  readonly refresh_token: string;
  readonly developer_token: string;
  readonly customer_id: string;
  readonly idempotencyKey: string;
}): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { error: 'Sessão expirada. Faça login novamente.', ok: false };

  const { organizationId, clinicId, idempotencyKey, ...rest } = input;
  const result = await saveGoogleAdsCredentials(
    data.session.access_token,
    { clinicId, organizationId },
    rest,
    idempotencyKey,
  );

  if (result.kind === 'success') return { ok: true };
  if (result.kind === 'denied') return { error: 'Acesso negado para salvar credenciais.', ok: false };
  if (result.kind === 'invalid') return { error: 'Formato de credenciais inválido.', ok: false };
  return { error: 'Serviço do Google Ads indisponível.', ok: false };
}

export async function syncGoogleAdsAction(input: {
  readonly organizationId: string;
  readonly clinicId: string;
  readonly idempotencyKey: string;
}): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { error: 'Sessão expirada. Faça login novamente.', ok: false };

  const { organizationId, clinicId, idempotencyKey } = input;
  const result = await syncGoogleAds(
    data.session.access_token,
    { clinicId, organizationId },
    idempotencyKey,
  );

  if (result.kind === 'success') return { ok: true };
  if (result.kind === 'denied') return { error: 'Acesso negado para sincronizar.', ok: false };
  return { error: 'Serviço do Google Ads indisponível.', ok: false };
}
