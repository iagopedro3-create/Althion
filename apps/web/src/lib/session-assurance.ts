import type { AssuranceLevel } from '@althion/contracts';

/**
 * Descrição, em leitura, do nível de garantia da sessão atual.
 *
 * O backend (incremento 10.1) passou a devolver `assuranceLevel` em `/api/v1/me`;
 * esta view apenas o traduz para exibição. Não há inscrição no segundo fator nem
 * enforcement de rota nesta fase — ambos dependem de Supabase de staging e da lista
 * de rotas sensíveis (item 3.5 do go-live checklist). A superfície é informativa.
 */
export interface SessionAssuranceView {
  readonly level: AssuranceLevel;
  readonly label: string;
  readonly badge: 'success' | 'muted';
  readonly summary: string;
  /** `true` quando a sessão já concluiu o segundo fator (AAL2). */
  readonly hasSecondFactor: boolean;
}

export function describeSessionAssurance(level: AssuranceLevel): SessionAssuranceView {
  if (level === 'aal2') {
    return {
      level: 'aal2',
      label: 'Segundo fator ativo',
      badge: 'success',
      hasSecondFactor: true,
      summary: 'Esta sessão foi verificada com senha e um segundo fator (AAL2).',
    };
  }
  return {
    level: 'aal1',
    label: 'Apenas senha',
    badge: 'muted',
    hasSecondFactor: false,
    summary:
      'Esta sessão usa apenas senha (AAL1). A inscrição no segundo fator ainda não está disponível nesta fase.',
  };
}
