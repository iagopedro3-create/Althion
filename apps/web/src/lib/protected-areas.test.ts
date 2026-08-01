import { describe, expect, it } from 'vitest';

import { AUTHENTICATED_AREAS, isAuthEntryPoint, requiresSession } from './protected-areas';

describe('requiresSession', () => {
  it('protects the Portal, which the proxy already covered', () => {
    expect(requiresSession('/app')).toBe(true);
    expect(requiresSession('/app/radar/novo')).toBe(true);
  });

  it('protects the Cockpit, which the proxy did not cover before this increment', () => {
    expect(requiresSession('/cockpit')).toBe(true);
    expect(requiresSession('/cockpit/recovery')).toBe(true);
    expect(requiresSession('/cockpit/conta')).toBe(true);
  });

  it('leaves the public site and the authentication pages open', () => {
    for (const pathname of ['/', '/produto', '/entrar', '/recuperar-acesso', '/definir-senha']) {
      expect(requiresSession(pathname)).toBe(false);
    }
  });

  it('keeps the OAuth callback open, since it runs before a session exists', () => {
    expect(requiresSession('/auth/callback')).toBe(false);
  });

  it('matches whole segments, so a path that merely starts with the area stays public', () => {
    expect(requiresSession('/application')).toBe(false);
    expect(requiresSession('/cockpit-demo')).toBe(false);
  });

  it('does not protect a bare prefix of an area', () => {
    expect(requiresSession('/coc')).toBe(false);
    expect(requiresSession('/')).toBe(false);
  });

  it('lists exactly the two authenticated areas the web has today', () => {
    expect(AUTHENTICATED_AREAS).toEqual(['/app', '/cockpit']);
  });
});

describe('isAuthEntryPoint', () => {
  it('recognises the pages a signed-in user should not see again', () => {
    expect(isAuthEntryPoint('/entrar')).toBe(true);
    expect(isAuthEntryPoint('/recuperar-acesso')).toBe(true);
  });

  it('does not treat setting a password as an entry point, since it needs the recovery session', () => {
    expect(isAuthEntryPoint('/definir-senha')).toBe(false);
  });

  it('matches the exact path only, so nothing below it is swept in', () => {
    expect(isAuthEntryPoint('/entrar/confirmar')).toBe(false);
    expect(isAuthEntryPoint('/entrar-agora')).toBe(false);
  });
});
