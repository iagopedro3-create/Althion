'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createImprovementPlanSchema, type CreateImprovementPlanInput } from '@althion/contracts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { createPlanAction } from '@/app/app/plano-de-melhoria/actions';
import type { PortalContext } from '@/lib/portal-context';

export function PlanForm({ context }: Readonly<{ context: PortalContext }>) {
  const router = useRouter();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [message, setMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<CreateImprovementPlanInput>({
    defaultValues: { periodEnd: null, periodStart: null, sourceScoreId: null, title: '' },
    resolver: zodResolver(createImprovementPlanSchema),
  });

  const submit = handleSubmit(async (input) => {
    setMessage(null);
    const result = await createPlanAction({
      ...context,
      ...input,
      idempotencyKey,
      periodEnd: input.periodEnd || null,
      periodStart: input.periodStart || null,
    });
    setMessage(result.ok ? 'Plano criado como rascunho.' : (result.error ?? 'Falha ao criar.'));
    if (result.ok) {
      setIdempotencyKey(crypto.randomUUID());
      router.refresh();
    }
  });

  return (
    <form className="portal-form compact-form" onSubmit={submit}>
      <label>
        Nome do plano
        <input
          {...register('title')}
          maxLength={160}
          placeholder="Ex.: Plano de continuidade do trimestre"
        />
        {errors.title ? <span className="field-error">{errors.title.message}</span> : null}
      </label>
      <div className="form-grid two-columns">
        <label>
          Início opcional
          <input {...register('periodStart')} type="date" />
        </label>
        <label>
          Fim opcional
          <input {...register('periodEnd')} type="date" />
        </label>
      </div>
      {errors.periodEnd ? <span className="field-error">{errors.periodEnd.message}</span> : null}
      <div className="form-footer">
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Criando…' : 'Criar plano'}
        </button>
        <span aria-live="polite">{message}</span>
      </div>
    </form>
  );
}
