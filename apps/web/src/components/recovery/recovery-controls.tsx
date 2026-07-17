'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  createSuppressionAction,
  decideActionAction,
  decideOpportunityAction,
  revokeSuppressionAction,
  simulateRecoveryAction,
} from '@/app/cockpit/recovery/actions';
import type { PortalContext } from '@/lib/portal-context';

export function SimulateButton({ context }: Readonly<{ context: PortalContext }>) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const run = async () => {
    setMessage(null);
    setPending(true);
    const result = await simulateRecoveryAction({
      ...context,
      idempotencyKey: crypto.randomUUID(),
    });
    setPending(false);
    if (!result.ok) {
      setMessage(result.error ?? 'Não foi possível simular.');
      return;
    }
    setMessage('Simulação registrada. Nenhum contato foi enviado.');
    router.refresh();
  };

  return (
    <div className="workflow-actions">
      <button
        className="primary-button"
        disabled={pending}
        onClick={() => void run()}
        type="button"
      >
        {pending ? 'Simulando…' : 'Executar simulação sintética'}
      </button>
      <span aria-live="polite" className="form-message">
        {message}
      </span>
    </div>
  );
}

export function DecisionButtons({
  context,
  kind,
  resourceId,
}: Readonly<{ context: PortalContext; kind: 'action' | 'opportunity'; resourceId: string }>) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const options =
    kind === 'opportunity'
      ? ([
          ['approved', 'Aprovar'],
          ['discarded', 'Descartar'],
        ] as const)
      : ([
          ['approved', 'Aprovar'],
          ['rejected', 'Rejeitar'],
        ] as const);

  const run = async (decision: string) => {
    setMessage(null);
    setPending(decision);
    const payload = {
      ...context,
      decision,
      idempotencyKey: crypto.randomUUID(),
      ...(kind === 'opportunity' ? { opportunityId: resourceId } : { actionId: resourceId }),
    };
    const result =
      kind === 'opportunity'
        ? await decideOpportunityAction(payload)
        : await decideActionAction(payload);
    setPending(null);
    if (!result.ok) {
      setMessage(result.error ?? 'Não foi possível decidir.');
      return;
    }
    router.refresh();
  };

  return (
    <div className="workflow-actions">
      {options.map(([decision, label]) => (
        <button
          className="quiet-button"
          disabled={pending !== null}
          key={decision}
          onClick={() => void run(decision)}
          type="button"
        >
          {pending === decision ? 'Aplicando…' : label}
        </button>
      ))}
      <span aria-live="polite" className="form-message">
        {message}
      </span>
    </div>
  );
}

export function SuppressionForm({ context }: Readonly<{ context: PortalContext }>) {
  const router = useRouter();
  const [leadRef, setLeadRef] = useState('');
  const [reason, setReason] = useState('opt_out');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setPending(true);
    const result = await createSuppressionAction({
      ...context,
      externalLeadRef: leadRef,
      idempotencyKey: crypto.randomUUID(),
      reason,
    });
    setPending(false);
    if (!result.ok) {
      setMessage(result.error ?? 'Não foi possível registrar a supressão.');
      return;
    }
    setLeadRef('');
    setMessage('Supressão registrada.');
    router.refresh();
  };

  return (
    <form className="portal-form" onSubmit={(event) => void submit(event)}>
      <div className="form-grid two-columns">
        <label>
          Referência do lead sintético
          <input
            maxLength={120}
            onChange={(event) => setLeadRef(event.target.value)}
            pattern="[A-Za-z0-9_.:\-]+"
            placeholder="Ex.: mock-lead-unanswered"
            required
            value={leadRef}
          />
        </label>
        <label>
          Motivo
          <select onChange={(event) => setReason(event.target.value)} value={reason}>
            <option value="opt_out">Opt-out do contato</option>
            <option value="complaint">Reclamação</option>
            <option value="manual_review">Revisão manual</option>
            <option value="other">Outro</option>
          </select>
        </label>
      </div>
      <div className="form-footer">
        <button className="primary-button" disabled={pending} type="submit">
          {pending ? 'Registrando…' : 'Registrar supressão'}
        </button>
        <span aria-live="polite" className="form-message">
          {message}
        </span>
      </div>
    </form>
  );
}

export function RevokeSuppressionButton({
  context,
  suppressionId,
}: Readonly<{ context: PortalContext; suppressionId: string }>) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const run = async () => {
    setMessage(null);
    setPending(true);
    const result = await revokeSuppressionAction({
      ...context,
      idempotencyKey: crypto.randomUUID(),
      suppressionId,
    });
    setPending(false);
    if (!result.ok) {
      setMessage(result.error ?? 'Não foi possível revogar.');
      return;
    }
    router.refresh();
  };

  return (
    <div className="workflow-actions">
      <button className="quiet-button" disabled={pending} onClick={() => void run()} type="button">
        {pending ? 'Revogando…' : 'Revogar'}
      </button>
      <span aria-live="polite" className="form-message">
        {message}
      </span>
    </div>
  );
}
