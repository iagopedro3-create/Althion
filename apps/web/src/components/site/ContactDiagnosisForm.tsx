'use client';

import { useEffect, useState } from 'react';

interface DiagnosisState {
  name: string;
  email: string;
  whatsapp: string;
  role: string;
  clinicName: string;
  city: string;
  specialty: string;
  professionalsCount: string;
  monthlyContacts: string;
  mainChannel: string;
  avgResponseTime: string;
  mainDifficulty: string;
  consent: boolean;
}

const INITIAL_STATE: DiagnosisState = {
  name: '',
  email: '',
  whatsapp: '',
  role: '',
  clinicName: '',
  city: '',
  specialty: '',
  professionalsCount: '',
  monthlyContacts: '',
  mainChannel: 'whatsapp',
  avgResponseTime: '',
  mainDifficulty: '',
  consent: false,
};

export function ContactDiagnosisForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<DiagnosisState>(INITIAL_STATE);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('althion_diagnosis_draft');
      if (saved) {
        setForm(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save draft on change
  const updateField = (field: keyof DiagnosisState, value: string | boolean) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    try {
      localStorage.setItem('althion_diagnosis_draft', JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const nextStep = () => {
    setError(null);
    if (step === 1) {
      if (!form.name.trim() || !form.email.trim() || !form.whatsapp.trim() || !form.role.trim()) {
        setError('Por favor, preencha todos os dados de contato.');
        return;
      }
    } else if (step === 2) {
      if (!form.clinicName.trim() || !form.city.trim() || !form.specialty.trim() || !form.professionalsCount) {
        setError('Por favor, preencha todos os dados da clínica.');
        return;
      }
    } else if (step === 3) {
      if (!form.monthlyContacts || !form.avgResponseTime || !form.mainDifficulty.trim()) {
        setError('Por favor, responda às perguntas operacionais.');
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

    if (!form.consent) {
      setError('É necessário aceitar os termos de consentimento para continuar.');
      return;
    }

    setLoading(true);

    // Simulate sending data to API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    setSuccess(true);
    try {
      localStorage.removeItem('althion_diagnosis_draft');
    } catch {
      // Ignore storage errors
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🎉</span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 12px 0' }}>
          Recebemos as informações da sua clínica!
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 24px' }}>
          Obrigado por enviar os dados operacionais. Nossa equipe de analistas iniciará a auditoria preliminar e o seu Especialista de Relacionamento entrará em contato para agendar a entrega do diagnóstico completo.
        </p>
        <button
          className="primary-button"
          onClick={() => {
            setSuccess(false);
            setStep(1);
            setForm(INITIAL_STATE);
          }}
          type="button"
        >
          Enviar Novo Diagnóstico
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '16px', padding: '32px', maxWidth: '640px', margin: '0 auto' }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: '600', marginBottom: '8px' }}>
          <span>Etapa {step} de 4</span>
          <span>
            {step === 1 && 'Informações de Contato'}
            {step === 2 && 'Sobre a Clínica'}
            {step === 3 && 'Diagnóstico da Operação'}
            {step === 4 && 'Confirmação'}
          </span>
        </div>
        <div style={{ height: '4px', background: 'var(--line)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--primary)', width: `${(step / 4) * 100}%`, transition: 'width 0.3s ease' }} />
        </div>
      </div>

      <form className="portal-form" onSubmit={(e) => void submit(e)}>
        {/* Step 1: Contact Details */}
        {step === 1 && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <label>
              Nome completo
              <input
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Ex: Dra. Mariana Costa"
                required
                type="text"
                value={form.name}
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
              WhatsApp de contato
              <input
                onChange={(e) => updateField('whatsapp', e.target.value)}
                placeholder="Ex: (11) 98888-7777"
                required
                type="text"
                value={form.whatsapp}
              />
            </label>
            <label>
              Seu cargo / função na clínica
              <input
                onChange={(e) => updateField('role', e.target.value)}
                placeholder="Ex: Sócia-Diretora / Gestora / Médica"
                required
                type="text"
                value={form.role}
              />
            </label>
          </div>
        )}

        {/* Step 2: Clinic Details */}
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
                placeholder="Ex: São Paulo / SP"
                required
                type="text"
                value={form.city}
              />
            </label>
            <label>
              Especialidade principal
              <input
                onChange={(e) => updateField('specialty', e.target.value)}
                placeholder="Ex: Dermatologia / Odontologia Estética"
                required
                type="text"
                value={form.specialty}
              />
            </label>
            <label>
              Quantidade de profissionais de saúde
              <input
                onChange={(e) => updateField('professionalsCount', e.target.value)}
                placeholder="Ex: 4 profissionais"
                required
                type="text"
                value={form.professionalsCount}
              />
            </label>
          </div>
        )}

        {/* Step 3: Operational Details */}
        {step === 3 && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <label>
              Volume aproximado de novos contatos/leads por mês
              <input
                onChange={(e) => updateField('monthlyContacts', e.target.value)}
                placeholder="Ex: 300 contatos"
                required
                type="text"
                value={form.monthlyContacts}
              />
            </label>
            <label>
              Canal principal de atração
              <select
                onChange={(e) => updateField('mainChannel', e.target.value)}
                value={form.mainChannel}
              >
                <option value="whatsapp">WhatsApp direto</option>
                <option value="instagram">Instagram Direct / Redes Sociais</option>
                <option value="site">Site institucional / Landing Pages</option>
                <option value="indicacao">Indicação / Boca a boca</option>
              </select>
            </label>
            <label>
              Tempo médio estimado de resposta da recepção
              <input
                onChange={(e) => updateField('avgResponseTime', e.target.value)}
                placeholder="Ex: 1 hora / 15 minutos"
                required
                type="text"
                value={form.avgResponseTime}
              />
            </label>
            <label>
              Principal dificuldade ou gargalo operacional identificado
              <textarea
                onChange={(e) => updateField('mainDifficulty', e.target.value)}
                placeholder="Ex: Muitos cancelamentos de véspera que não conseguimos preencher."
                required
                rows={3}
                value={form.mainDifficulty}
              />
            </label>
          </div>
        )}

        {/* Step 4: Confirmation & Consent */}
        {step === 4 && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ background: 'rgba(30, 58, 138, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 'bold' }}>Resumo Operacional</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--muted)', display: 'grid', gap: '6px' }}>
                <li>**Contato:** {form.name} ({form.role})</li>
                <li>**Clínica:** {form.clinicName} — {form.city}</li>
                <li>**Equipe:** {form.professionalsCount} profissionais</li>
                <li>**Métrica:** {form.monthlyContacts} contatos/mês, resposta {form.avgResponseTime}</li>
              </ul>
            </div>

            <label className="checkbox-field">
              <input
                checked={form.consent}
                onChange={(e) => updateField('consent', e.target.checked)}
                required
                type="checkbox"
              />
              <span>
                Concordo com a coleta e processamento destes dados operacionais da clínica exclusivamente para fins de elaboração do diagnóstico inicial de performance de agenda, em conformidade com as diretrizes da LGPD e Termos de Uso.
              </span>
            </label>
          </div>
        )}

        {error ? (
          <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '12px', fontWeight: '600' }} role="alert">
            ⚠️ {error}
          </div>
        ) : null}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          {step > 1 ? (
            <button
              className="quiet-button"
              onClick={prevStep}
              type="button"
            >
              Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              className="primary-button"
              onClick={nextStep}
              type="button"
            >
              Próxima Etapa
            </button>
          ) : (
            <button
              className="primary-button"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Processando…' : 'Solicitar Diagnóstico'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
