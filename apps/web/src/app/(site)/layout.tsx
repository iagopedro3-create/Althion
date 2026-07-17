import Link from 'next/link';

// Grupo de rotas público, isolado do portal autenticado: nenhuma página aqui exige sessão.
// O deploy é compartilhado com o portal, mas código e roteamento permanecem desacoplados.
const NAV = [
  { href: '/produto', label: 'Produto' },
  { href: '/seguranca', label: 'Segurança' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
] as const;

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="site-shell">
      <div className="dark-section" style={{ width: '100%' }}>
        <header className="public-nav" aria-label="Navegação principal">
          <Link className="brand" href="/">
            <span className="brand-mark" style={{ background: '#18A987', color: '#061713' }}>A</span>
            <span>Althion</span>
          </Link>
          <nav aria-label="Seções do site" className="site-nav">
            {NAV.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <Link className="quiet-button" href="/entrar">
            Acessar plataforma
          </Link>
        </header>
      </div>

      {children}

      <div className="dark-section" style={{ width: '100%', borderTop: '1px solid var(--line)' }}>
        <footer className="site-footer" style={{ borderTop: 'none', marginTop: 0 }}>
          <div>
            <p className="brand">
              <span className="brand-mark" style={{ background: '#18A987', color: '#061713' }}>A</span>
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
            Plataforma administrativa. A Althion não oferece diagnóstico, prescrição, prontuário,
            ou orientação clínica.
          </p>
        </footer>
      </div>
    </div>
  );
}
