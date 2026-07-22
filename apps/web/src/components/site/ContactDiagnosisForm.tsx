'use client';

import { useEffect, useState } from 'react';

import { submitDiagnosisAction } from '@/app/(site)/diagnostico/actions';

interface DiagnosisState {
  name: string;
  role: string;
  email: string;
  whatsapp: string;
  clinicName: string;
  city: string;
  specialty: string;
  professionalsCount: string;
  monthlyContacts: string;
  mainChannel: string;
  avgResponseTime: string;
  mainDifficulty: string;
  investsAds: string;
  consent: boolean;
}

const INITIAL_STATE: DiagnosisState = {
  name: '',
  role: '',
  email: '',
  whatsapp: '',
  clinicName: '',
  city: '',
  specialty: '',
  professionalsCount: '',
  monthlyContacts: '',
  mainChannel: 'whatsapp',
  avgResponseTime: '',
  mainDifficulty: '',
  investsAds: 'nao',
  consent: false,
};

type DiagnosisDraft = Pick<
  DiagnosisState,
  | 'avgResponseTime'
  | 'city'
  | 'clinicName'
  | 'investsAds'
  | 'mainChannel'
  | 'mainDifficulty'
  | 'monthlyContacts'
  | 'professionalsCount'
  | 'specialty'
>;

const toDraft = (state: DiagnosisState): DiagnosisDraft => ({
  avgResponseTime: state.avgResponseTime,
  city: state.city,
  clinicName: state.clinicName,
  investsAds: state.investsAds,
  mainChannel: state.mainChannel,
  mainDifficulty: state.mainDifficulty,
  monthlyContacts: state.monthlyContacts,
  professionalsCount: state.professionalsCount,
  specialty: state.specialty,
});

