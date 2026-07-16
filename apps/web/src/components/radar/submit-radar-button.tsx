'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { submitRadarAssessment } from '@/app/app/radar/actions';
import { radarQuery, type RadarContext } from '@/lib/radar-context';

interface SubmitRadarButtonProps {
  readonly assessmentId: string;
  readonly context: RadarContext;
}

export function SubmitRadarButton({ assessmentId, context }: SubmitRadarButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    setPending(true);
    setMessage('');
    const result = await submitRadarAssessment(
      context.organizationId,
      context.clinicId,
      assessmentId,
    );
    if (result.kind !== 'success') {
      setMessage(result.message);
      setPending(false);
      return;
    }
    router.push(`/app/score/${result.id}?${radarQuery(context)}`);
    router.refresh();
  };

  return (
    <div>
      <button className="primary-button" disabled={pending} onClick={submit} type="button">
        {pending ? 'Calculando…' : 'Enviar e calcular Score'}
      </button>
      <p aria-live="polite" className={message ? 'form-message error' : 'form-message'}>
        {message}
      </p>
    </div>
  );
}
