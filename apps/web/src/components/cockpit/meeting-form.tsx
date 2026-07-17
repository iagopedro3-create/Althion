'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createMeetingSchema, type CreateMeetingInput } from '@althion/contracts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { createMeetingAction } from '@/app/cockpit/conta/actions';
import type { PortalContext } from '@/lib/portal-context';

const PURPOSES = [
  ['checkin', 'Check-in'],
  ['onboarding', 'Onboarding'],
  ['review', 'Revisão'],
  ['escalation', 'Escalonamento'],
  ['other', 'Outro'],
] as const;

export function MeetingForm({ context }: Readonly<{ context: PortalContext }>) {
  const router = useRouter();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [message, setMessage] = useState<string | null>(null);
  const [localDateTime, setLocalDateTime] = useState('');
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<z.input<typeof createMeetingSchema>, unknown, CreateMeetingInput>({
    defaultValues: { purpose: 'checkin', scheduledAt: '', summary: null },
    resolver: zodResolver(createMeetingSchema),
  });

  const submit = handleSubmit(async (input) => {
    setMessage(null);
    const result = await createMeetingAction({ ...context, ...input, idempotencyKey });
    if (!result.ok) {
      setMessage(result.error ?? 'Não foi possível registrar a reunião.');
      return;
    }
    reset();
    setLocalDateTime('');
    setIdempotencyKey(crypto.randomUUID());
    setMessage('Reunião registrada.');
    router.refresh();
  });

  return (
    <form className="portal-form" onSubmit={submit}>
      <div className="form-grid two-columns">
        <label>
          Objetivo
          <select {...register('purpose')}>
            {PURPOSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Data e hora
          <input
            onChange={(event) => {
              setLocalDateTime(event.target.value);
              const value = event.target.value;
              setValue('scheduledAt', value ? new Date(value).toISOString() : '', {
                shouldValidate: Boolean(value),
              });
            }}
            type="datetime-local"
            value={localDateTime}
          />
          {errors.scheduledAt ? (
            <span className="field-error">Informe data e hora válidas.</span>
          ) : null}
        </label>
      </div>
      <label>
        Pauta (opcional)
        <input
          {...register('summary', { setValueAs: (value: string) => (value ? value : null) })}
          maxLength={500}
          placeholder="Ex.: Revisão do plano de melhoria do trimestre"
        />
        <small>Não inclua nome de paciente ou qualquer dado clínico.</small>
        {errors.summary ? <span className="field-error">{errors.summary.message}</span> : null}
      </label>
      <div className="form-footer">
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Registrando…' : 'Registrar reunião'}
        </button>
        <span aria-live="polite" className="form-message">
          {message}
        </span>
      </div>
    </form>
  );
}
