import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  description: 'Infraestrutura de Recuperação e Performance da Agenda para clínicas.',
  title: {
    default: 'Althion',
    template: '%s | Althion',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
