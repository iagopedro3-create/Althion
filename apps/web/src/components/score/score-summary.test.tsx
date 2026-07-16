// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ScoreDetailView } from '@/lib/api/radar';

import { ScoreSummary } from './score-summary';

const detail: ScoreDetailView = {
  assessment: {
    clinic_id: '20000000-0000-4000-8000-000000000001',
    created_at: '2026-07-16T12:00:00Z',
    id: '70000000-0000-4000-8000-000000000001',
    organization_id: '10000000-0000-4000-8000-000000000001',
    period_end: '2026-06-30',
    period_start: '2026-06-01',
    questionnaire_version: '1.0.0',
    status: 'submitted',
    submitted_at: '2026-07-16T12:00:00Z',
    unit_id: null,
  },
  components: [
    {
      contribution: null,
      dimension: 'conversion',
      id: '71000000-0000-4000-8000-000000000001',
      metric_code: 'lead_to_appointment',
      score_value: null,
      status: 'insufficient_data',
      weight: 20,
    },
  ],
  evidence: [],
  formula: { minimum_coverage: 75, status: 'draft', version: '1.0.0-provisional' },
  recommendations: [
    {
      dimension: 'conversion',
      evidence_metric_code: 'lead_to_appointment',
      id: '72000000-0000-4000-8000-000000000001',
      priority: 'high',
      rationale: 'Falta o denominador elegível para o período.',
      rule_code: 'collect-conversion',
      rule_version: '1.0.0-provisional',
      title: 'Completar dados de conversão',
    },
  ],
  score: {
    assessment_id: '70000000-0000-4000-8000-000000000001',
    calculated_at: '2026-07-16T12:00:00Z',
    clinic_id: '20000000-0000-4000-8000-000000000001',
    coverage: 55,
    formula_id: '61000000-0000-4000-8000-000000000001',
    id: '73000000-0000-4000-8000-000000000001',
    organization_id: '10000000-0000-4000-8000-000000000001',
    score_value: null,
    status: 'insufficient_data',
  },
};

describe('ScoreSummary', () => {
  it('explains insufficient data without rendering a fake zero score', () => {
    render(<ScoreSummary detail={detail} />);

    expect(screen.getByRole('heading', { name: 'Dados insuficientes' })).toBeInTheDocument();
    expect(screen.getByText('A nota global não foi publicada')).toBeInTheDocument();
    expect(screen.getByText('Completar dados de conversão')).toBeInTheDocument();
    expect(screen.queryByText('0/100')).not.toBeInTheDocument();
  });
});
