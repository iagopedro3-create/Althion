'use server';

import {
  createImprovementPlanSchema,
  createTaskSchema,
  improvementPlanTransitionSchema,
  portalClinicParamsSchema,
  taskTransitionSchema,
} from '@althion/contracts';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  createImprovementPlan,
  createPortalTask,
  transitionImprovementPlan,
  transitionPortalTask,
} from '@/lib/api/portal';
import { createClient } from '@/lib/supabase/server';

import type { PortalActionResult } from '../solicitacoes/actions';

const planActionSchema = portalClinicParamsSchema.extend({
  ...createImprovementPlanSchema.shape,
  idempotencyKey: z.uuid(),
});
const planTransitionActionSchema = portalClinicParamsSchema.extend({
  idempotencyKey: z.uuid(),
  planId: z.uuid(),
  ...improvementPlanTransitionSchema.shape,
});
const taskActionSchema = portalClinicParamsSchema.extend({
  idempotencyKey: z.uuid(),
  planId: z.uuid(),
  ...createTaskSchema.shape,
});
const taskTransitionActionSchema = portalClinicParamsSchema.extend({
  idempotencyKey: z.uuid(),
  taskId: z.uuid(),
  ...taskTransitionSchema.shape,
});

export async function createPlanAction(value: unknown): Promise<PortalActionResult> {
  const parsed = planActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Revise os dados do plano.', ok: false };
  const { clinicId, idempotencyKey, organizationId, ...input } = parsed.data;
  return run((token) =>
    createImprovementPlan(token, { clinicId, organizationId }, input, idempotencyKey),
  );
}

export async function transitionPlanAction(value: unknown): Promise<PortalActionResult> {
  const parsed = planTransitionActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Transição de plano inválida.', ok: false };
  const { clinicId, idempotencyKey, organizationId, planId, ...input } = parsed.data;
  return run((token) =>
    transitionImprovementPlan(token, { clinicId, organizationId }, planId, input, idempotencyKey),
  );
}

export async function createTaskAction(value: unknown): Promise<PortalActionResult> {
  const parsed = taskActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Revise os dados da tarefa.', ok: false };
  const { clinicId, idempotencyKey, organizationId, planId, ...input } = parsed.data;
  return run((token) =>
    createPortalTask(token, { clinicId, organizationId }, planId, input, idempotencyKey),
  );
}

export async function transitionTaskAction(value: unknown): Promise<PortalActionResult> {
  const parsed = taskTransitionActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Transição de tarefa inválida.', ok: false };
  const { clinicId, idempotencyKey, organizationId, taskId, ...input } = parsed.data;
  return run((token) =>
    transitionPortalTask(token, { clinicId, organizationId }, taskId, input, idempotencyKey),
  );
}

async function run(
  operation: (
    token: string,
  ) => Promise<
    | { data: { id: string; status: string }; kind: 'success' }
    | { kind: 'conflict' | 'denied' | 'invalid' | 'not_found' | 'unavailable' }
  >,
): Promise<PortalActionResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { error: 'Sua sessão expirou.', ok: false };
  const result = await operation(data.session.access_token);
  if (result.kind !== 'success') {
    return {
      error:
        result.kind === 'conflict'
          ? 'O registro mudou. Atualize a página antes de tentar novamente.'
          : result.kind === 'denied'
            ? 'Seu perfil não possui permissão para esta ação.'
            : 'Não foi possível concluir a ação.',
      ok: false,
    };
  }
  revalidatePath('/app');
  revalidatePath('/app/plano-de-melhoria');
  return { id: result.data.id, ok: true };
}
