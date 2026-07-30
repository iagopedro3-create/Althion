import type { NextConfig } from 'next';
import path from 'node:path';

/**
 * Origem do Supabase, para `connect-src` — o cliente do browser fala com o
 * Auth direto. A API da Althion é chamada do servidor e não entra aqui.
 * Sem a env var, a diretiva fica só com `'self'`: falha fechada.
 */
function supabaseOrigin(url: string | undefined): string | undefined {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
    return parsed.origin;
  } catch {
    return undefined;
  }
}

/**
 * CSP estática, sem nonce: a alternativa com nonce exige gerá-lo por
 * requisição no proxy, o que forçaria renderização dinâmica em todas as rotas
 * e derrubaria o prerender estático da landing.
 *
 * Consequência assumida: `script-src` precisa de `'unsafe-inline'` por causa
 * dos scripts inline do App Router, então esta CSP **não** é uma defesa forte
 * contra XSS. O que ela entrega é contenção de exfiltração (`connect-src`),
 * sequestro de formulário (`form-action`), reescrita de URL relativa
 * (`base-uri`), plugins (`object-src`) e enquadramento (`frame-ancestors`).
 * Ver docs/plans/phase-10-2-csp.md.
 */
export function contentSecurityPolicy(
  isProduction: boolean,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
): string {
  const connect = ["'self'", supabaseOrigin(supabaseUrl), isProduction ? undefined : 'ws:'].filter(
    Boolean,
  );
  const script = ["'self'", "'unsafe-inline'", isProduction ? undefined : "'unsafe-eval'"].filter(
    Boolean,
  );

  const directives: Array<string | undefined> = [
    "default-src 'self'",
    "base-uri 'self'",
    `connect-src ${connect.join(' ')}`,
    "font-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    `script-src ${script.join(' ')}`,
    // O Next injeta estilos inline (critical CSS e styled-jsx do runtime).
    "style-src 'self' 'unsafe-inline'",
    isProduction ? 'upgrade-insecure-requests' : undefined,
  ];

  return directives.filter(Boolean).join('; ');
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';

    const securityHeaders = [
      { key: 'Content-Security-Policy', value: contentSecurityPolicy(isProduction) },
      { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Redundante com `frame-ancestors`, mantido para navegadores antigos.
      { key: 'X-Frame-Options', value: 'DENY' },
    ];

    if (isProduction) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      });
    }

    return [{ headers: securityHeaders, source: '/:path*' }];
  },
  poweredByHeader: false,
  turbopack: {
    root: path.resolve(process.cwd(), '../..'),
  },
  transpilePackages: ['@althion/contracts'],
};

export default nextConfig;
