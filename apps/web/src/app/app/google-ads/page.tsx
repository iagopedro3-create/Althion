import { redirect } from 'next/navigation';

import {
  fetchGoogleAdsCredentials,
  fetchGoogleAdsCampaigns,
  fetchGoogleAdsAttribution,
} from '@/lib/api/google-ads';
import { parsePortalContext } from '@/lib/portal-context';
import { first } from '@/lib/portal-page';
import { createClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/components/cockpit/labels';
import {
  GoogleAdsCredentialsForm,
  SyncGoogleAdsButton,
} from '@/components/google-ads/google-ads-controls';

export const dynamic = 'force-dynamic';

export default async function GoogleAdsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const query = await searchParams;
  const context = parsePortalContext({
    clinicId: first(query.clinicId),
    organizationId: first(query.organizationId),
  });
  if (!context) redirect('/app');

  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) redirect('/entrar');

  const [credentialsRes, attributionRes, campaignsRes] = await Promise.all([
    fetchGoogleAdsCredentials(data.session.access_token, context),
    fetchGoogleAdsAttribution(data.session.access_token, context),
    fetchGoogleAdsCampaigns(data.session.access_token, context),
  ]);

  if (credentialsRes.kind === 'denied' || attributionRes.kind === 'denied') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card danger">
          <h1>Acesso negado</h1>
          <p>Seu perfil não possui acesso ao Google Ads desta conta.</p>
        </section>
      </main>
    );
  }

  if (credentialsRes.kind === 'not_found' || attributionRes.kind === 'not_found') {
    return (
      <main className="portal-main narrow-main">
        <section className="state-card">
          <h1>Módulo indisponível</h1>
          <p>O módulo de Google Ads Leitura ainda não foi habilitado neste ambiente.</p>
        </section>
      </main>
    );
  }

  if (credentialsRes.kind !== 'success' || attributionRes.kind !== 'success') {
    // No credentials stored yet
    return (
      <main className="portal-main narrow-main">
        <header className="page-heading">
          <div>
            <p className="eyebrow">Configurações de Integração</p>
            <h1>Conectar Google Ads</h1>
            <p className="lead-copy">
              Monitore o desempenho de suas campanhas de atração e atribua cliques de anúncios a novas consultas médicas.
            </p>
          </div>
        </header>

        <section className="state-card">
          <h2>Insira suas Credenciais de Leitura</h2>
          <p className="lead-copy" style={{ marginBottom: '20px' }}>
            A conexão é estabelecida de forma segura e com permissão exclusiva de **leitura (ReadOnly)**. Nenhuma alteração é enviada ao Google Ads.
          </p>
          <GoogleAdsCredentialsForm context={context} />
        </section>
      </main>
    );
  }

  const credentials = credentialsRes.data;
  const summary = attributionRes.data;
  const campaigns = campaignsRes.kind === 'success' ? campaignsRes.data : [];

  return (
    <main className="portal-main">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Google Ads · conta {credentials.customer_id}</p>
          <h1>Desempenho de Aquisição e Atribuição</h1>
          <p className="lead-copy">
            Acompanhe o retorno sobre o investimento publicitário conectando cliques de anúncios à jornada do paciente no CRM.
          </p>
        </div>
      </header>

      {campaigns.length === 0 ? (
        <section className="state-card" style={{ marginBottom: '24px' }}>
          <h2>Integração conectada, aguardando dados</h2>
          <p className="lead-copy" style={{ marginBottom: '16px' }}>
            A conta do Google Ads está configurada. Execute a sincronização dos dados do sandbox para popular o dashboard de atração de leads.
          </p>
          <SyncGoogleAdsButton context={context} />
        </section>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <div>
              <span>Status da Integração: <strong>Conectado (ReadOnly)</strong></span>
              {credentials.last_sync_at ? (
                <small style={{ color: 'var(--muted)', display: 'block' }}>
                  Última sincronização: {formatDateTime(credentials.last_sync_at)}
                </small>
              ) : null}
            </div>
            <SyncGoogleAdsButton context={context} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <section className="state-card" aria-label="Investimento">
              <h2>Total Investido</h2>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text)' }}>
                R$ {summary.attribution.totalAdSpend.toFixed(2)}
              </span>
              <p className="lead-copy" style={{ marginTop: '8px' }}>
                Acumulado das campanhas ativas.
              </p>
            </section>

            <section className="state-card" aria-label="Cliques e Conversões">
              <h2>Cliques e Conversões Ads</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                <div>
                  <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                    {summary.attribution.totalAdClicks}
                  </span>
                  <small style={{ color: 'var(--muted)', display: 'block' }}>Cliques no anúncio</small>
                </div>
                <div>
                  <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                    {summary.attribution.totalAdConversions.toFixed(1)}
                  </span>
                  <small style={{ color: 'var(--muted)', display: 'block' }}>Pixels do Ads</small>
                </div>
              </div>
            </section>

            <section className="state-card" aria-label="Leads Atribuídos">
              <h2>Leads Atribuídos (GCLID)</h2>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                {summary.attribution.matchedLeadsCount}
              </span>
              <p className="lead-copy" style={{ marginTop: '8px' }}>
                Leads com clique confirmado pelo rastreador.
              </p>
            </section>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <section className="state-card" aria-label="Atribuição e Incerteza">
              <h2>Modelo de Atribuição e Rastreamento</h2>
              <ul className="cockpit-sla-list" style={{ display: 'grid', gap: '16px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Taxa de Cobertura (Attribution Coverage)</span>
                  <strong>{Math.round(summary.attribution.coverageRatio * 100)}%</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Margem de Incerteza (Google Search sem GCLID)</span>
                  <strong>{Math.round(summary.attribution.uncertaintyRatio * 100)}%</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Custo por Lead Atribuído (CPL)</span>
                  <strong>R$ {summary.attribution.costPerMatchedLead.toFixed(2)}</strong>
                </li>
              </ul>
              <p className="lead-copy" style={{ marginTop: '16px', color: 'var(--muted)', fontSize: '0.85rem' }}>
                A margem de incerteza indica leads que vieram da busca do Google, mas não puderam ser correlacionados a cliques específicos de campanhas (ex. bloqueio de cookies, tráfego orgânico ou opt-out de privacidade).
              </p>
            </section>

            <section className="state-card danger" aria-label="Relação Prudente">
              <h2>Relação Prudente de Conversão</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '12px 0' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                  R$ {summary.attribution.costPerConsultation.toFixed(2)}
                </span>
                <small style={{ color: 'var(--muted)' }}>Custo Real por Consulta Concluída (CAC)</small>
              </div>
              <ul className="cockpit-sla-list" style={{ display: 'grid', gap: '12px', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cliques Atribuídos no CRM</span>
                  <span>{summary.attribution.matchedLeadsCount} lead(s)</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Consultas Médicas Concluídas</span>
                  <strong>{summary.attribution.matchedConsultationsCount} consulta(s)</strong>
                </li>
              </ul>
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)' }}>
                <small style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>ℹ️ AVISO DE CONVERSÃO</small>
                <small>
                  Não confunda conversões de marketing (pixels de cliques ou contatos de chat iniciados) com consultas concluídas. Das leads geradas via anúncios, apenas **{summary.attribution.matchedConsultationsCount}** concluíram consultas, elevando o custo real de aquisição por consulta médica (CAC) para **R$ {summary.attribution.costPerConsultation.toFixed(2)}**.
                </small>
              </div>
            </section>
          </div>

          <section className="state-card" aria-label="Campanhas de Anúncios" style={{ marginBottom: '24px' }}>
            <h2>Campanhas Ativas ({campaigns.length})</h2>
            <div className="portal-table-container" style={{ marginTop: '12px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', paddingBottom: '8px' }}>
                    <th style={{ padding: '8px' }}>Nome da Campanha</th>
                    <th style={{ padding: '8px' }}>Status</th>
                    <th style={{ padding: '8px' }}>Orçamento Diário</th>
                    <th style={{ padding: '8px' }}>ID Externo</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((camp) => (
                    <tr key={camp.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '500' }}>{camp.name}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className={`badge ${camp.status === 'ENABLED' ? 'success' : 'muted'}`}>
                          {camp.status === 'ENABLED' ? 'Ativa' : 'Pausada'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>R$ {(camp.budget_micros / 1000000).toFixed(2)}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--muted)', fontSize: '0.85rem' }}>{camp.campaign_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <section className="state-card">
        <h2>Atualizar Configurações do Google Ads</h2>
        <p className="lead-copy" style={{ marginBottom: '16px' }}>
          Atualize os tokens OAuth se a sessão expirar ou se quiser conectar um Customer ID diferente.
        </p>
        <GoogleAdsCredentialsForm context={context} existingCustomerId={credentials.customer_id} />
      </section>
    </main>
  );
}
