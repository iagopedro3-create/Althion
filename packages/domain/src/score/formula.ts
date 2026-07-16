import type { ScoreFormula, ScoreMetricDefinition } from './types';

export const ALTHION_SCORE_V1_COMPONENTS = [
  {
    code: 'first_response_within_sla',
    dimension: 'speed',
    label: 'Primeiras respostas dentro do SLA',
    weight: 15,
  },
  {
    code: 'lead_to_appointment',
    dimension: 'conversion',
    label: 'Leads elegíveis convertidos em agendamento',
    weight: 20,
  },
  {
    code: 'follow_up_within_policy',
    dimension: 'continuity',
    label: 'Acompanhamentos dentro da política',
    weight: 15,
  },
  {
    code: 'bookable_slot_occupancy',
    dimension: 'occupancy',
    label: 'Ocupação dos horários agendáveis',
    weight: 15,
  },
  {
    code: 'appointment_attendance',
    dimension: 'attendance',
    label: 'Comparecimentos esperados realizados',
    weight: 15,
  },
  {
    code: 'worked_opportunity_recovery',
    dimension: 'recovery',
    label: 'Oportunidades trabalhadas recuperadas',
    weight: 10,
  },
  {
    code: 'administrative_return',
    dimension: 'retention',
    label: 'Retornos administrativos elegíveis realizados',
    weight: 5,
  },
  {
    code: 'required_data_quality',
    dimension: 'data_intelligence',
    label: 'Dados administrativos requeridos disponíveis',
    weight: 5,
  },
] as const satisfies readonly ScoreMetricDefinition[];

export const ALTHION_SCORE_V1_PROVISIONAL: ScoreFormula = {
  components: ALTHION_SCORE_V1_COMPONENTS,
  mandatoryDimensions: new Set(['speed', 'conversion', 'continuity', 'occupancy', 'attendance']),
  minimumCoverage: 75,
  status: 'draft',
  version: '1.0.0-provisional',
};

const totalWeight = ALTHION_SCORE_V1_COMPONENTS.reduce(
  (sum, component) => sum + component.weight,
  0,
);

if (totalWeight !== 100) {
  throw new Error(`A fórmula do Althion Score deve somar 100; total atual: ${totalWeight}.`);
}
