import 'server-only';

import { redirect } from 'next/navigation';

import { parsePortalContext } from '@/lib/portal-context';
import { createClient } from '@/lib/supabase/server';

export async function requirePortalPage(
  searchParams: Promise<Record<string, string | string[] | undefined>>,
) {
  const query = await searchParams;
  const context = parsePortalContext({
    clinicId: first(query.clinicId),
    organizationId: first(query.organizationId),
  });
  if (!context) redirect('/app');
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) redirect('/entrar');
  return { context, query, token: data.session.access_token };
}

export const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;
