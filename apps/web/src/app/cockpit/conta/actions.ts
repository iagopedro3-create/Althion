'use server';

import {
  cockpitClinicParamsSchema,
  createIncidentSchema,
  createMeetingSchema,
  incidentTransitionSchema,
  meetingTransitionSchema,
} from '@althion/contracts';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  createCockpitIncident,
  createCockpitMeeting,
  transitionCockpitIncident,
  transitionCockpitMeeting,
} from '@/lib/api/cockpit';
import { createClient } from '@/lib/supabase/server';

const createIncidentActionSchema = cockpitClinicParamsSchema.extend({
  ...createIncidentSchema.shape,
  idempotencyKey: z.uuid(),
});
const incidentTransitionActionSchema = cockpitClinicParamsSchema.extend({
  idempotencyKey: z.uuid(),
  incidentId: z.uuid(),
  ...incidentTransitionSchema.shape,
});
const createMeetingActionSchema = cockpitClinicParamsSchema.extend({
  ...createMeetingSchema.shape,
  idempotencyKey: z.uuid(),
});
const meetingTransitionActionSchema = cockpitClinicParamsSchema.extend({
  idempotencyKey: z.uuid(),
  meetingId: z.uuid(),
  ...meetingTransitionSchema.shape,
});

export interface CockpitActionResult {
  readonly error?: string;
  readonly id?: string;
  readonly ok: boolean;
}

async function sessionToken(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function createIncidentAction(value: unknown): Promise<CockpitActionResult> {
  const parsed = createIncidentActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Revise os campos do incidente.', ok: false };
  const { clinicId, idempotencyKey, organizationId, ...input } = parsed.data;
  const token = await sessionToken();
  if (!token) return { error: 'Sua sessão expirou.', ok: false };
  const result = await createCockpitIncident(
    token,
    { clinicId, organizationId },
    input,
    idempotencyKey,
  );
  if (result.kind !== 'success') return { error: mutationMessage(result.kind), ok: false };
  revalidatePath('/cockpit');
  revalidatePath('/cockpit/conta');
  return { id: result.data.id, ok: true };
}

export async function transitionIncidentAction(value: unknown): Promise<CockpitActionResult> {
  const parsed = incidentTransitionActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Transição inválida.', ok: false };
  const { clinicId, idempotencyKey, incidentId, organizationId, ...input } = parsed.data;
  const token = await sessionToken();
  if (!token) return { error: 'Sua sessão expirou.', ok: false };
  const result = await transitionCockpitIncident(
    token,
    { clinicId, organizationId },
    incidentId,
    input,
    idempotencyKey,
  );
  if (result.kind !== 'success') return { error: mutationMessage(result.kind), ok: false };
  revalidatePath('/cockpit');
  revalidatePath('/cockpit/conta');
  return { id: result.data.id, ok: true };
}

export async function createMeetingAction(value: unknown): Promise<CockpitActionResult> {
  const parsed = createMeetingActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Revise os campos da reunião.', ok: false };
  const { clinicId, idempotencyKey, organizationId, ...input } = parsed.data;
  const token = await sessionToken();
  if (!token) return { error: 'Sua sessão expirou.', ok: false };
  const result = await createCockpitMeeting(
    token,
    { clinicId, organizationId },
    input,
    idempotencyKey,
  );
  if (result.kind !== 'success') return { error: mutationMessage(result.kind), ok: false };
  revalidatePath('/cockpit');
  revalidatePath('/cockpit/conta');
  return { id: result.data.id, ok: true };
}

export async function transitionMeetingAction(value: unknown): Promise<CockpitActionResult> {
  const parsed = meetingTransitionActionSchema.safeParse(value);
  if (!parsed.success) return { error: 'Transição inválida.', ok: false };
  const { clinicId, idempotencyKey, meetingId, organizationId, ...input } = parsed.data;
  const token = await sessionToken();
  if (!token) return { error: 'Sua sessão expirou.', ok: false };
  const result = await transitionCockpitMeeting(
    token,
    { clinicId, organizationId },
    meetingId,
    input,
    idempotencyKey,
  );
  if (result.kind !== 'success') return { error: mutationMessage(result.kind), ok: false };
  revalidatePath('/cockpit');
  revalidatePath('/cockpit/conta');
  return { id: result.data.id, ok: true };
}

function mutationMessage(kind: string): string {
  const messages: Record<string, string> = {
    conflict: 'O registro mudou. Atualize a página antes de tentar novamente.',
    denied: 'Seu perfil não possui permissão para esta ação.',
    invalid: 'Os dados informados não são válidos.',
    not_found: 'O registro não está mais disponível.',
    unavailable: 'Não foi possível concluir agora. Tente novamente.',
  };
  return messages[kind] ?? messages.unavailable!;
}
