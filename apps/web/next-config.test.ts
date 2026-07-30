import { describe, expect, it } from 'vitest';

import { contentSecurityPolicy } from './next.config';

describe('contentSecurityPolicy', () => {
  it('keeps production strict while allowing the configured Supabase origin', () => {
    const policy = contentSecurityPolicy(true, 'https://project-ref.supabase.co/auth/v1/callback');

    expect(policy).toContain("connect-src 'self' https://project-ref.supabase.co");
    expect(policy).toContain("script-src 'self' 'unsafe-inline'");
    expect(policy).toContain('upgrade-insecure-requests');
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).not.toContain('ws:');
  });

  it('allows only the development transports required by Next.js HMR', () => {
    const policy = contentSecurityPolicy(false, 'http://127.0.0.1:54321');

    expect(policy).toContain("connect-src 'self' http://127.0.0.1:54321 ws:");
    expect(policy).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    expect(policy).not.toContain('upgrade-insecure-requests');
  });

  it('fails closed when the Supabase URL is absent or invalid', () => {
    expect(contentSecurityPolicy(true, undefined)).toContain("connect-src 'self'");
    expect(contentSecurityPolicy(true, 'not a URL')).toContain("connect-src 'self'");
    expect(contentSecurityPolicy(true, 'not a URL')).not.toContain('not a URL');
    expect(contentSecurityPolicy(true, 'javascript:alert(1)')).not.toContain('javascript:');
    expect(contentSecurityPolicy(true, 'ftp://project-ref.supabase.co')).not.toContain('ftp:');
  });
});
