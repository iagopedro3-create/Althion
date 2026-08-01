import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

import { isAuthEntryPoint, requiresSession } from '../protected-areas';
import { getSupabasePublicConfig } from './config';

export async function updateSession(request: NextRequest) {
  const config = getSupabasePublicConfig();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, options, value }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isProtected = requiresSession(request.nextUrl.pathname);
  const isAuthPage = isAuthEntryPoint(request.nextUrl.pathname);

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/entrar';
    url.searchParams.set('retorno', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return response;
}
