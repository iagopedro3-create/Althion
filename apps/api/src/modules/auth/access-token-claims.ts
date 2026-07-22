import { assuranceLevelSchema, type AssuranceLevel } from '@althion/contracts';
import type { JWTPayload } from 'jose';
import { z } from 'zod';

export type { AssuranceLevel };

export interface VerifiedAccessToken {
  subject: string;
  assuranceLevel: AssuranceLevel;
  /** Métodos de autenticação usados na sessão (claim `amr`), para auditoria. */
  methods: string[];
}

const subjectSchema = z.uuid();
const methodsSchema = z.array(z.object({ method: z.string().min(1) }));

/**
 * Extrai os claims que a plataforma usa de um payload já verificado
 * criptograficamente. Lança quando o `sub` não é um UUID; qualquer outro claim
 * malformado degrada para o valor mais restritivo em vez de invalidar a sessão
 * — negar o acesso é decisão dos guards, não do parsing.
 */
export function parseAccessTokenClaims(payload: JWTPayload): VerifiedAccessToken {
  return {
    assuranceLevel: parseAssuranceLevel(payload.aal),
    methods: parseMethods(payload.amr),
    subject: subjectSchema.parse(payload.sub),
  };
}

/** Ausência ou valor desconhecido vale `aal1`: nunca conceder AAL2 por omissão. */
function parseAssuranceLevel(value: unknown): AssuranceLevel {
  const parsed = assuranceLevelSchema.safeParse(value);

  return parsed.success ? parsed.data : 'aal1';
}

function parseMethods(value: unknown): string[] {
  const parsed = methodsSchema.safeParse(value);

  return parsed.success ? parsed.data.map((entry) => entry.method) : [];
}
