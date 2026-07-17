'use server';

import { CONTACT_CHANNEL_CONFIGURED, contactSchema } from '@/lib/site/contact';

export type ContactResult = { readonly ok: true } | { readonly error: string; readonly ok: false };

// Ponto onde entram rate limit, antiabuso e o encaminhamento ao destino aprovado.
// Hoje o canal está desligado: validamos a forma, mas NÃO persistimos nem encaminhamos nada.
export async function submitContactAction(value: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(value);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { error: first ?? 'Revise os campos do formulário.', ok: false };
  }

  if (!CONTACT_CHANNEL_CONFIGURED) {
    return {
      error:
        'O canal de contato ainda não está ativo. Nenhum dado foi armazenado. Volte em breve — a marca e a política de privacidade estão em preparação.',
      ok: false,
    };
  }

  // Quando o destino for aprovado: aplicar rate limit e antiabuso, encaminhar o lead a um canal
  // segregado (fora do schema tenant-owned) e retornar sucesso.
  return { ok: true };
}
