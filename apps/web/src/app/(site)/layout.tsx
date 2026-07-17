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
      <header className="public-nav" aria-label="Navegação principal">
        <Link className="brand" href="/">
          {/* Marca provisória: shell neutro até a identidade visual ser aprovada. [MARCA A DEFINIR] */}
          <span className="brand-mark">A</span>
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

      {children}

      <footer className="site-footer">
        <div>
          <p className="brand">
            <span className="brand-mark">A</span>
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
          triagem ou orientação clínica.
        </p>
      </footer>
    </div>
  );
}
