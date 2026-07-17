import {
  FREQUENCY_MAX_PER_30_DAYS,
  FREQUENCY_MAX_PER_7_DAYS,
  RECOVERY_DAY_MS,
  RECOVERY_POLICY_VERSION,
} from './policy';
import { evaluateRecoveryRules } from './rules';
import type {
  RecoveryExclusion,
  RecoveryGovernanceContext,
  RecoveryLeadSnapshot,
  RecoveryOpportunityCandidate,
  RecoverySimulationResult,
} from './types';

interface GovernanceOutcome {
  readonly eligible: readonly RecoveryOpportunityCandidate[];
  readonly exclusions: readonly RecoveryExclusion[];
}

// Consentimento é deny-by-default: sem registro interno 'granted', nenhum lead é elegível.
export function applyRecoveryGovernance(
  candidates: readonly RecoveryOpportunityCandidate[],
  context: RecoveryGovernanceContext,
  now: Date,
): GovernanceOutcome {
  const eligible: RecoveryOpportunityCandidate[] = [];
  const exclusions: RecoveryExclusion[] = [];

  for (const candidate of candidates) {
    const ref = candidate.externalLeadRef;

    if ((context.consents[ref] ?? 'unknown') !== 'granted') {
      exclusions.push({
        externalLeadRef: ref,
        reason: 'excluded_no_consent',
        ruleCode: candidate.ruleCode,
      });
      continue;
    }
    if (context.activeSuppressions.has(ref)) {
      exclusions.push({
        externalLeadRef: ref,
        reason: 'excluded_suppressed',
        ruleCode: candidate.ruleCode,
      });
      continue;
    }
    if (violatesFrequency(context.approvedActionAt[ref] ?? [], now)) {
      exclusions.push({
        externalLeadRef: ref,
        reason: 'excluded_frequency',
        ruleCode: candidate.ruleCode,
      });
      continue;
    }
    eligible.push(candidate);
  }

  return { eligible, exclusions };
}

export function simulateRecovery(
  leads: readonly RecoveryLeadSnapshot[],
  context: RecoveryGovernanceContext,
  now: Date,
): RecoverySimulationResult {
  const outcome = applyRecoveryGovernance(evaluateRecoveryRules(leads, now), context, now);
  return {
    candidates: outcome.eligible,
    exclusions: outcome.exclusions,
    leadsEvaluated: leads.length,
    policyVersion: RECOVERY_POLICY_VERSION,
  };
}

function violatesFrequency(approvedAt: readonly string[], now: Date): boolean {
  const last7 = approvedAt.filter(
    (value) => now.getTime() - new Date(value).getTime() <= 7 * RECOVERY_DAY_MS,
  ).length;
  const last30 = approvedAt.filter(
    (value) => now.getTime() - new Date(value).getTime() <= 30 * RECOVERY_DAY_MS,
  ).length;
  return last7 >= FREQUENCY_MAX_PER_7_DAYS || last30 >= FREQUENCY_MAX_PER_30_DAYS;
}
