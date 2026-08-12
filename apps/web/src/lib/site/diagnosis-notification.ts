import 'server-only';

import { Resend } from 'resend';

import type { DiagnosisInput } from './diagnosis';

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character] ?? character,
  );
}

export function buildDiagnosisLeadEmail(input: DiagnosisInput) {
  const fields: ReadonlyArray<readonly [string, string]> = [
    ['Clínica', input.clinicName],
    ['Responsável', input.name],
    ['WhatsApp', input.whatsapp],
    ['E-mail', input.email || 'Não informado'],
    ['Nicho', input.specialty],
    ['Profissionais', String(input.professionalsCount)],
    ['Média de contatos por dia', String(input.dailyContactAverage)],
  ];
  const rows = fields
    .map(
      ([label, value]) => `<tr>
        <td style="padding:8px 12px;color:#66736d;border-bottom:1px solid #e4e9e6">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;color:#10251e;font-weight:600;border-bottom:1px solid #e4e9e6">${escapeHtml(value)}</td>
      </tr>`,
    )
    .join('');

  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f3f6f4;font-family:Arial,sans-serif;color:#10251e">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px"><div style="padding:28px;background:#fff;border:1px solid #dce4df;border-radius:16px">
      <p style="margin:0 0 8px;color:#187d5c;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Novo lead Althion</p>
      <h1 style="margin:0 0 20px;font-size:26px;line-height:1.2">Solicitação de diagnóstico recebida</h1>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <h2 style="margin:24px 0 8px;font-size:16px">Maior dificuldade da operação</h2>
      <p style="margin:0;padding:16px;background:#f3f8f5;border-radius:10px;line-height:1.6;white-space:pre-wrap">${escapeHtml(input.mainDifficulty)}</p>
    </div></div>
  </body></html>`;
}

function buildPlainText(input: DiagnosisInput) {
  return [
    'Nova solicitação de diagnóstico Althion',
    '',
    `Clínica: ${input.clinicName}`,
    `Responsável: ${input.name}`,
    `WhatsApp: ${input.whatsapp}`,
    `E-mail: ${input.email || 'Não informado'}`,
    `Nicho: ${input.specialty}`,
    `Profissionais: ${input.professionalsCount}`,
    `Média de contatos por dia: ${input.dailyContactAverage}`,
    '',
    'Maior dificuldade da operação:',
    input.mainDifficulty,
  ].join('\n');
}

export async function sendDiagnosisLeadNotification(leadId: string, input: DiagnosisInput) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    // eslint-disable-next-line no-console -- Vercel captures this operational warning.
    console.warn('Lead salvo sem notificação: RESEND_API_KEY não configurada.');
    return;
  }

  const resend = new Resend(apiKey);
  const replyTo = input.email || undefined;
  const { error } = await resend.emails.send(
    {
      from: process.env.ALTHION_EMAIL_FROM?.trim() || 'Althion <onboarding@resend.dev>',
      html: buildDiagnosisLeadEmail(input),
      ...(replyTo ? { replyTo } : {}),
      subject: `Novo lead: ${input.clinicName}`,
      text: buildPlainText(input),
      to: [process.env.ALTHION_LEAD_NOTIFICATION_EMAIL?.trim() || 'iago.docpro@gmail.com'],
    },
    { idempotencyKey: `diagnosis-lead/${leadId}` },
  );

  if (error) throw new Error(`RESEND_DIAGNOSIS_NOTIFICATION_FAILED: ${error.message}`);
}
