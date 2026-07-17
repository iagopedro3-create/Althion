import { redirect } from 'next/navigation';

import { signOut } from '@/app/auth/actions';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function CockpitLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/entrar');

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <a className="brand" href="/cockpit">
          <span className="brand-mark">A</span>
          <span>Althion</span>
        </a>
        <nav aria-label="Navegação principal" className="portal-nav">
          <a href="/cockpit">Carteira</a>
          <a href="/app">Portal do Cliente</a>
          <span aria-label="Cockpit do Especialista versão um">Cockpit · v1</span>
        </nav>
        <form action={signOut}>
          <button className="quiet-button" type="submit">
            Sair
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
