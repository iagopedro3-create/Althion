'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { submitContactAction } from '@/app/(site)/contato/actions';
import { contactSchema, type ContactInput } from '@/lib/site/contact';

export function ContactForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ContactInput>({
    defaultValues: {
      clinic: '',
      consent: false as unknown as true,
      email: '',
      message: '',
      name: '',
      phone: '',
    },
    resolver: zodResolver(contactSchema),
  });

  const submit = handleSubmit(async (input) => {
    setMessage(null);
    const result = await submitContactAction(input);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setDone(true);
    setMessage('Contato enviado. Retornaremos em breve.');
  });

  if (done) {
    return (
      <p aria-live="polite" className="form-message">
        Contato enviado. Retornaremos em breve.
      </p>
    );
  }

  return (
    <form className="portal-form" onSubmit={submit}>
      <div className="form-grid two-columns">
        <label>
          Nome
          <input {...register('name')} autoComplete="name" maxLength={120} />
          {errors.name ? <span className="field-error">{errors.name.message}</span> : null}
        </label>
        <label>
          E-mail corporativo
          <input {...register('email')} autoComplete="email" inputMode="email" maxLength={160} />
          {errors.email ? <span className="field-error">{errors.email.message}</span> : null}
        </label>
      </div>
      <div className="form-grid two-columns">
        <label>
          Clínica ou organização
          <input {...register('clinic')} autoComplete="organization" maxLength={160} />
          {errors.clinic ? <span className="field-error">{errors.clinic.message}</span> : null}
        </label>
        <label>
          Telefone ou WhatsApp (opcional)
          <input {...register('phone')} autoComplete="tel" inputMode="tel" maxLength={40} />
          {errors.phone ? <span className="field-error">{errors.phone.message}</span> : null}
        </label>
      </div>
      <label>
        Mensagem (opcional)
        <textarea
          {...register('message')}
          maxLength={1000}
          placeholder="Conte um pouco sobre a operação da clínica."
          rows={4}
        />
        <small>Não inclua nome de paciente, diagnóstico ou qualquer dado clínico.</small>
      </label>
      <label className="checkbox-field">
        <input {...register('consent')} type="checkbox" />
        <span>
          Concordo com o uso destes dados para retorno do contato, conforme a política de
          privacidade.
        </span>
      </label>
      {errors.consent ? <span className="field-error">{errors.consent.message}</span> : null}
      <div className="form-footer">
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Enviando…' : 'Enviar contato'}
        </button>
        <span aria-live="polite" className="form-message">
          {message}
        </span>
      </div>
    </form>
  );
}
