import type { QualityCriterion, QualityRubric } from './types';

export const QUALITY_RUBRICS_VERSION = '1.0.0-provisional';

export const DEFAULT_QUALITY_CRITERIA: readonly QualityCriterion[] = [
  {
    id: 'response_time',
    maxScore: 5,
    name: 'Tempo de resposta',
    description: 'Agilidade no atendimento à solicitação inicial do lead/paciente.',
  },
  {
    id: 'tone_empathy',
    maxScore: 5,
    name: 'Tom e empatia',
    description: 'Cortesia, profissionalismo e respeito à linguagem da marca.',
  },
  {
    id: 'opportunity_id',
    maxScore: 5,
    name: 'Identificação de oportunidade',
    description: 'Habilidade em mapear a necessidade do lead (ex. agendamento, retorno).',
  },
  {
    id: 'compliance',
    maxScore: 5,
    name: 'Conformidade de roteiro',
    description: 'Uso de termos administrativos corretos e respeito a limites regulatórios.',
  },
  {
    id: 'operational_sanity',
    maxScore: 5,
    name: 'Sanidade operacional',
    description: 'Ausência de promessas sem lastro ou desvios do escopo operacional.',
  },
];

export const DEFAULT_QUALITY_RUBRIC: Omit<QualityRubric, 'createdBy' | 'createdAt'> = {
  version: QUALITY_RUBRICS_VERSION,
  title: 'Rubrica Padrão de Avaliação Administrativa',
  description: 'Rubrica para avaliação assistida de conversas operacionais de agendamento.',
  criteria: DEFAULT_QUALITY_CRITERIA,
  isActive: true,
};

export function calculateTotalScore(
  scores: Readonly<Record<string, number>>,
  criteria: readonly QualityCriterion[] = DEFAULT_QUALITY_CRITERIA,
): number {
  if (criteria.length === 0) {
    return 0;
  }

  let totalPointsEarned = 0;
  let maxPossiblePoints = 0;

  for (const criterion of criteria) {
    const score = scores[criterion.id];
    if (score === undefined) {
      throw new Error(`Score for criterion ${criterion.id} is missing`);
    }

    if (score < 0 || score > criterion.maxScore) {
      throw new Error(
        `Score for criterion ${criterion.id} must be between 0 and ${criterion.maxScore}, got ${score}`,
      );
    }

    totalPointsEarned += score;
    maxPossiblePoints += criterion.maxScore;
  }

  if (maxPossiblePoints === 0) {
    return 0;
  }

  // Rounded to two decimal places
  const percentage = (totalPointsEarned / maxPossiblePoints) * 100;
  return Math.round((percentage + Number.EPSILON) * 100) / 100;
}
