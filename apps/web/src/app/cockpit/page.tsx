import { redirect } from 'next/navigation';

import { COMPLEXITY_LABELS, formatDateTime, HEALTH_LABELS } from '@/components/cockpit/labels';
import { fetchCockpitPortfolio } from '@/lib/api/cockpit';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function CockpitPortfolioPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) redirect('/entrar');

  const result = await fetchCockpitPortfolio(data.session.access_token);

  if (result.kind === 'denied') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card danger">
          <h1>Acesso restrito</h1>
          <p>
            O Cockpit é exclusivo do Especialista de Relacionamento com assignment ativo. Seu acesso
            ao Portal do Cliente continua disponível.
          </p>
          <a className="quiet-button" href="/app">
            Ir para o Portal
          </a>
        </section>
      </main>
    );
  }

  if (result.kind === 'not_found') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card">
          <h1>Cockpit ainda não disponível</h1>
          <p>O Cockpit do Especialista ainda não foi habilitado neste ambiente.</p>
        </section>
      </main>
    );
  }

  if (result.kind !== 'success') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card danger">
          <h1>Carteira indisponível</h1>
          <p>Não foi possível consultar a carteira agora. Tente novamente.</p>
        </section>
      </main>
    );
  }

  const { accounts, capacity, generatedAt, policyVersion } = result.data;

  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Cockpit do Especialista</p>
          <h1>Qual conta precisa de você agora?</h1>
          <p className="lead-copy">
            Saúde, prazos e próxima melhor ação por conta — regras explicáveis da política{' '}
            {policyVersion}, geradas em {formatDateTime(generatedAt)}.
          </p>
        </div>
      </header>

      <section aria-label="Capacidade da carteira" className="state-card">
        <h2>Capacidade da carteira</h2>
        {capacity.availability === 'available' ? (
          <p>
            {capacity.usedPoints} de {capacity.limitPoints} pontos em uso (
            {Math.round(capacity.usedRatio * 100)}%) —{' '}
            {capacity.state === 'available'
              ? 'com espaço disponível'
              : capacity.state === 'near_limit'
                ? 'próxima do limite'
                : 'acima do limite'}
            .{' '}
            {capacity.limitSource === 'default'
              ? 'Limite padrão provisório de 12 pontos; nenhum limite individual foi configurado.'
              : 'Limite configurado para este Especialista.'}
          </p>
        ) : (
          <p>
            Perfil sem cadastro de Especialista; a capacidade não se aplica a administradores da
            plataforma.
          </p>
        )}
      </section>

      {accounts.length === 0 ? (
        <section className="state-card">
          <h2>Nenhuma conta na carteira</h2>
          <p>Sem assignment ativo, nenhuma conta é exibida ou inventada.</p>
        </section>
      ) : (
        <section aria-label="Contas da carteira" className="cockpit-account-list">
          {accounts.map((account) => {
            const query = new URLSearchParams({
              clinicId: account.clinicId,
              clinicName: account.clinicName ?? '',
              organizationId: account.organizationId,
              organizationName: account.organizationName ?? '',
            }).toString();
            return (
              <article
                className={`cockpit-account-card health-${account.health.state}`}
                key={`${account.organizationId}:${account.clinicId}`}
              >
                <header>
                  <div>
                    <h3>{account.clinicName ?? 'Clínica'}</h3>
                    <small>{account.organizationName ?? 'Organização'}</small>
                  </div>
                  <span className={`status-badge health-${account.health.state}`}>
                    {HEALTH_LABELS[account.health.state]}
                  </span>
                </header>
                <dl className="cockpit-account-facts">
                  <div>
                    <dt>Score</dt>
                    <dd>{account.scoreValue ?? 'Sem dado'}</dd>
                  </div>
                  <div>
                    <dt>SLA estourado</dt>
                    <dd>{account.slaBreached}</dd>
                  </div>
                  <div>
                    <dt>SLA em risco</dt>
                    <dd>{account.slaAtRisk}</dd>
                  </div>
                  <div>
                    <dt>Incidentes abertos</dt>
                    <dd>{account.openIncidents}</dd>
                  </div>
                  <div>
                    <dt>Complexidade</dt>
                    <dd>{COMPLEXITY_LABELS[account.complexity]}</dd>
                  </div>
                </dl>
                {account.nextBestAction ? (
                  <p className="cockpit-next-action">
                    <strong>Próxima ação:</strong> {account.nextBestAction.title}
                    <small>{account.nextBestAction.evidence}</small>
                  </p>
                ) : (
                  <p className="cockpit-next-action">
                    <strong>Sem ação pendente</strong>
                    <small>Nenhuma regra da política disparou para esta conta.</small>
                  </p>
                )}
                <a className="primary-button" href={`/cockpit/conta?${query}`}>
                  Abrir conta
                </a>
              </article>
            );
          })}
        </section>
      )}

      {result.data.truncated ? (
        <p className="form-message">
          A carteira excede o limite de exibição desta versão; as contas mais críticas aparecem
          primeiro.
        </p>
      ) : null}
    </main>
  );
}
