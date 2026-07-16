import { describe, expect, it } from 'vitest';

import { calculateAlthionScore } from './calculate-score';
import { ALTHION_SCORE_V1_COMPONENTS } from './formula';
import { buildScoreRecommendations } from './recommendations';
import type { ScoreMetricInput } from './types';

const completeInputs = ALTHION_SCORE_V1_COMPONENTS.map((component): ScoreMetricInput => ({
  code: component.code,
  denominator: 100,
  numerator: 80,
  quality: 'declared',
  source: 'manual',
}));

describe('Althion Score v1 provisional', () => {
  it('calcula uma nota reproduzível com pesos que somam 100', () => {
    const result = calculateAlthionScore(completeInputs);

    expect(result).toMatchObject({ coverage: 100, score: 80, status: 'calculated' });
    expect(result.components.reduce((sum, component) => sum + component.weight, 0)).toBe(100);
  });

  it('não publica nota global sem uma dimensão obrigatória', () => {
    const result = calculateAlthionScore(
      completeInputs.filter((input) => input.code !== 'lead_to_appointment'),
    );

    expect(result.coverage).toBe(80);
    expect(result.score).toBeNull();
    expect(result.status).toBe('insufficient_data');
    expect(result.missingDimensions).toContain('conversion');
  });

  it('não transforma denominador zero em nota zero', () => {
    const result = calculateAlthionScore([
      ...completeInputs.filter((input) => input.code !== 'appointment_attendance'),
      {
        code: 'appointment_attendance',
        denominator: 0,
        numerator: 0,
        quality: 'declared',
        source: 'manual',
      },
    ]);
    const attendance = result.components.find((component) => component.dimension === 'attendance');

    expect(attendance?.score).toBeNull();
    expect(attendance?.evidence.reasonCode).toBe('ZERO_DENOMINATOR');
    expect(result.score).toBeNull();
  });

  it('gera recomendações determinísticas priorizadas pela contribuição perdida', () => {
    const result = calculateAlthionScore(
      completeInputs.map((input) =>
        input.code === 'lead_to_appointment' ? { ...input, numerator: 20 } : input,
      ),
    );

    const first = buildScoreRecommendations(result)[0];
    expect(first).toMatchObject({
      dimension: 'conversion',
      evidenceCode: 'lead_to_appointment',
      priority: 'high',
      ruleVersion: '1.0.0-provisional',
    });
  });
});
