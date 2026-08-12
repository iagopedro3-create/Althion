'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#plataforma', label: 'Plataforma' },
  { href: '#recuperacao', label: 'Recuperação' },
  { href: '#especialista', label: 'Especialista' },
  { href: '#performance', label: 'Performance' },
] as const;

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <header className="marketing-header">
      <div className="marketing-container marketing-header-inner">
        <Link className="marketing-brand" href="/" aria-label="Althion, página inicial">
          <span aria-hidden="true">A</span>
          <strong>ALTHION</strong>
        </Link>

        <nav className="marketing-nav" aria-label="Navegação principal">
          {LINKS.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <Link className="marketing-header-cta" href="/diagnostico">
          Solicitar diagnóstico
        </Link>

        <button
          className="marketing-menu-button"
          type="button"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls="marketing-mobile-menu"
          onClick={() => setOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        className={`marketing-mobile-menu${open ? ' is-open' : ''}`}
        id="marketing-mobile-menu"
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label="Navegação mobile">
          {LINKS.map((item) => (
            <a href={item.href} key={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <Link href="/diagnostico" onClick={() => setOpen(false)}>
            Solicitar diagnóstico
          </Link>
        </nav>
      </div>
    </header>
  );
}
