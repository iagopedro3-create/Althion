import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { signOut } from '@/app/auth/actions';
import { PortalNav } from '@/components/portal/portal-nav';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/entrar');

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <a className="brand" href="/app">
          <span className="brand-mark">A</span>
          <span>Althion</span>
        </a>
        <nav aria-label="Navegação principal" className="portal-nav">
          <a href="/app">Clínicas</a>
          <span aria-label="Portal do Cliente versão um">Portal · v1</span>
        </nav>
        <form action={signOut}>
          <button className="quiet-button" type="submit">
            Sair
          </button>
        </form>
      </header>
      <Suspense fallback={<div className="portal-nav-skeleton" aria-hidden="true" />}>
        <PortalNav />
      </Suspense>
      {children}
    </div>
  );
}
