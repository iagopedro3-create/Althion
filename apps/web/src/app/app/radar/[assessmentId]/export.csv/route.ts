import { z } from 'zod';

import { apiEndpoint } from '@/lib/api/radar';
import { parseRadarContext } from '@/lib/radar-context';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await params;
  if (!z.uuid().safeParse(assessmentId).success) return new Response('Not found', { status: 404 });
  const url = new URL(request.url);
  const context = parseRadarContext({
    clinicId: url.searchParams.get('clinicId'),
    organizationId: url.searchParams.get('organizationId'),
  });
  if (!context) return new Response('Invalid context', { status: 400 });
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) return new Response('Unauthorized', { status: 401 });
  const endpoint = apiEndpoint(
    `/api/v1/organizations/${context.organizationId}/clinics/${context.clinicId}/radar-assessments/${assessmentId}/export.csv`,
  );
  if (!endpoint) return new Response('Unavailable', { status: 503 });
  const response = await fetch(endpoint, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${data.session.access_token}` },
  });
  if (!response.ok) return new Response('Unavailable', { status: response.status });
  return new Response(await response.arrayBuffer(), {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `attachment; filename="althion-radar-${assessmentId}.csv"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}
