import { describe, expect, it } from 'vitest';

import { describeSessionAssurance } from './session-assurance';

describe('describeSessionAssurance', () => {
  it('marks an aal2 session as having a verified second factor', () => {
    const view = describeSessionAssurance('aal2');
    expect(view).toEqual({
      level: 'aal2',
      label: 'Segundo fator ativo',
      badge: 'success',
      hasSecondFactor: true,
      summary: 'Esta sessão foi verificada com senha e um segundo fator (AAL2).',
    });
  });

  it('treats an aal1 session as password-only and does not imply a second factor', () => {
    const view = describeSessionAssurance('aal1');
    expect(view.hasSecondFactor).toBe(false);
    expect(view.badge).toBe('muted');
    expect(view.label).toBe('Apenas senha');
  });
});
