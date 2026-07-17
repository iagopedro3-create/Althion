import { describe, expect, it } from 'vitest';
import { calculateTotalScore } from './rubrics';
import { scanForClinicalContent } from './guardrails';

describe('Quality Engine - Score Calculation', () => {
  it('calculates total score as average percentage of criteria', () => {
    const scores = {
      response_time: 5, // 100%
      tone_empathy: 5, // 100%
      opportunity_id: 5, // 100%
      compliance: 5, // 100%
      operational_sanity: 5, // 100%
    };

    expect(calculateTotalScore(scores)).toBe(100);
  });

  it('calculates average score when some criteria have lower scores', () => {
    const scores = {
      response_time: 4, // 80%
      tone_empathy: 3, // 60%
      opportunity_id: 5, // 100%
      compliance: 2, // 40%
      operational_sanity: 1, // 20%
    };
    // Sum = 15. Max = 25. 15 / 25 * 100 = 60%
    expect(calculateTotalScore(scores)).toBe(60);
  });

  it('throws error when a score is missing for a criterion', () => {
    const scores = {
      response_time: 4,
      tone_empathy: 3,
      opportunity_id: 5,
      compliance: 2,
      // operational_sanity missing
    };

    expect(() => calculateTotalScore(scores)).toThrow('is missing');
  });

  it('throws error when score is out of bounds', () => {
    const scores = {
      response_time: 6, // max is 5
      tone_empathy: 3,
      opportunity_id: 5,
      compliance: 2,
      operational_sanity: 1,
    };

    expect(() => calculateTotalScore(scores)).toThrow('must be between 0 and 5');
  });
});

describe('Quality Engine - Clinical Guardrail', () => {
  it('detects clinical content based on keyword matching', () => {
    const result1 = scanForClinicalContent('Estou com muita dor de cabeça');
    expect(result1.isClinical).toBe(true);
    expect(result1.reason).toContain('dor');

    const result2 = scanForClinicalContent('O paciente pediu uma nova receita de remédio');
    expect(result2.isClinical).toBe(true);
    expect(result2.reason).toContain('receita');

    const result3 = scanForClinicalContent('Gostaria de avaliar uma mancha na pele');
    expect(result3.isClinical).toBe(true);
    expect(result3.reason).toContain('mancha');
  });

  it('is case and diacritic insensitive', () => {
    const result = scanForClinicalContent('A febrê está alta');
    expect(result.isClinical).toBe(true);
    expect(result.reason).toContain('febre');
  });

  it('does not trigger on substrings of unrelated words', () => {
    const result1 = scanForClinicalContent('Adoraria marcar para segunda-feira');
    expect(result1.isClinical).toBe(false);

    const result2 = scanForClinicalContent('Temos vagas no período da tarde');
    expect(result2.isClinical).toBe(false);
  });
});
