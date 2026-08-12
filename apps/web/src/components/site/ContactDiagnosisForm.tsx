'use client';

import { useState, type FormEvent } from 'react';

import { submitDiagnosisAction } from '@/app/(site)/diagnostico/actions';

interface DiagnosisState {
  clinicName: string;
  consent: boolean;
  dailyContactAverage: string;
  email: string;
  mainDifficulty: string;
  name: string;
  professionalsCount: string;
  specialty: string;
  website: string;
  whatsapp: string;
}

const INITIAL_STATE: DiagnosisState = {
  clinicName: '',
  consent: false,
  dailyContactAverage: '',
  email: '',
  mainDifficulty: '',
  name: '',
  professionalsCount: '',
  specialty: '',
  website: '',
  whatsapp: '',
};

const SPECIALTIES = [
  'Clínica médica',
  'Odontologia',
  'Estética e dermatologia',
  'Psicologia',
  'Fisioterapia',
  'Nutrição',
  'Veterinária',
] as const;

export function ContactDiagnosisForm({
  channelConfigured,
}: Readonly<{ channelConfigured: boolean }>) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [error, setError] = useState('');

  function updateField<K extends keyof DiagnosisState>(field: K, value: DiagnosisState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setStatus('sending');

    const result = await submitDiagnosisAction({
      ...form,
      dailyContactAverage: Number(form.dailyContactAverage),
      professionalsCount: Number(form.professionalsCount),
    });

    if (!result.ok) {
      setError(result.error);
      setStatus('idle');
      return;
    }

    setForm(INITIAL_STATE);
    setStatus('success');
  }

  if (status === 'success') {
    return (
      <div className="diagnosis-lead-success" role="status">
        <span aria-hidden="true" className="diagnosis-success-mark">
          ✓
        </span>
        <p className="eyebrow">Solicitação recebida</p>
        <h2>Obrigado. Agora vamos conhecer melhor sua operação.</h2>
        <p>
          A equipe Althion analisará o contexto inicial e entrará em contato para orientar a próxima
          etapa. O diagnóstico será conduzido internamente pela nossa equipe.
        </p>
        <div className="diagnosis-next-steps">
          <span>01</span>
          <p>
            <strong>Contato e alinhamento</strong>
            Confirmamos o contexto, o objetivo e o escopo.
          </p>
          <span>02</span>
          <p>
            <strong>Diagnóstico pela Althion</strong>
            Orientamos a coleta e nossa equipe analisa a operação.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="diagnosis-lead-form" onSubmit={(event) => void submit(event)}>
      <div className="diagnosis-form-heading">
        <p className="eyebrow">Conte sobre sua operação</p>
        <h2>Solicitar contato para o diagnóstico</h2>
        <p>Leva cerca de 2 minutos.</p>
        <p className="diagnosis-process-note">
          O diagnóstico não é gerado automaticamente. Ele é realizado pela equipe Althion após o
          contato inicial.
        </p>
      </div>

      {!channelConfigured ? (
        <div className="site-note-card" role="status">
          <strong>Envio temporariamente indisponível</strong>
          <p>Estamos finalizando a configuração do canal. Tente novamente em instantes.</p>
        </div>
      ) : null}

      <div className="diagnosis-form-grid">
        <label className="diagnosis-field diagnosis-field-wide">
          <span>Nome da clínica</span>
          <input
            autoComplete="organization"
            maxLength={160}
            name="clinicName"
            onChange={(event) => updateField('clinicName', event.target.value)}
            required
            value={form.clinicName}
          />
        </label>

        <label className="diagnosis-field">
          <span>Nome do responsável</span>
          <input
            autoComplete="name"
            maxLength={120}
            name="name"
            onChange={(event) => updateField('name', event.target.value)}
            required
            value={form.name}
          />
        </label>

        <label className="diagnosis-field">
          <span>WhatsApp</span>
          <input
            autoComplete="tel"
            maxLength={40}
            name="whatsapp"
            onChange={(event) => updateField('whatsapp', event.target.value)}
            placeholder="(00) 00000-0000"
            required
            type="tel"
            value={form.whatsapp}
          />
        </label>

        <label className="diagnosis-field">
          <span>
            E-mail <small>opcional</small>
          </span>
          <input
            autoComplete="email"
            maxLength={160}
            name="email"
            onChange={(event) => updateField('email', event.target.value)}
            type="email"
            value={form.email}
          />
        </label>

        <label className="diagnosis-field">
          <span>Nicho</span>
          <input
            list="diagnosis-specialties"
            maxLength={120}
            name="specialty"
            onChange={(event) => updateField('specialty', event.target.value)}
            placeholder="Ex.: odontologia"
            required
            value={form.specialty}
          />
          <datalist id="diagnosis-specialties">
            {SPECIALTIES.map((specialty) => (
              <option key={specialty} value={specialty} />
            ))}
          </datalist>
        </label>

        <label className="diagnosis-field">
          <span>Quantos profissionais?</span>
          <input
            inputMode="numeric"
            max={10_000}
            min={1}
            name="professionalsCount"
            onChange={(event) => updateField('professionalsCount', event.target.value)}
            required
            type="number"
            value={form.professionalsCount}
          />
        </label>

        <label className="diagnosis-field">
          <span>Média de contatos por dia</span>
          <input
            inputMode="numeric"
            max={100_000}
            min={0}
            name="dailyContactAverage"
            onChange={(event) => updateField('dailyContactAverage', event.target.value)}
            required
            type="number"
            value={form.dailyContactAverage}
          />
        </label>

        <label className="diagnosis-field diagnosis-field-wide">
          <span>Qual é hoje a maior dificuldade da operação?</span>
          <textarea
            maxLength={2_000}
            minLength={10}
            name="mainDifficulty"
            onChange={(event) => updateField('mainDifficulty', event.target.value)}
            placeholder="Conte onde você sente que as oportunidades mais se perdem."
            required
            rows={5}
            value={form.mainDifficulty}
          />
        </label>
      </div>

      <label className="diagnosis-consent">
        <input
          checked={form.consent}
          name="consent"
          onChange={(event) => updateField('consent', event.target.checked)}
          required
          type="checkbox"
        />
        <span>
          Autorizo a Althion a entrar em contato para conduzir a solicitação de diagnóstico.
        </span>
      </label>

      <label aria-hidden="true" className="diagnosis-honeypot">
        Website
        <input
          autoComplete="off"
          name="website"
          onChange={(event) => updateField('website', event.target.value)}
          tabIndex={-1}
          value={form.website}
        />
      </label>

      {error ? (
        <p className="diagnosis-form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="site-cta-primary diagnosis-submit"
        disabled={status === 'sending' || !channelConfigured}
        type="submit"
      >
        {status === 'sending' ? 'Enviando…' : 'Solicitar contato para o diagnóstico'}
      </button>
      <p className="diagnosis-privacy-note">
        Usaremos seus dados apenas para avaliar a solicitação e realizar o contato comercial.
      </p>
    </form>
  );
}
