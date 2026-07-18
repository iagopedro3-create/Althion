'use server';

import {
  createQualityEvaluation,
  flagClinicalConversation,
  resolveClinicalFlag,
} from '@/lib/api/quality';
import { createClient } from '@/lib/supabase/server';

export interface ActionResponse {
  readonly ok: boolean;
  readonly error?: string;
}

export async function createEvaluationAction(input: {
  readonly organizationId: string;
  readonly clinicId: string;
  readonly conversationId: string;
  readonly rubricVersion: string;
  readonly scores: Record<string, number>;
  readonly feedback?: string;
  readonly idempotencyKey: string;
}): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { error: 'Sessão expirada. Faça login novamente.', ok: false };

  const { organizationId, clinicId, idempotencyKey, ...rest } = input;
  const result = await createQualityEvaluation(
    data.session.access_token,
    { clinicId, organizationId },
    rest,
    idempotencyKey,
  );

  if (result.kind === 'success') return { ok: true };
  if (result.kind === 'denied')
    return { error: 'Acesso negado para avaliar qualidade.', ok: false };
  if (result.kind === 'conflict')
    return { error: 'Esta conversa já foi avaliada com esta rubrica.', ok: false };
  if (result.kind === 'invalid') return { error: 'Valores de avaliação inválidos.', ok: false };
  return { error: 'Serviço de qualidade indisponível.', ok: false };
}

export async function flagConversationAction(input: {
  readonly organizationId: string;
  readonly clinicId: string;
  readonly conversationId: string;
  readonly flagReason: string;
  readonly idempotencyKey: string;
}): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { error: 'Sessão expirada. Faça login novamente.', ok: false };

  const { organizationId, clinicId, idempotencyKey, ...rest } = input;
  const result = await flagClinicalConversation(
    data.session.access_token,
    { clinicId, organizationId },
    rest,
    idempotencyKey,
  );

  if (result.kind === 'success') return { ok: true };
  if (result.kind === 'denied')
    return { error: 'Acesso negado para sinalizar conteúdo clínico.', ok: false };
  return { error: 'Serviço de qualidade indisponível.', ok: false };
}

export async function resolveClinicalFlagAction(input: {
  readonly organizationId: string;
  readonly clinicId: string;
  readonly flagId: string;
  readonly handoffNotes: string;
  readonly idempotencyKey: string;
}): Promise<ActionResponse> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { error: 'Sessão expirada. Faça login novamente.', ok: false };

  const { organizationId, clinicId, flagId, idempotencyKey, handoffNotes } = input;
  const result = await resolveClinicalFlag(
    data.session.access_token,
    { clinicId, organizationId },
    flagId,
    { handoffNotes },
    idempotencyKey,
  );

  if (result.kind === 'success') return { ok: true };
  if (result.kind === 'denied')
    return { error: 'Acesso negado para resolver flag clínico.', ok: false };
  if (result.kind === 'conflict')
    return { error: 'Este flag clínico já foi resolvido.', ok: false };
  return { error: 'Serviço de qualidade indisponível.', ok: false };
}
