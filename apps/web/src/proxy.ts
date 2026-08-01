import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { requiresSession } from '@/lib/protected-areas';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch {
    // Sem configuração do Supabase não há sessão possível: as áreas
    // autenticadas recebem a página de erro, e não o 500 que a própria página
    // produziria ao criar o client que acabou de falhar.
    if (requiresSession(request.nextUrl.pathname)) {
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
