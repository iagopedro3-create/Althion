'use server';

import {
  createSuppressionSchema,
  recoveryActionDecisionSchema,
  recoveryClinicParamsSchema,
  recoveryOpportunityDecisionSchema,
} from '@althion/contracts';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  createRecoverySuppression,
  decideRecoveryAction,
  decideRecoveryOpportunity,
  revokeRecoverySuppression,
  runRecoverySimulation,
} from '@/lib/api/recovery';
import { createClient } from '@/lib/supabase/server';

const simulateActionSchema = recoveryClinicParamsSchema.extend({ idempotencyKey: z.uuid() });
const opportunityActionSchema = recoveryClinicParamsSchema.extend({
  idempotencyKey: z.uuid(),
  opportunityId: z.uuid(),
  ...recoveryOpportunityDecisionSchema.shape,
});
const actionDecisionActionSchema = recoveryClinicParamsSchema.extend({
  actionId: z.uuid(),
  idempotencyKey: z.uuid(),
  ...recoveryActionDecisionSchema.shape,
});
const suppressionActionSchema = recoveryClinicParamsSchema.extend({
  ...createSuppressionSchema.shape,
  idempotencyKey: z.uuid(),
});
const revokeActionSchema = recoveryClinicParamsSchema.extend({
  idempotencyKey: z.uuid(),
  suppressionId: z.uuid(),
});

export interface RecoveryActionResult {
  readonly error?: string;
  readonly id?: string;
  readonly ok: boolean;
}

async function sessionToken(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function simulateRecoveryAction(value: unknown): Promise<RecoveryActionResult> {
  const parsed = simulateActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Contexto inválido.', ok: false };
  const { clinicId, idempotencyKey, organizationId } = parsed.data;
  const token = await sessionToken();
  if (!token) return { error: 'Sua sessão expirou.', ok: false };
  const result = await runRecoverySimulation(token, { clinicId, organizationId }, idempotencyKey);
  if (result.kind !== 'success') return { error: mutationMessage(result.kind), ok: false };
  revalidatePath('/cockpit/recovery');
  return { id: result.data.id, ok: true };
}

export async function decideOpportunityAction(value: unknown): Promise<RecoveryActionResult> {
  const parsed = opportunityActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Decisão inválida.', ok: false };
  const { clinicId, idempotencyKey, opportunityId, organizationId, ...input } = parsed.data;
  const token = await sessionToken();
  if (!token) return { error: 'Sua sessão expirou.', ok: false };
  const result = await decideRecoveryOpportunity(
    token,
    { clinicId, organizationId },
    opportunityId,
    input,
    idempotencyKey,
  );
  if (result.kind !== 'success') return { error: mutationMessage(result.kind), ok: false };
  revalidatePath('/cockpit/recovery');
  return { id: result.data.id, ok: true };
}

export async function decideActionAction(value: unknown): Promise<RecoveryActionResult> {
  const parsed = actionDecisionActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Decisão inválida.', ok: false };
  const { actionId, clinicId, idempotencyKey, organizationId, ...input } = parsed.data;
  const token = await sessionToken();
  if (!token) return { error: 'Sua sessão expirou.', ok: false };
  const result = await decideRecoveryAction(
    token,
    { clinicId, organizationId },
    actionId,
    input,
    idempotencyKey,
  );
  if (result.kind !== 'success') return { error: mutationMessage(result.kind), ok: false };
  revalidatePath('/cockpit/recovery');
  return { id: result.data.id, ok: true };
}

export async function createSuppressionAction(value: unknown): Promise<RecoveryActionResult> {
  const parsed = suppressionActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Revise os campos da supressão.', ok: false };
  const { clinicId, idempotencyKey, organizationId, ...input } = parsed.data;
  const token = await sessionToken();
  if (!token) return { error: 'Sua sessão expirou.', ok: false };
  const result = await createRecoverySuppression(
    token,
    { clinicId, organizationId },
    input,
    idempotencyKey,
  );
  if (result.kind !== 'success') return { error: mutationMessage(result.kind), ok: false };
  revalidatePath('/cockpit/recovery');
  return { id: result.data.id, ok: true };
}

export async function revokeSuppressionAction(value: unknown): Promise<RecoveryActionResult> {
  const parsed = revokeActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Supressão inválida.', ok: false };
  const { clinicId, idempotencyKey, organizationId, suppressionId } = parsed.data;
  const token = await sessionToken();
  if (!token) return { error: 'Sua sessão expirou.', ok: false };
  const result = await revokeRecoverySuppression(
    token,
    { clinicId, organizationId },
    suppressionId,
    idempotencyKey,
  );
  if (result.kind !== 'success') return { error: mutationMessage(result.kind), ok: false };
  revalidatePath('/cockpit/recovery');
  return { id: result.data.id, ok: true };
}

function mutationMessage(kind: string): string {
  const messages: Record<string, string> = {
    conflict: 'O registro mudou ou expirou. Atualize a página antes de tentar novamente.',
    denied: 'Seu perfil não possui permissão para esta ação.',
    invalid: 'Os dados informados não são válidos.',
    not_found: 'O registro não está mais disponível.',
    unavailable: 'Não foi possível concluir agora. Tente novamente.',
  };
  return messages[kind] ?? messages.unavailable!;
}
