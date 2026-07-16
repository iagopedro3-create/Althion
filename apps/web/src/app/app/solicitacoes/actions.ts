'use server';

import {
  createRequestSchema,
  portalClinicParamsSchema,
  requestTransitionSchema,
} from '@althion/contracts';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createPortalRequest, transitionPortalRequest } from '@/lib/api/portal';
import { createClient } from '@/lib/supabase/server';

const createActionSchema = portalClinicParamsSchema.extend({
  ...createRequestSchema.shape,
  idempotencyKey: z.uuid(),
});
const transitionActionSchema = portalClinicParamsSchema.extend({
  idempotencyKey: z.uuid(),
  requestId: z.uuid(),
  ...requestTransitionSchema.shape,
});

export interface PortalActionResult {
  readonly error?: string;
  readonly id?: string;
  readonly ok: boolean;
}

export async function createRequestAction(value: unknown): Promise<PortalActionResult> {
  const parsed = createActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Revise os campos da solicitação.', ok: false };
  const { clinicId, idempotencyKey, organizationId, ...input } = parsed.data;
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { error: 'Sua sessão expirou.', ok: false };
  const result = await createPortalRequest(
    data.session.access_token,
    { clinicId, organizationId },
    input,
    idempotencyKey,
  );
  if (result.kind !== 'success') return { error: mutationMessage(result.kind), ok: false };
  revalidatePath('/app');
  revalidatePath('/app/solicitacoes');
  return { id: result.data.id, ok: true };
}

export async function transitionRequestAction(value: unknown): Promise<PortalActionResult> {
  const parsed = transitionActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Transição inválida.', ok: false };
  const { clinicId, idempotencyKey, organizationId, requestId, ...input } = parsed.data;
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { error: 'Sua sessão expirou.', ok: false };
  const result = await transitionPortalRequest(
    data.session.access_token,
    { clinicId, organizationId },
    requestId,
    input,
    idempotencyKey,
  );
  if (result.kind !== 'success') return { error: mutationMessage(result.kind), ok: false };
  revalidatePath('/app');
  revalidatePath('/app/solicitacoes');
  revalidatePath(`/app/solicitacoes/${requestId}`);
  return { id: result.data.id, ok: true };
}

function mutationMessage(kind: string): string {
  const messages: Record<string, string> = {
    conflict: 'O registro mudou. Atualize a página antes de tentar novamente.',
    denied: 'Seu perfil não possui permissão para esta ação.',
    invalid: 'Os dados informados não são válidos.',
    not_found: 'A solicitação não está mais disponível.',
    unavailable: 'Não foi possível concluir agora. Tente novamente.',
  };
  return messages[kind] ?? messages.unavailable!;
}
