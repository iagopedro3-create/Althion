import { fetchPrincipal } from '@/lib/api/principal';
import { fetchClinics } from '@/lib/api/radar';
import { requirePortalPage } from '@/lib/portal-page';
import { portalQuery } from '@/lib/portal-context';

export default async function SettingsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const { context, token } = await requirePortalPage(searchParams);
  const [clinics, principal] = await Promise.all([
    fetchClinics(token, context.organizationId),
    fetchPrincipal(token),
  ]);
  const clinic =
    clinics.kind === 'success' ? clinics.data.find((item) => item.id === context.clinicId) : null;
  const membership =
    principal.kind === 'success'
      ? principal.principal.memberships.find(
          (item) => item.organizationId === context.organizationId,
        )
      : null;
  const query = portalQuery(context);
  return (
    <main className="portal-main narrow-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Configurações</p>
          <h1>Contexto da operação.</h1>
          <p className="lead-copy">
            Dados estruturais aparecem em leitura nesta fase; alterações sensíveis usam fluxos
            administrativos próprios.
          </p>
        </div>
        <a className="quiet-button" href={`/app?${query}`}>
          Voltar
        </a>
      </header>
      {clinic ? (
        <section className="settings-panel">
          <h2>{clinic.name}</h2>
          <dl>
            <div>
              <dt>Organização</dt>
              <dd>{clinic.organization_id}</dd>
            </div>
            <div>
              <dt>Clínica</dt>
              <dd>{clinic.id}</dd>
            </div>
            <div>
              <dt>Timezone</dt>
              <dd>{clinic.timezone ?? 'America/Sao_Paulo'}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{clinic.status ?? 'active'}</dd>
            </div>
            <div>
              <dt>Seu papel</dt>
              <dd>{membership?.role.replaceAll('_', ' ') ?? 'Especialista atribuído'}</dd>
            </div>
          </dl>
          <div className="settings-links">
            <a href={`/app/integracoes?${query}`}>Ver integrações</a>
            <a href={`/app/especialista?${query}`}>Ver Especialista</a>
          </div>
        </section>
      ) : (
        <section className="state-card danger">
          <h2>Configuração indisponível</h2>
          <p>A clínica não pertence ao contexto autorizado.</p>
        </section>
      )}
    </main>
  );
}
