import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch {
    if (request.nextUrl.pathname.startsWith('/app')) {
      const url = request.nextUrl.clone();
      url.pathname = '/entrar';
      url.searchParams.set('erro', 'configuracao');
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
