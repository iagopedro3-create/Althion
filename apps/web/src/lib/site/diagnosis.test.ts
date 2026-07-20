import { describe, expect, it } from 'vitest';
import { DIAGNOSIS_CHANNEL_CONFIGURED, diagnosisSchema } from './diagnosis';

const validDiagnosis = {
  avgResponseTime: '15 minutos',
  city: 'São Paulo',
  clinicName: 'Clínica Sintética',
  consent: true,
  email: 'contato@example.com',
  investsAds: 'sim',
  mainChannel: 'whatsapp',
  mainDifficulty: 'Organizar o retorno aos contatos administrativos.',
  monthlyContacts: '100',
  name: 'Pessoa de Teste',
  professionalsCount: '5',
  role: 'Gestão',
  specialty: 'Multidisciplinar',
  website: '',
  whatsapp: '+55 (11) 99999-9999',
} as const;

describe('public diagnosis boundary', () => {
  it('keeps submission disabled until the operational channel is approved', () => {
    expect(DIAGNOSIS_CHANNEL_CONFIGURED).toBe(false);
  });

  it('accepts a complete synthetic payload', () => {
    expect(diagnosisSchema.safeParse(validDiagnosis).success).toBe(true);
  });

  it('rejects bots that fill the honeypot', () => {
    const parsed = diagnosisSchema.safeParse({
      ...validDiagnosis,
      website: 'https://spam.example',
    });

    expect(parsed.success).toBe(false);
  });

  it('rejects contact data without consent', () => {
    const parsed = diagnosisSchema.safeParse({
      ...validDiagnosis,
      consent: false,
    });

    expect(parsed.success).toBe(false);
  });
});
