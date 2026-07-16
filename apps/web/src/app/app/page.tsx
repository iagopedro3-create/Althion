import { redirect } from 'next/navigation';

import { PortalDashboard } from '@/components/portal/portal-dashboard';
import { fetchPrincipal } from '@/lib/api/principal';
import { fetchPortalDashboard } from '@/lib/api/portal';
import { fetchClinics } from '@/lib/api/radar';
import { first } from '@/lib/portal-page';
import { parsePortalContext, portalQuery } from '@/lib/portal-context';
import { createClient } from '@/lib/supabase/server';

export default async function FoundationPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const query = await searchParams;
  const requestedContext = parsePortalContext({
    clinicId: first(query.clinicId),
    organizationId: first(query.organizationId),
  });
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/entrar');

  const result = await fetchPrincipal(session.access_token);
  const organizationIds =
    result.kind === 'success'
      ? [
          ...new Set([
            ...result.principal.memberships.map((membership) => membership.organizationId),
            ...result.principal.assignments
              .filter((assignment) => assignment.status === 'active')
              .map((assignment) => assignment.organizationId),
          ]),
        ]
      : [];
  const clinicGroups = await Promise.all(
    organizationIds.map(async (organizationId) => ({
      clinics: await fetchClinics(session.access_token, organizationId),
      membership:
        result.kind === 'success'
          ? (result.principal.memberships.find((item) => item.organizationId === organizationId) ??
            null)
          : null,
      organizationId,
    })),
  );
  const visibleClinics = clinicGroups.flatMap((group) =>
    group.clinics.kind === 'success'
      ? group.clinics.data.map((clinic) => ({ ...clinic, membership: group.membership }))
      : [],
  );

  if (requestedContext) {
    const clinic = visibleClinics.find(
      (candidate) =>
        candidate.id === requestedContext.clinicId &&
        candidate.organization_id === requestedContext.organizationId,
    );
    if (!clinic) {
      return (
        <main className="portal-main">
          <section className="state-card danger" role="alert">
            <h1>Clínica não disponível</h1>
            <p>O contexto solicitado não pertence ao seu acesso atual.</p>
            <a className="quiet-button" href="/app">
              Voltar às clínicas
            </a>
          </section>
        </main>
      );
    }
    const dashboard = await fetchPortalDashboard(session.access_token, requestedContext);
    if (dashboard.kind === 'success') {
      return (
        <PortalDashboard
          clinicName={clinic.name}
          context={requestedContext}
          dashboard={dashboard.data}
        />
      );
    }
    return (
      <main className="portal-main">
        <section className={`state-card ${dashboard.kind === 'denied' ? 'danger' : 'warning'}`}>
          <h1>
            {dashboard.kind === 'not_found' ? 'Portal ainda não habilitado' : 'Visão indisponível'}
          </h1>
          <p>
            {dashboard.kind === 'not_found'
              ? 'A feature flag do Portal está desativada para esta organização.'
              : 'Não foi possível carregar a visão sem comprometer o isolamento dos dados.'}
          </p>
          <a className="quiet-button" href="/app">
            Escolher outra clínica
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="portal-main">
      <div>
        <p className="eyebrow">Portal do Cliente</p>
        <h1>Qual operação você quer acompanhar?</h1>
        <p className="lead-copy">
          Cada clínica mantém contexto, permissões e indicadores isolados. Escolha uma para abrir o
          centro de performance.
        </p>
      </div>

      {clinicGroups.some(
        (group) => group.clinics.kind === 'success' && group.clinics.data.length,
      ) ? (
        <section className="tenant-grid" aria-label="Clínicas disponíveis">
          {visibleClinics.map((clinic) => (
            <a
              className="tenant-card actionable-card"
              href={`/app?${portalQuery({ clinicId: clinic.id, organizationId: clinic.organization_id })}`}
              key={clinic.id}
            >
              <span className="status-dot" aria-hidden="true" />
              <div>
                <h2>{clinic.name}</h2>
                <p>Ver problemas, oportunidades e próximas ações.</p>
                <small>
                  Papel: {clinic.membership?.role.replaceAll('_', ' ') ?? 'especialista atribuído'}
                </small>
              </div>
            </a>
          ))}
        </section>
      ) : result.kind === 'success' ? (
        <section className="state-card" aria-live="polite">
          <h2>Nenhuma organização atribuída</h2>
          <p>Seu perfil existe, mas ainda precisa receber uma membership ativa.</p>
        </section>
      ) : result.kind === 'denied' ? (
        <section className="state-card danger" role="alert">
          <h2>Acesso não autorizado</h2>
          <p>Sua sessão não possui um perfil ativo. Solicite a revisão do seu acesso.</p>
        </section>
      ) : (
        <section className="state-card" role="status">
          <h2>Configuração em andamento</h2>
          <p>A API ou o banco local ainda não estão disponíveis. Nenhum dado foi exposto.</p>
        </section>
      )}
    </main>
  );
}