export function ContactDiagnosisForm({
  channelConfigured,
}: Readonly<{ channelConfigured: boolean }>) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<DiagnosisState>(INITIAL_STATE);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    try {
      const saved = localStorage.getItem('althion_diagnosis_draft_v2');
      if (saved) {
        const restored = JSON.parse(saved) as DiagnosisDraft;
        queueMicrotask(() => {
          if (!cancelled) setForm((current) => ({ ...current, ...restored }));
        });
      }
    } catch {
      // Ignore storage errors
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = (field: keyof DiagnosisState, value: string | boolean) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    try {
      localStorage.setItem('althion_diagnosis_draft_v2', JSON.stringify(toDraft(updated)));
    } catch {
      // Ignore storage errors
    }
  };

  const nextStep = () => {
    setError(null);
    if (step === 1) {
      if (!form.name.trim() || !form.role.trim() || !form.email.trim() || !form.whatsapp.trim()) {
        setError('Por favor, preencha todos os campos de contato.');
        return;
      }
    } else if (step === 2) {
      if (
        !form.clinicName.trim() ||
        !form.city.trim() ||
        !form.specialty.trim() ||
        !form.professionalsCount.trim()
      ) {
        setError('Por favor, preencha todos os campos da clínica.');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !form.monthlyContacts.trim() ||
      !form.avgResponseTime.trim() ||
      !form.mainDifficulty.trim()
    ) {
      setError('Por favor, responda às perguntas operacionais.');
      return;
    }

    if (!form.consent) {
      setError('É necessário aceitar os termos de consentimento para enviar.');
      return;
    }

    setLoading(true);
    const result = await submitDiagnosisAction(form);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    try {
      localStorage.removeItem('althion_diagnosis_draft_v2');
    } catch {
      // Ignore storage errors
    }
  };

  if (success) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 32px',
          background: '#FFFFFF',
          border: '1px solid rgba(16, 32, 27, 0.08)',
          borderRadius: '24px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#F4FAF7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            color: '#18A987',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2
          style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            margin: '0 0 12px 0',
            color: 'var(--text)',
          }}
        >
          Informações Recebidas
        </h2>
        <p
          style={{
            color: 'var(--muted)',
            fontSize: '1rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 32px',
          }}
        >
          Nossa equipe analisará os dados operacionais informados. Entraremos em contato em breve
          para apresentar o diagnóstico preliminar da agenda da sua clínica.
        </p>
        <button
          className="primary-button"
          onClick={() => {
            setSuccess(false);
            setStep(1);
            setForm(INITIAL_STATE);
          }}
          type="button"
          style={{
            padding: '12px 24px',
            background: 'var(--text)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Solicitar Novo Diagnóstico
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(16, 32, 27, 0.08)',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.01)',
      }}
    >
      {!channelConfigured ? (
        <div
          className="site-note-card"
          role="status"
          style={{ marginTop: 0, color: 'var(--muted)' }}
        >
          <strong>Canal em preparação</strong>
          <p>
            Você pode conhecer as perguntas, mas o envio está desativado. Nenhum dado será
            armazenado ou encaminhado enquanto destino e política de uso não forem aprovados.
          </p>
        </div>
      ) : null}

      {/* Progress */}
      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--muted)',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
          }}
        >
          <span>Etapa {step} de 3</span>
          <span>
            {step === 1 && 'Contato Comercial'}
            {step === 2 && 'Dados da Clínica'}
            {step === 3 && 'Diagnóstico Operacional'}
          </span>
        </div>
        <div
          style={{ height: '4px', background: '#F5F7F3', borderRadius: '2px', overflow: 'hidden' }}
        >
          <div
            style={{
              height: '100%',
              background: 'var(--text)',
              width: `${(step / 3) * 100}%`,
              transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      <form className="portal-form" onSubmit={(e) => void submit(e)}>
        {/* Step 1: Contact */}
        {step === 1 && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <label>
              Nome completo
              <input
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Ex: Mariana Costa"
                required
                type="text"
                value={form.name}
              />
            </label>
            <label>
              Seu cargo / função na clínica
              <input
                onChange={(e) => updateField('role', e.target.value)}
                placeholder="Ex: Diretora / Gestora / Médica"
                required
                type="text"
                value={form.role}
              />
            </label>
            <label>
              E-mail profissional
              <input
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="Ex: mariana@clinicacosta.com.br"
                required
                type="email"
                value={form.email}
              />
            </label>
            <label>
              WhatsApp profissional
              <input
                onChange={(e) => updateField('whatsapp', e.target.value)}
                placeholder="Ex: (11) 98888-7777"
                required
                type="text"
                value={form.whatsapp}
              />
            </label>
          </div>
        )}

        {/* Step 2: Clinic */}
        {step === 2 && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <label>
              Nome da clínica ou consultório
              <input
                onChange={(e) => updateField('clinicName', e.target.value)}
                placeholder="Ex: Clínica Costa Dermatologia"
                required
                type="text"
                value={form.clinicName}
              />
            </label>
            <label>
              Cidade / Estado (UF)
              <input
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Ex: Porto Alegre / RS"
                required
                type="text"
                value={form.city}
              />
            </label>
            <label>
              Especialidade principal
              <input
                onChange={(e) => updateField('specialty', e.target.value)}
                placeholder="Ex: Dermatologia / Ginecologia"
                required
                type="text"
                value={form.specialty}
              />
            </label>
            <label>
              Quantidade de profissionais de saúde
              <input
                onChange={(e) => updateField('professionalsCount', e.target.value)}
                placeholder="Ex: 5"
                required
                type="text"
                value={form.professionalsCount}
              />
            </label>
          </div>
        )}

        {/* Step 3: Operation */}
        {step === 3 && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <label>
              Volume mensal aproximado de novos contatos / leads
              <input
                onChange={(e) => updateField('monthlyContacts', e.target.value)}
                placeholder="Ex: 250"
                required
                type="text"
                value={form.monthlyContacts}
              />
            </label>
            <label>
              Principal canal de atração de pacientes
              <select
                onChange={(e) => updateField('mainChannel', e.target.value)}
                value={form.mainChannel}
              >
                <option value="whatsapp">WhatsApp profissional</option>
                <option value="redes">Redes Sociais (Direct / Messenger)</option>
                <option value="site">Site institucional / Landing Pages</option>
                <option value="indicacao">Indicações e convênios</option>
              </select>
            </label>
            <label>
              Tempo médio estimado de resposta da recepção
              <input
                onChange={(e) => updateField('avgResponseTime', e.target.value)}
                placeholder="Ex: 40 minutos"
                required
                type="text"
                value={form.avgResponseTime}
              />
            </label>
            <label>
              Principal dificuldade operacional na agenda
              <textarea
                onChange={(e) => updateField('mainDifficulty', e.target.value)}
                placeholder="Ex: Cancelamentos que deixam a vaga ociosa."
                required
                rows={3}
                value={form.mainDifficulty}
              />
            </label>
            <label>
              Sua clínica investe em anúncios pagos (Google/Instagram)?
              <select
                onChange={(e) => updateField('investsAds', e.target.value)}
                value={form.investsAds}
              >
                <option value="sim">Sim, investimos mensalmente</option>
                <option value="nao">Não investimos em tráfego pago</option>
              </select>
            </label>

            <label className="checkbox-field" style={{ marginTop: '12px' }}>
              <input
                checked={form.consent}
                onChange={(e) => updateField('consent', e.target.checked)}
                required
                type="checkbox"
              />
              <span>
                Concordo com a coleta e uso dos dados operacionais exclusivamente para a análise
                inicial de performance da agenda, conforme as diretrizes da política de privacidade.
              </span>
            </label>
          </div>
        )}

        {error ? (
          <div
            style={{ color: '#A83C32', fontSize: '0.85rem', marginTop: '12px', fontWeight: '700' }}
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          {step > 1 ? (
            <button className="quiet-button" onClick={prevStep} type="button">
              Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              className="primary-button"
              onClick={nextStep}
              type="button"
              style={{
                background: 'var(--text)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Avançar
            </button>
          ) : (
            <button
              className="primary-button"
              disabled={loading || !channelConfigured}
              type="submit"
              style={{
                background: 'var(--text)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {loading
                ? 'Processando…'
                : channelConfigured
                  ? 'Solicitar Diagnóstico'
                  : 'Envio ainda indisponível'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
