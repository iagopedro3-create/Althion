'use server';

import { DIAGNOSIS_CHANNEL_CONFIGURED, diagnosisSchema } from '@/lib/site/diagnosis';

export type DiagnosisResult =
  { readonly ok: true } | { readonly error: string; readonly ok: false };

export async function submitDiagnosisAction(value: unknown): Promise<DiagnosisResult> {
  const parsed = diagnosisSchema.safeParse(value);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Revise os campos do diagnóstico.',
      ok: false,
    };
  }

  if (!DIAGNOSIS_CHANNEL_CONFIGURED) {
    return {
      error:
        'O canal de diagnóstico ainda não está ativo. Nenhum dado foi armazenado ou encaminhado.',
      ok: false,
    };
  }

  // Quando o destino for aprovado: aplicar rate limit durável, validar o honeypot,
  // registrar consentimento e encaminhar somente os campos comerciais necessários.
  return { ok: true };
}
