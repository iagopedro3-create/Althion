import { describe, expect, it } from 'vitest';
import {
  createEvaluationSchema,
  createClinicalFlagSchema,
  resolveClinicalFlagSchema,
} from './quality';

describe('quality contracts', () => {
  it('accepts valid evaluation inputs', () => {
    const input = {
      conversationId: 'conv-123',
      rubricVersion: '1.0.0-provisional',
      scores: {
        response_time: 5,
        tone_empathy: 4,
      },
      feedback: 'Muito boa conversa.',
    };

    expect(createEvaluationSchema.safeParse(input).success).toBe(true);
  });

  it('rejects scores out of bounds', () => {
    const input = {
      conversationId: 'conv-123',
      rubricVersion: '1.0.0-provisional',
      scores: {
        response_time: 6, // max 5
        tone_empathy: -1, // min 0
      },
    };

    expect(createEvaluationSchema.safeParse(input).success).toBe(false);
  });

  it('accepts valid clinical flag inputs', () => {
    const input = {
      conversationId: 'conv-123',
      flagReason: 'Paciente solicitou informações sobre dosagem de medicamento.',
    };

    expect(createClinicalFlagSchema.safeParse(input).success).toBe(true);
  });

  it('accepts valid clinical flag resolution', () => {
    const input = {
      handoffNotes: 'Transferido para o Dr. Pedro resolver no canal clínico.',
    };

    expect(resolveClinicalFlagSchema.safeParse(input).success).toBe(true);
  });
});
