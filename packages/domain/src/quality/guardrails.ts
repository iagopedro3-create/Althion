export const CLINICAL_KEYWORDS = [
  'dor',
  'dói',
  'sintoma',
  'diagnóstico',
  'diagnostico',
  'prescrição',
  'prescricao',
  'receita',
  'remédio',
  'remedio',
  'tratamento',
  'exame',
  'doença',
  'doenca',
  'febre',
  'mancha',
  'coceira',
  'infecção',
  'infeccao',
  'inflamação',
  'inflamacao',
  'alergia',
  'medicamento',
  'sangramento',
  'ferida',
  'lesão',
  'lesao',
];

/**
 * Scans a text content for potential clinical indicators.
 * Matches complete words case-insensitively or specific substrings to avoid false positives.
 */
export function scanForClinicalContent(text: string): {
  readonly isClinical: boolean;
  readonly reason?: string;
} {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // strip diacritics

  for (const keyword of CLINICAL_KEYWORDS) {
    const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Match word boundaries to prevent matching inside words like "adorar" matching "dor"
    // Since JS regex word boundaries \b don't handle accented characters perfectly, normalization helps.
    const regex = new RegExp(`\\b${normalizedKeyword}\\b`, 'i');
    if (regex.test(normalized)) {
      return {
        isClinical: true,
        reason: `Conteúdo potencialmente clínico detectado por palavra-chave: "${keyword}"`,
      };
    }
  }

  return { isClinical: false };
}
