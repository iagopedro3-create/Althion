import { SiteChrome } from '@/components/site/SiteChrome';

// Grupo de rotas público, isolado do portal autenticado: nenhuma página aqui exige sessão.
// O deploy é compartilhado com o portal, mas código e roteamento permanecem desacoplados.

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteChrome>{children}</SiteChrome>;
}
