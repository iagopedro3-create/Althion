'use server';

import { after } from 'next/server';

import { sendDiagnosisLeadNotification } from '@/lib/site/diagnosis-notification';
import { createDiagnosisLead } from '@/lib/site/diagnosis-repository';
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

  if (parsed.data.website) return { ok: true };

  if (!DIAGNOSIS_CHANNEL_CONFIGURED) {
    return {
      error:
        'O canal de diagnóstico está temporariamente indisponível. Tente novamente em instantes.',
      ok: false,
    };
  }

  try {
    const lead = await createDiagnosisLead(parsed.data);

    after(async () => {
      try {
        await sendDiagnosisLeadNotification(lead.id, parsed.data);
      } catch (error) {
        // eslint-disable-next-line no-console -- Vercel captures operational failures.
        console.error('Lead salvo, mas a notificação por e-mail falhou', {
          leadId: lead.id,
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    });

    return { ok: true };
  } catch (error) {
    // eslint-disable-next-line no-console -- Vercel captures operational failures.
    console.error('Falha ao registrar solicitação pública de diagnóstico', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    });
    return {
      error: 'Não foi possível registrar sua solicitação agora. Tente novamente.',
      ok: false,
    };
  }
}
