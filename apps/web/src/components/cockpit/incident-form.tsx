'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createIncidentSchema, type CreateIncidentInput } from '@althion/contracts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { createIncidentAction } from '@/app/cockpit/conta/actions';
import type { PortalContext } from '@/lib/portal-context';

const CATEGORIES = [
  ['integration_failure', 'Falha de integração'],
  ['data_quality', 'Qualidade dos dados'],
  ['sla_breach', 'SLA estourado'],
  ['engagement_risk', 'Risco de engajamento'],
  ['operational', 'Operacional'],
  ['other', 'Outro'],
] as const;

export function IncidentForm({ context }: Readonly<{ context: PortalContext }>) {
  const router = useRouter();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [message, setMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<z.input<typeof createIncidentSchema>, unknown, CreateIncidentInput>({
    defaultValues: { category: 'operational', details: '', severity: 'medium', subject: '' },
    resolver: zodResolver(createIncidentSchema),
  });

  const submit = handleSubmit(async (input) => {
    setMessage(null);
    const result = await createIncidentAction({ ...context, ...input, idempotencyKey });
    if (!result.ok) {
      setMessage(result.error ?? 'Não foi possível registrar o incidente.');
      return;
    }
    reset();
    setIdempotencyKey(crypto.randomUUID());
    setMessage('Incidente registrado.');
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
          Severidade operacional
          <select {...register('severity')}>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
          <small>Severidade é impacto operacional da conta; nunca urgência clínica.</small>
        </label>
      </div>
      <label>
        Assunto
        <input
          {...register('subject')}
          maxLength={160}
          placeholder="Ex.: Cobertura do Radar em queda"
        />
        {errors.subject ? <span className="field-error">{errors.subject.message}</span> : null}
      </label>
      <label>
        Contexto operacional
        <textarea
          {...register('details')}
          maxLength={1000}
          placeholder="Descreva o impacto operacional observado e a evidência."
          rows={4}
        />
        <small>Não inclua nome de paciente, diagnóstico, exame, medicamento ou dado clínico.</small>
        {errors.details ? <span className="field-error">{errors.details.message}</span> : null}
      </label>
      <div className="form-footer">
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Registrando…' : 'Registrar incidente'}
        </button>
        <span aria-live="polite" className="form-message">
          {message}
        </span>
      </div>
    </form>
  );
}
