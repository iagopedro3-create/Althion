'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { transitionRequestAction } from '@/app/app/solicitacoes/actions';
import type { PortalRequestView } from '@/lib/api/portal';
import type { PortalContext } from '@/lib/portal-context';

const NEXT: Record<PortalRequestView['status'], readonly PortalRequestView['status'][]> = {
  acknowledged: ['in_progress', 'closed'],
  closed: [],
  in_progress: ['waiting_customer', 'resolved', 'closed'],
  open: ['acknowledged', 'closed'],
  resolved: ['in_progress', 'closed'],
  waiting_customer: ['in_progress', 'resolved', 'closed'],
};

const LABELS: Record<PortalRequestView['status'], string> = {
  acknowledged: 'Confirmar recebimento',
  closed: 'Encerrar',
  in_progress: 'Iniciar trabalho',
  open: 'Aberta',
  resolved: 'Marcar como resolvida',
  waiting_customer: 'Aguardar cliente',
};

export function RequestTransitions({
  context,
  requestId,
  status,
}: Readonly<{ context: PortalContext; requestId: string; status: PortalRequestView['status'] }>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const transition = (toStatus: PortalRequestView['status']) => {
    setMessage(null);
    const idempotencyKey = crypto.randomUUID();
    startTransition(async () => {
      const result = await transitionRequestAction({
        ...context,
        idempotencyKey,
        reasonCode: 'portal_workflow_update',
        requestId,
        toStatus,
      });
      setMessage(result.ok ? 'Estado atualizado.' : (result.error ?? 'Falha ao atualizar.'));
      if (result.ok) router.refresh();
    });
  };

  if (!NEXT[status].length) return null;
  return (
    <div className="workflow-actions">
      {NEXT[status].map((next) => (
        <button disabled={isPending} key={next} onClick={() => transition(next)} type="button">
          {LABELS[next]}
        </button>
      ))}
      <span aria-live="polite">{message}</span>
    </div>
  );
}
