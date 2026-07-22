'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { PortalContext } from '@/lib/portal-context';
import { saveCredentialsAction, syncGoogleAdsAction } from '@/app/app/google-ads/actions';

export function GoogleAdsCredentialsForm({
  context,
  existingCustomerId,
}: Readonly<{
  context: PortalContext;
  existingCustomerId?: string;
}>) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(existingCustomerId ?? '');
  const [developerToken, setDeveloperToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId.trim() || !developerToken.trim() || !refreshToken.trim()) {
      setMessage('Todos os campos são obrigatórios.');
      return;
    }

    setMessage(null);
    setPending(true);

    const result = await saveCredentialsAction({
      ...context,
      customer_id: customerId,
      developer_token: developerToken,
      refresh_token: refreshToken,
      idempotencyKey: crypto.randomUUID(),
    });

    setPending(false);
    if (!result.ok) {
      setMessage(result.error ?? 'Erro ao salvar credenciais.');
      return;
    }

    setMessage('Configuração sintética do sandbox salva com sucesso.');
    setDeveloperToken('');
    setRefreshToken('');
    router.refresh();
  };

  return (
    <form className="portal-form" onSubmit={(e) => void submit(e)}>
      <label>
        Google Ads Customer ID (Formato: 123-456-7890)
        <input
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="Ex. 123-456-7890"
          required
          type="text"
          value={customerId}
        />
      </label>
      <label>
        Developer Token sintético
        <input
          onChange={(e) => setDeveloperToken(e.target.value)}
          placeholder="mock_developer_token"
          required
          type="password"
          value={developerToken}
        />
      </label>
      <label>
        Refresh Token sintético
        <input
          onChange={(e) => setRefreshToken(e.target.value)}
          placeholder="mock_refresh_token"
          required
          type="password"
          value={refreshToken}
        />
      </label>

      <div className="form-footer">
        <button className="primary-button" disabled={pending} type="submit">
          {pending ? 'Salvando…' : 'Salvar e Conectar'}
        </button>
        {message ? (
          <span aria-live="polite" className="form-message">
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

export function SyncGoogleAdsButton({ context }: Readonly<{ context: PortalContext }>) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const run = async () => {
    setMessage(null);
    setPending(true);

    const result = await syncGoogleAdsAction({
      ...context,
      idempotencyKey: crypto.randomUUID(),
    });

    setPending(false);
    if (!result.ok) {
      setMessage(result.error ?? 'Não foi possível sincronizar.');
      return;
    }

    setMessage('Campanhas e métricas sincronizadas com sucesso!');
    router.refresh();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <button
        className="primary-button"
        disabled={pending}
        onClick={() => void run()}
        type="button"
      >
        {pending ? 'Sincronizando…' : 'Sincronizar dados do Google Ads (Sandbox)'}
      </button>
      <span
        aria-live="polite"
        style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: '500' }}
      >
        {message}
      </span>
    </div>
  );
}
