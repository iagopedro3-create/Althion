'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { transitionIncidentAction, transitionMeetingAction } from '@/app/cockpit/conta/actions';
import type { PortalContext } from '@/lib/portal-context';

export interface WorkflowTransition {
  readonly label: string;
  readonly toStatus: string;
}

export function WorkflowButtons({
  context,
  kind,
  resourceId,
  transitions,
}: Readonly<{
  context: PortalContext;
  kind: 'incident' | 'meeting';
  resourceId: string;
  transitions: readonly WorkflowTransition[];
}>) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  if (!transitions.length) return null;

  const run = async (toStatus: string) => {
    setMessage(null);
    setPending(toStatus);
    const payload = {
      ...context,
      idempotencyKey: crypto.randomUUID(),
      toStatus,
      ...(kind === 'incident' ? { incidentId: resourceId } : { meetingId: resourceId }),
    };
    const result =
      kind === 'incident'
        ? await transitionIncidentAction(payload)
        : await transitionMeetingAction(payload);
    setPending(null);
    if (!result.ok) {
      setMessage(result.error ?? 'Não foi possível concluir a transição.');
      return;
    }
    router.refresh();
  };

  return (
    <div className="workflow-actions">
      {transitions.map((transition) => (
        <button
          className="quiet-button"
          disabled={pending !== null}
          key={transition.toStatus}
          onClick={() => void run(transition.toStatus)}
          type="button"
        >
          {pending === transition.toStatus ? 'Aplicando…' : transition.label}
        </button>
      ))}
      <span aria-live="polite" className="form-message">
        {message}
      </span>
    </div>
  );
}
