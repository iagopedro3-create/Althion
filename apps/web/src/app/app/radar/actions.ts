'use server';

import { radarAssessmentInputSchema } from '@althion/contracts';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const contextSchema = z.object({ clinicId: z.uuid(), organizationId: z.uuid() });
const assessmentIdSchema = z.uuid();

export type RadarActionResult =
  | { readonly id: string; readonly kind: 'success' }
  | { readonly kind: 'denied' | 'invalid' | 'unavailable'; readonly message: string };

async function accessToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function command(
  path: string,
  method: 'PATCH' | 'POST',
  body: unknown,
  includeIdempotency: boolean,
): Promise<RadarActionResult> {
  const token = await accessToken();
  const apiUrl = process.env.ALTHION_API_URL;
  if (!token) return { kind: 'denied', message: 'Sua sessão expirou. Entre novamente.' };
  if (!apiUrl) return { kind: 'unavailable', message: 'A API ainda não está configurada.' };

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(includeIdempotency ? { 'Idempotency-Key': crypto.randomUUID() } : {}),
      },
      method,
    });
    if (response.status === 401 || response.status === 403) {
      return { kind: 'denied', message: 'Você não possui permissão para esta ação.' };
    }
    if (!response.ok) {
      return { kind: 'unavailable', message: 'Não foi possível salvar o diagnóstico agora.' };
    }
    const result = z
      .object({ id: z.uuid().optional(), scoreId: z.uuid().optional() })
      .safeParse(await response.json());
    const id = result.success ? (result.data.id ?? result.data.scoreId) : undefined;
    if (!id) return { kind: 'unavailable', message: 'A API retornou uma resposta inválida.' };
    revalidatePath('/app/radar');
    revalidatePath('/app/score');
    return { id, kind: 'success' };
  } catch {
    return { kind: 'unavailable', message: 'Não foi possível conectar à API.' };
  }
}

export async function createRadarDraft(
  organizationId: string,
  clinicId: string,
  input: unknown,
): Promise<RadarActionResult> {
  const context = contextSchema.safeParse({ clinicId, organizationId });
  const parsed = radarAssessmentInputSchema.safeParse(input);
  if (!context.success || !parsed.success) {
    return { kind: 'invalid', message: 'Revise os campos destacados antes de continuar.' };
  }
  return command(
    `/api/v1/organizations/${organizationId}/clinics/${clinicId}/radar-assessments`,
    'POST',
    parsed.data,
    true,
  );
}

export async function updateRadarDraft(
  organizationId: string,
  clinicId: string,
  assessmentId: string,
  input: unknown,
): Promise<RadarActionResult> {
  const context = contextSchema.safeParse({ clinicId, organizationId });
  const id = assessmentIdSchema.safeParse(assessmentId);
  const parsed = radarAssessmentInputSchema.safeParse(input);
  if (!context.success || !id.success || !parsed.success) {
    return { kind: 'invalid', message: 'Revise os campos destacados antes de continuar.' };
  }
  return command(
    `/api/v1/organizations/${organizationId}/clinics/${clinicId}/radar-assessments/${assessmentId}`,
    'PATCH',
    parsed.data,
    false,
  ).then((result) => (result.kind === 'success' ? { ...result, id: assessmentId } : result));
}

export async function submitRadarAssessment(
  organizationId: string,
  clinicId: string,
  assessmentId: string,
): Promise<RadarActionResult> {
  const context = contextSchema.safeParse({ clinicId, organizationId });
  const id = assessmentIdSchema.safeParse(assessmentId);
  if (!context.success || !id.success) {
    return { kind: 'invalid', message: 'O diagnóstico informado é inválido.' };
  }
  return command(
    `/api/v1/organizations/${organizationId}/clinics/${clinicId}/radar-assessments/${assessmentId}/submit`,
    'POST',
    undefined,
    true,
  );
}
