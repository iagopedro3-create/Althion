import { ALTHION_SCORE_V1_PROVISIONAL } from './formula';
import type {
  AlthionScoreResult,
  ScoreComponentResult,
  ScoreFormula,
  ScoreMetricInput,
  ScoreReasonCode,
} from './types';

const round = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

function reasonFor(input: ScoreMetricInput | undefined): ScoreReasonCode | null {
  if (!input) return 'MISSING_METRIC';
  if (input.denominator === 0) return 'ZERO_DENOMINATOR';
  if (input.numerator > input.denominator) return 'NUMERATOR_EXCEEDS_DENOMINATOR';
  return null;
}

export function calculateAlthionScore(
  inputs: readonly ScoreMetricInput[],
  formula: ScoreFormula = ALTHION_SCORE_V1_PROVISIONAL,
): AlthionScoreResult {
  const inputByCode = new Map(inputs.map((input) => [input.code, input]));

  const components: ScoreComponentResult[] = formula.components.map((definition) => {
    const input = inputByCode.get(definition.code);
    const reasonCode = reasonFor(input);
    const score = input && !reasonCode ? round((input.numerator / input.denominator) * 100) : null;
    const contribution = score === null ? null : round((score * definition.weight) / 100);

    return {
      contribution,
      dimension: definition.dimension,
      evidence: {
        code: definition.code,
        denominator: input?.denominator ?? null,
        dimension: definition.dimension,
        normalizedValue: score,
        numerator: input?.numerator ?? null,
        quality: input?.quality ?? null,
        reasonCode,
        source: input?.source ?? null,
      },
      score,
      status: score === null ? 'insufficient_data' : 'calculated',
      weight: definition.weight,
    };
  });

  const coveredWeight = components.reduce(
    (sum, component) => sum + (component.status === 'calculated' ? component.weight : 0),
    0,
  );
  const coverage = round(coveredWeight);
  const coveredDimensions = new Set(
    components
      .filter((component) => component.status === 'calculated')
      .map((component) => component.dimension),
  );
  const missingDimensions = formula.components
    .map((component) => component.dimension)
    .filter((dimension) => !coveredDimensions.has(dimension));
  const hasMandatoryDimensions = [...formula.mandatoryDimensions].every((dimension) =>
    coveredDimensions.has(dimension),
  );
  const isSufficient = coverage >= formula.minimumCoverage && hasMandatoryDimensions;
  const score = isSufficient
    ? round(
        components.reduce((sum, component) => sum + (component.contribution ?? 0), 0),
        0,
      )
    : null;

  return {
    components,
    coverage,
    formulaStatus: formula.status,
    formulaVersion: formula.version,
    missingDimensions,
    score,
    status: isSufficient ? 'calculated' : 'insufficient_data',
  };
}
