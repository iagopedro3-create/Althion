import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateSession } from './proxy';

const getUser = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

vi.mock('./config', () => ({
  getSupabasePublicConfig: () => ({
    url: 'http://127.0.0.1:54321',
    publishableKey: 'publishable-not-a-secret',
  }),
}));

function requestFor(pathname: string): NextRequest {
  return new NextRequest(`http://localhost:3000${pathname}`);
}

/**
 * Destino do redirecionamento sem o host: o `NextRequest` normaliza a
 * autoridade, e o que este incremento decide é caminho e query.
 */
function redirectTarget(response: Response): string | null {
  const location = response.headers.get('location');
  if (location === null) return null;

  const url = new URL(location);
  return `${url.pathname}${url.search}`;
}

function withoutSession(): void {
  getUser.mockResolvedValue({ data: { user: null } });
}

function withSession(): void {
  getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
}

describe('updateSession', () => {
  beforeEach(() => {
    getUser.mockReset();
  });

  it('sends an anonymous visitor of the Cockpit to sign in, keeping the return path', async () => {
    withoutSession();

    const response = await updateSession(requestFor('/cockpit/recovery'));

    expect(response.status).toBe(307);
    expect(redirectTarget(response)).toBe('/entrar?retorno=%2Fcockpit%2Frecovery');
  });

  it('keeps sending an anonymous visitor of the Portal to sign in, as before', async () => {
    withoutSession();

    const response = await updateSession(requestFor('/app/radar/novo'));

    expect(response.status).toBe(307);
    expect(redirectTarget(response)).toBe('/entrar?retorno=%2Fapp%2Fradar%2Fnovo');
  });

  it('leaves public pages reachable without a session', async () => {
    withoutSession();

    for (const pathname of ['/', '/produto', '/definir-senha']) {
      const response = await updateSession(requestFor(pathname));

      expect(redirectTarget(response)).toBeNull();
    }
  });

  it('does not redirect a signed-in specialist away from the Cockpit', async () => {
    withSession();

    const response = await updateSession(requestFor('/cockpit'));

    expect(redirectTarget(response)).toBeNull();
  });

  it('sends a signed-in user off the sign-in page', async () => {
    withSession();

    const response = await updateSession(requestFor('/entrar'));

    expect(response.status).toBe(307);
    expect(redirectTarget(response)).toBe('/app');
  });
});
