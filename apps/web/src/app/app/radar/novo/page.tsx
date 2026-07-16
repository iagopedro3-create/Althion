import { redirect } from 'next/navigation';

import { RadarForm } from '@/components/radar/radar-form';
import { parseRadarContext } from '@/lib/radar-context';

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export default async function NewRadarPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const query = await searchParams;
  const context = parseRadarContext({
    clinicId: Array.isArray(query.clinicId) ? query.clinicId[0] : query.clinicId,
    organizationId: Array.isArray(query.organizationId)
      ? query.organizationId[0]
      : query.organizationId,
  });
  if (!context) redirect('/app');

  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29);

  return (
    <main className="portal-main form-page">
      <div>
        <p className="eyebrow">Novo diagnóstico</p>
        <h1>Dados suficientes para decidir, sem falsa precisão.</h1>
        <p className="lead-copy">
          Informe apenas contagens administrativas agregadas. Não inclua nomes, mensagens ou
          informações clínicas.
        </p>
      </div>
      <RadarForm context={context} periodEnd={isoDate(end)} periodStart={isoDate(start)} />
    </main>
  );
}
