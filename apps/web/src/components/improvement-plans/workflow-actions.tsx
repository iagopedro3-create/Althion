'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { transitionPlanAction, transitionTaskAction } from '@/app/app/plano-de-melhoria/actions';
import type { ImprovementPlanDetailView } from '@/lib/api/portal';
import type { PortalContext } from '@/lib/portal-context';

type PlanStatus = NonNullable<ImprovementPlanDetailView['plan']>['status'];
type TaskStatus = ImprovementPlanDetailView['tasks'][number]['status'];

const PLAN_NEXT: Record<PlanStatus, readonly PlanStatus[]> = {
  active: ['completed', 'archived'],
  archived: [],
  completed: ['archived'],
  draft: ['active', 'archived'],
};

const TASK_NEXT: Record<TaskStatus, readonly TaskStatus[]> = {
  blocked: ['in_progress', 'cancelled'],
  cancelled: [],
  completed: [],
  in_progress: ['blocked', 'completed', 'cancelled'],
  todo: ['in_progress', 'blocked', 'completed', 'cancelled'],
};

const LABELS: Record<string, string> = {
  active: 'Ativar plano',
  archived: 'Arquivar',
  blocked: 'Bloquear',
  cancelled: 'Cancelar',
  completed: 'Concluir',
  in_progress: 'Iniciar',
};

export function PlanActions({
  context,
  planId,
  status,
}: Readonly<{ context: PortalContext; planId: string; status: PlanStatus }>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="workflow-actions">
      {PLAN_NEXT[status].map((next) => (
        <button
          disabled={pending}
          key={next}
          onClick={() => {
            const idempotencyKey = crypto.randomUUID();
            startTransition(async () => {
              const result = await transitionPlanAction({
                ...context,
                idempotencyKey,
                planId,
                reasonCode: 'portal_plan_update',
                toStatus: next,
              });
              setMessage(result.ok ? 'Plano atualizado.' : (result.error ?? 'Falha ao atualizar.'));
              if (result.ok) router.refresh();
            });
          }}
          type="button"
        >
          {LABELS[next]}
        </button>
      ))}
      <span aria-live="polite">{message}</span>
    </div>
  );
}

export function TaskActions({
  context,
  status,
  taskId,
}: Readonly<{ context: PortalContext; status: TaskStatus; taskId: string }>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  return (
    <div className="task-actions">
      {TASK_NEXT[status].map((next) => (
        <button
          disabled={pending}
          key={next}
          onClick={() => {
            const idempotencyKey = crypto.randomUUID();
            startTransition(async () => {
              const result = await transitionTaskAction({
                ...context,
                idempotencyKey,
                reasonCode: 'portal_task_update',
                taskId,
                toStatus: next,
              });
              setMessage(
                result.ok ? 'Tarefa atualizada.' : (result.error ?? 'Falha ao atualizar.'),
              );
              if (result.ok) router.refresh();
            });
          }}
          type="button"
        >
          {LABELS[next]}
        </button>
      ))}
      <span aria-live="polite" className="sr-only">
        {message}
      </span>
    </div>
  );
}
