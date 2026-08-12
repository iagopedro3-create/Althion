import 'server-only';

import { createClient } from '@supabase/supabase-js';

import type { DiagnosisInput } from './diagnosis';

function createAdminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const secret = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();

  if (!url || !secret) {
    throw new Error('SUPABASE_DIAGNOSIS_CONFIG_MISSING');
  }

  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function createDiagnosisLead(input: DiagnosisInput) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('diagnosis_leads')
    .insert({
      clinic_name: input.clinicName,
      contact_consent: input.consent,
      daily_contact_average: input.dailyContactAverage,
      email: input.email || null,
      main_difficulty: input.mainDifficulty,
      niche: input.specialty,
      professional_count: input.professionalsCount,
      responsible_name: input.name,
      source: 'landing_page',
      whatsapp: input.whatsapp,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(
      `SUPABASE_DIAGNOSIS_INSERT_FAILED: ${error?.message ?? 'registro sem identificador'}`,
    );
  }

  return data;
}
