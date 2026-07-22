'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const NAV_LINKS = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#radar', label: 'Althion Radar' },
  { href: '#recuperacao', label: 'Recuperação' },
  { href: '#especialista', label: 'Especialista' },
  { href: '#seguranca', label: 'Segurança' },
  { href: '#faq', label: 'FAQ' },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha menu mobile ao pressionar Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Fecha menu mobile ao clicar fora
  useEffect(() => {
    if (!mobileOpen) return;
    const onClick = (e: MouseEvent) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [mobileOpen]);

  return (
    <header
      aria-label="Navegação principal"
      className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}
      role="banner"
    >
      <div className="site-header-inner">
        {/* Marca */}
        <Link aria-label="Ir para a página inicial da Althion" className="brand" href="/">
          <span
            aria-hidden="true"
            className="brand-mark"
            style={{ background: '#18A987', color: '#061713' }}
          >
            A
          </span>
          <span>Althion</span>
        </Link>

        {/* Navegação desktop */}
        <nav aria-label="Seções da página" className="site-header-nav">
          {NAV_LINKS.map((item) => (
            <a className="site-header-nav-link" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Ações desktop */}
        <div className="site-header-actions">
          <Link aria-label="Acessar a plataforma" className="site-header-login" href="/entrar">
            Entrar
          </Link>
          <Link className="site-header-cta" href="/diagnostico" id="header-cta-diagnostico">
            Solicitar diagnóstico
          </Link>
        </div>

        {/* Botão menu mobile */}
        <button
          aria-controls="mobile-nav"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
          className="site-header-burger"
          onClick={() => setMobileOpen((v) => !v)}
          type="button"
        >
          <span className={`burger-line${mobileOpen ? ' burger-line--open' : ''}`} />
          <span
            className={`burger-line burger-line--mid${mobileOpen ? ' burger-line--open' : ''}`}
          />
          <span className={`burger-line${mobileOpen ? ' burger-line--open' : ''}`} />
        </button>
      </div>

      {/* Menu mobile */}
      <div
        aria-hidden={!mobileOpen}
        className={`site-mobile-nav${mobileOpen ? ' site-mobile-nav--open' : ''}`}
        id="mobile-nav"
        inert={!mobileOpen}
        ref={mobileNavRef}
        role="dialog"
        aria-label="Menu de navegação"
      >
        <nav aria-label="Links de navegação mobile">
          {NAV_LINKS.map((item) => (
            <a
              className="site-mobile-nav-link"
              href={item.href}
              key={item.href}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="site-mobile-nav-actions">
            <Link
              className="site-header-login site-mobile-login"
              href="/entrar"
              onClick={() => setMobileOpen(false)}
            >
              Entrar
            </Link>
            <Link
              className="site-header-cta site-mobile-cta"
              href="/diagnostico"
              onClick={() => setMobileOpen(false)}
            >
              Solicitar diagnóstico
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
