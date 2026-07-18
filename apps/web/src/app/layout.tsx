import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';

import './globals.css';

// Fontes self-hosted via next/font (variable fonts): elimina o @import render-blocking
// do Google Fonts e garante os pesos intermediários (620/650/750) usados no CSS.
const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-inter',
});

const manrope = Manrope({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  description: 'Infraestrutura de Recuperação e Performance da Agenda para clínicas.',
  title: {
    default: 'Althion',
    template: '%s | Althion',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${inter.variable} ${manrope.variable}`} lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
