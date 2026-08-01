/**
 * Áreas do web que exigem sessão, em lista única.
 *
 * O proxy decidia isso com um literal (`startsWith('/app')`), então o Cockpit
 * — a segunda área autenticada, criada na Fase 4 — nunca entrou na barreira.
 * Uma lista declarada faz a próxima área custar uma linha aqui, em vez de uma
 * edição no meio da lógica de sessão que ninguém lembra de fazer.
 *
 * Isto é a camada externa: os layouts de cada área continuam validando a sessão
 * com `getUser()`, e a API revalida o JWT por JWKS. Ver
 * docs/plans/phase-10-6-protected-areas.md.
 */
export const AUTHENTICATED_AREAS = ['/app', '/cockpit'] as const;

/** Páginas de entrada que uma sessão válida não deve mais ver. */
export const AUTH_ENTRY_POINTS = ['/entrar', '/recuperar-acesso'] as const;

/**
 * Casa a área e o que está sob ela, nunca um caminho que só começa com as
 * mesmas letras: `/app` protege `/app` e `/app/radar`, mas não `/application`.
 */
function isWithinArea(pathname: string, area: string): boolean {
  return pathname === area || pathname.startsWith(`${area}/`);
}

export function requiresSession(pathname: string): boolean {
  return AUTHENTICATED_AREAS.some((area) => isWithinArea(pathname, area));
}

export function isAuthEntryPoint(pathname: string): boolean {
  return AUTH_ENTRY_POINTS.some((entry) => entry === pathname);
}
