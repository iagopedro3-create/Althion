import { redirect } from 'next/navigation';

import { fetchPrincipal } from '@/lib/api/principal';
import { createClient } from '@/lib/supabase/server';

export default async function FoundationPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/entrar');

  const result = await fetchPrincipal(session.access_token);

  return (
    <main className="portal-main">
      <div>
        <p className="eyebrow">Fundação operacional</p>
        <h1>Seu ambiente Althion</h1>
        <p className="lead-copy">
          A base segura da operação está ativa. Radar, Score e demais módulos entram somente nas
          próximas fases aprovadas.
        </p>
      </div>

      {result.kind === 'success' && result.principal.memberships.length > 0 ? (
        <section className="tenant-grid" aria-label="Organizações disponíveis">
          {result.principal.memberships.map((membership) => (
            <article className="tenant-card" key={membership.organizationId}>
              <span className="status-dot" aria-hidden="true" />
              <div>
                <h2>Organização autorizada</h2>
                <p>
                  Papel: <strong>{membership.role.replaceAll('_', ' ')}</strong>
                </p>
                <small>Identificador: {membership.organizationId}</small>
              </div>
            </article>
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
