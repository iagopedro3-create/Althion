'use client';

import { usePathname, useSearchParams } from 'next/navigation';

const ITEMS = [
  { href: '/app', label: 'Visão geral' },
  { href: '/app/indicadores', label: 'Indicadores' },
  { href: '/app/oportunidades', label: 'Oportunidades' },
  { href: '/app/solicitacoes', label: 'Solicitações' },
  { href: '/app/plano-de-melhoria', label: 'Plano' },
  { href: '/app/qualidade', label: 'Qualidade' },
  { href: '/app/google-ads', label: 'Google Ads' },
  { href: '/app/relatorios', label: 'Relatórios' },
  { href: '/app/especialista', label: 'Especialista' },
  { href: '/app/integracoes', label: 'Integrações' },
  { href: '/app/configuracoes', label: 'Configurações' },
] as const;

export function PortalNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organizationId');
  const clinicId = searchParams.get('clinicId');
  const suffix =
    organizationId && clinicId ? `?${new URLSearchParams({ clinicId, organizationId })}` : '';

  return (
    <nav aria-label="Navegação do Portal" className="portal-section-nav">
      {ITEMS.map((item) => (
        <a
          aria-current={pathname === item.href ? 'page' : undefined}
          className={pathname === item.href ? 'active' : undefined}
          href={`${item.href}${suffix}`}
          key={item.href}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
