import { redirect } from 'next/navigation';

import { fetchPrincipal } from '@/lib/api/principal';
import { fetchClinics } from '@/lib/api/radar';
import { createClient } from '@/lib/supabase/server';

export default async function FoundationPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/entrar');

  const result = await fetchPrincipal(session.access_token);
  const clinicGroups =
    result.kind === 'success'
      ? await Promise.all(
          result.principal.memberships.map(async (membership) => ({
            clinics: await fetchClinics(session.access_token, membership.organizationId),
            membership,
          })),
        )
      : [];

  return (
    <main className="portal-main">
      <div>
        <p className="eyebrow">Operação administrativa</p>
        <h1>Escolha a clínica que precisa de atenção.</h1>
        <p className="lead-copy">
          O Radar transforma dados do período em lacunas, recomendações e uma nota operacional
          explicável.
        </p>
      </div>

      {clinicGroups.some(
        (group) => group.clinics.kind === 'success' && group.clinics.data.length,
      ) ? (
        <section className="tenant-grid" aria-label="Clínicas disponíveis">
          {clinicGroups.flatMap((group) =>
            group.clinics.kind === 'success'
              ? group.clinics.data.map((clinic) => (
                  <a
                    className="tenant-card actionable-card"
                    href={`/app/radar?organizationId=${clinic.organization_id}&clinicId=${clinic.id}`}
                    key={clinic.id}
                  >
                    <span className="status-dot" aria-hidden="true" />
                    <div>
                      <h2>{clinic.name}</h2>
                      <p>Ver diagnóstico, Score e próximas ações.</p>
                      <small>Papel: {group.membership.role.replaceAll('_', ' ')}</small>
                    </div>
                  </a>
                ))
              : [],
          )}
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
