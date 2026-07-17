import {
  ATTENDED_NO_BOOKING_MAX_DAYS,
  ATTENDED_NO_BOOKING_MIN_HOURS,
  LEAD_NO_RESPONSE_MAX_DAYS,
  LEAD_NO_RESPONSE_MIN_HOURS,
  RECOVERY_DAY_MS,
  RECOVERY_HOUR_MS,
  RECOVERY_POLICY_VERSION,
} from './policy';
import type { RecoveryLeadSnapshot, RecoveryOpportunityCandidate } from './types';

// Avaliação pura e determinística: mesma entrada e mesmo "now" produzem as mesmas oportunidades.
export function evaluateRecoveryRules(
  leads: readonly RecoveryLeadSnapshot[],
  now: Date,
): readonly RecoveryOpportunityCandidate[] {
  const candidates: RecoveryOpportunityCandidate[] = [];

  for (const lead of leads) {
    const receivedMs = new Date(lead.receivedAt).getTime();
    const ageMs = now.getTime() - receivedMs;

    if (
      lead.status === 'new' &&
      lead.firstResponseAt === null &&
      ageMs > LEAD_NO_RESPONSE_MIN_HOURS * RECOVERY_HOUR_MS &&
      ageMs <= LEAD_NO_RESPONSE_MAX_DAYS * RECOVERY_DAY_MS
    ) {
      candidates.push({
        actionType: 'contact_lead',
        evidence: {
          first_response_at: null,
          lead_status: lead.status,
          received_at: lead.receivedAt,
          window: `> ${LEAD_NO_RESPONSE_MIN_HOURS}h e <= ${LEAD_NO_RESPONSE_MAX_DAYS}d sem resposta`,
        },
        externalLeadRef: lead.externalId,
        leadLabel: lead.label,
        ruleCode: 'lead_no_response',
        ruleVersion: RECOVERY_POLICY_VERSION,
      });
    }

    if (lead.status === 'in_progress' && lead.firstResponseAt !== null && !lead.hasWonOpportunity) {
      const respondedMs = new Date(lead.firstResponseAt).getTime();
      const sinceResponseMs = now.getTime() - respondedMs;
      if (
        sinceResponseMs > ATTENDED_NO_BOOKING_MIN_HOURS * RECOVERY_HOUR_MS &&
        sinceResponseMs <= ATTENDED_NO_BOOKING_MAX_DAYS * RECOVERY_DAY_MS
      ) {
        candidates.push({
          actionType: 'offer_booking',
          evidence: {
            first_response_at: lead.firstResponseAt,
            has_won_opportunity: 'false',
            lead_status: lead.status,
            window: `> ${ATTENDED_NO_BOOKING_MIN_HOURS}h e <= ${ATTENDED_NO_BOOKING_MAX_DAYS}d sem agendamento`,
          },
          externalLeadRef: lead.externalId,
          leadLabel: lead.label,
          ruleCode: 'attended_no_booking',
          ruleVersion: RECOVERY_POLICY_VERSION,
        });
      }
    }
  }

  return candidates.sort(
    (left, right) =>
      left.externalLeadRef.localeCompare(right.externalLeadRef) ||
      left.ruleCode.localeCompare(right.ruleCode),
  );
}
