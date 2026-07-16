'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createRequestSchema, type CreateRequestInput } from '@althion/contracts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { createRequestAction } from '@/app/app/solicitacoes/actions';
import type { PortalContext } from '@/lib/portal-context';

const CATEGORIES = [
  ['access', 'Acesso'],
  ['integration', 'Integração'],
  ['data_quality', 'Qualidade dos dados'],
  ['operational_support', 'Apoio operacional'],
  ['meeting', 'Reunião'],
  ['other', 'Outro assunto'],
] as const;

export function RequestForm({
  context,
  defaultCategory,
}: Readonly<{ context: PortalContext; defaultCategory?: string }>) {
  const router = useRouter();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [message, setMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<z.input<typeof createRequestSchema>, unknown, CreateRequestInput>({
    defaultValues: {
      category: CATEGORIES.some(([value]) => value === defaultCategory)
        ? (defaultCategory as CreateRequestInput['category'])
        : 'operational_support',
      details: '',
      priority: 'normal',
      subject: '',
    },
    resolver: zodResolver(createRequestSchema),
  });

  const submit = handleSubmit(async (input) => {
    setMessage(null);
    const result = await createRequestAction({
      ...context,
      ...input,
      idempotencyKey,
    });
    if (!result.ok) {
      setMessage(result.error ?? 'Não foi possível criar a solicitação.');
      return;
    }
    reset();
    setIdempotencyKey(crypto.randomUUID());
    setMessage('Solicitação registrada com sucesso.');
    router.refresh();
  });

  return (
    <form className="portal-form" onSubmit={submit}>
      <div className="form-grid two-columns">
        <label>
          Categoria
          <select {...register('category')}>
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Prioridade operacional
          <select {...register('priority')}>
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
          <small>“Urgente” nunca significa urgência médica.</small>
        </label>
      </div>
      <label>
        Assunto
        <input
          {...register('subject')}
          maxLength={160}
          placeholder="Ex.: Revisão da cobertura do Radar"
        />
        {errors.subject ? <span className="field-error">{errors.subject.message}</span> : null}
      </label>
      <label>
        Contexto administrativo
        <textarea
          {...register('details')}
          maxLength={1000}
          placeholder="Descreva o objetivo operacional e o resultado esperado."
          rows={5}
        />
        <small>Não inclua nome de paciente, diagnóstico, exame, medicamento ou dado clínico.</small>
        {errors.details ? <span className="field-error">{errors.details.message}</span> : null}
      </label>
      <div className="form-footer">
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Registrando…' : 'Criar solicitação'}
        </button>
        <span aria-live="polite" className="form-message">
          {message}
        </span>
      </div>
    </form>
  );
}
