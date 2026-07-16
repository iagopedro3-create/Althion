import { fetchPortalSpecialist } from '@/lib/api/portal';
import { requirePortalPage } from '@/lib/portal-page';
import { portalQuery } from '@/lib/portal-context';

export default async function SpecialistPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const { context, token } = await requirePortalPage(searchParams);
  const result = await fetchPortalSpecialist(token, context);
  const query = portalQuery(context);
  return (
    <main className="portal-main narrow-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Especialista de Relacionamento</p>
          <h1>Continuidade, qualidade e evolução.</h1>
          <p className="lead-copy">
            O Especialista acompanha a operação; ele não substitui atendimento ou secretaria.
          </p>
        </div>
        <a className="quiet-button" href={`/app?${query}`}>
          Voltar
        </a>
      </header>
      {result.kind === 'success' && result.data.availability === 'available' ? (
        <section className="specialist-profile">
          <div className="specialist-avatar" aria-hidden="true">
            {result.data.display_name?.slice(0, 1)}
          </div>
          <div>
            <span className="status-badge">Assignment ativo</span>
            <h2>{result.data.display_name}</h2>
            <p>
              Responsável por acompanhar indicadores, pendências e o plano de melhoria desta
              clínica.
            </p>
            {result.data.starts_at ? (
              <small>Assignment iniciado em {formatDate(result.data.starts_at)}</small>
            ) : null}
            <div className="profile-actions">
              <a className="primary-button" href={`/app/solicitacoes?${query}&category=meeting`}>
                Solicitar reunião
              </a>
              <a className="quiet-button" href={`/app/plano-de-melhoria?${query}`}>
                Ver plano
              </a>
            </div>
          </div>
        </section>
      ) : result.kind === 'success' ? (
        <section className="state-card">
          <h2>Especialista ainda não atribuído</h2>
          <p>Nenhum contato, SLA ou reunião será inventado até existir assignment ativo.</p>
        </section>
      ) : (
        <section className="state-card danger">
          <h2>Informação indisponível</h2>
          <p>Não foi possível consultar o assignment autorizado.</p>
        </section>
      )}
    </main>
  );
}

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(value));
