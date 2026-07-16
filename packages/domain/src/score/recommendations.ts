import type { AlthionScoreResult, RecommendationPriority, ScoreRecommendation } from './types';

const TITLES = {
  speed: 'Reduzir perdas na primeira resposta',
  conversion: 'Revisar a conversão em agendamento',
  continuity: 'Garantir continuidade dos acompanhamentos',
  occupancy: 'Analisar a capacidade agendável disponível',
  attendance: 'Reforçar confirmação e comparecimento',
  recovery: 'Estruturar o trabalho das oportunidades de recuperação',
  retention: 'Revisar a continuidade administrativa dos retornos',
  data_intelligence: 'Melhorar a qualidade dos dados administrativos',
} as const;

function priorityFromLostContribution(weight: number, score: number): RecommendationPriority {
  const lostContribution = (weight * (100 - score)) / 100;
  if (lostContribution >= 10) return 'high';
  if (lostContribution >= 5) return 'medium';
  return 'low';
}

export function buildScoreRecommendations(result: AlthionScoreResult): ScoreRecommendation[] {
  const recommendations: ScoreRecommendation[] = [];

  for (const component of result.components) {
    if (component.score === null) {
      recommendations.push({
        code: `collect-${component.dimension}`,
        dimension: component.dimension,
        evidenceCode: component.evidence.code,
        priority: component.weight >= 15 ? 'high' : 'medium',
        rationale:
          'A dimensão não possui numerador e denominador consistentes para o período analisado.',
        ruleVersion: '1.0.0-provisional',
        title: `Completar dados de ${TITLES[component.dimension].toLocaleLowerCase('pt-BR')}`,
      });
      continue;
    }

    if (component.score < 100) {
      recommendations.push({
        code: `investigate-${component.dimension}`,
        dimension: component.dimension,
        evidenceCode: component.evidence.code,
        priority: priorityFromLostContribution(component.weight, component.score),
        rationale: `${component.evidence.numerator} de ${component.evidence.denominator} eventos elegíveis atenderam ao critério administrativo informado.`,
        ruleVersion: '1.0.0-provisional',
        title: TITLES[component.dimension],
      });
    }
  }

  return recommendations.sort((left, right) => {
    const rank: Record<RecommendationPriority, number> = { high: 0, medium: 1, low: 2 };
    return rank[left.priority] - rank[right.priority] || left.code.localeCompare(right.code);
  });
}
