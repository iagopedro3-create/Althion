import { describe, expect, it } from 'vitest';
import { diagnosisSchema } from './diagnosis';

const validDiagnosis = {
  clinicName: 'Clínica Sintética',
  consent: true,
  dailyContactAverage: 25,
  email: '',
  mainDifficulty: 'Organizar o retorno aos contatos administrativos.',
  name: 'Pessoa de Teste',
  professionalsCount: 5,
  specialty: 'Multidisciplinar',
  website: '',
  whatsapp: '+55 (11) 99999-9999',
} as const;

describe('public diagnosis boundary', () => {
  it('accepts a complete synthetic payload', () => {
    expect(diagnosisSchema.safeParse(validDiagnosis).success).toBe(true);
  });

  it('accepts the honeypot value so the action can silently discard bots', () => {
    const parsed = diagnosisSchema.safeParse({
      ...validDiagnosis,
      website: 'https://spam.example',
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects contact data without consent', () => {
    const parsed = diagnosisSchema.safeParse({
      ...validDiagnosis,
      consent: false,
    });

    expect(parsed.success).toBe(false);
  });
});
