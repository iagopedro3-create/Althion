'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SiteHeader } from '@/components/site/SiteHeader';

export function SiteChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  if (pathname === '/') {
    return children;
  }

  return (
    <div className="site-shell">
      <SiteHeader />
      {children}
      <div className="dark-section" style={{ width: '100%', borderTop: '1px solid var(--line)' }}>
        <footer className="site-footer" style={{ borderTop: 'none', marginTop: 0 }}>
          <div>
            <p className="brand">
              <span className="brand-mark" style={{ background: '#18A987', color: '#061713' }}>
                A
              </span>
              <span>Althion</span>
            </p>
            <p>Recuperação e Performance da Agenda para clínicas.</p>
          </div>
          <nav aria-label="Links institucionais" className="site-footer-links">
            <Link href="/produto">Produto</Link>
            <Link href="/seguranca">Segurança</Link>
            <Link href="/sobre">Sobre</Link>
            <Link href="/contato">Contato</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos</Link>
          </nav>
          <p className="site-footer-note">
            Plataforma administrativa. A Althion não oferece diagnóstico, prescrição, prontuário, ou
            orientação clínica.
          </p>
        </footer>
      </div>
    </div>
  );
}
