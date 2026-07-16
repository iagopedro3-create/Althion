'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, type CreateTaskInput } from '@althion/contracts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createTaskAction } from '@/app/app/plano-de-melhoria/actions';
import type { PortalPersonView } from '@/lib/api/portal';
import type { PortalContext } from '@/lib/portal-context';

const taskFormSchema = createTaskSchema.extend({
  assigneeProfileId: z
    .union([z.literal(''), z.uuid()])
    .nullable()
    .optional(),
  dueAt: z
    .union([
      z.literal(''),
      z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: 'Informe um prazo vÃ¡lido.',
      }),
    ])
    .nullable()
    .optional(),
});

type TaskFormInput = z.input<typeof taskFormSchema>;
type TaskFormOutput = z.output<typeof taskFormSchema>;

export function TaskForm({
  context,
  people,
  planId,
}: Readonly<{ context: PortalContext; people: readonly PortalPersonView[]; planId: string }>) {
  const router = useRouter();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [message, setMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<TaskFormInput, unknown, TaskFormOutput>({
    defaultValues: {
      assigneeProfileId: null,
      dueAt: null,
      priority: 'normal',
      radarRecommendationId: null,
      title: '',
    },
    resolver: zodResolver(taskFormSchema),
  });

  const submit = handleSubmit(async (input) => {
    const task: CreateTaskInput = {
      assigneeProfileId: input.assigneeProfileId || null,
      dueAt: input.dueAt ? new Date(input.dueAt).toISOString() : null,
      priority: input.priority,
      radarRecommendationId: input.radarRecommendationId,
      title: input.title,
    };
    const result = await createTaskAction({
      ...context,
      ...task,
      idempotencyKey,
      planId,
    });
    setMessage(result.ok ? 'Tarefa adicionada.' : (result.error ?? 'Falha ao criar tarefa.'));
    if (result.ok) {
      reset();
      setIdempotencyKey(crypto.randomUUID());
      router.refresh();
    }
  });

  return (
    <form className="portal-form compact-form" onSubmit={submit}>
      <label>
        Próxima ação administrativa
        <input
          {...register('title')}
          maxLength={160}
          placeholder="Ex.: Revisar follow-up dos leads"
        />
        {errors.title ? <span className="field-error">{errors.title.message}</span> : null}
      </label>
      <div className="form-grid three-columns">
        <label>
          Prioridade
          <select {...register('priority')}>
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
          </select>
        </label>
        <label>
          Responsável
          <select {...register('assigneeProfileId')}>
            <option value="">Não atribuído</option>
            {people.map((person) => (
              <option key={person.profile_id} value={person.profile_id}>
                {person.display_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Prazo
          <input {...register('dueAt')} type="datetime-local" />
        </label>
      </div>
      <div className="form-footer">
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Adicionando…' : 'Adicionar tarefa'}
        </button>
        <span aria-live="polite">{message}</span>
      </div>
    </form>
  );
}
