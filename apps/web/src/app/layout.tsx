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
  metadataBase: new URL('https://althionops.com.br'),
  applicationName: 'Althion',
  description: 'Infraestrutura de Recuperação e Performance da Agenda para clínicas.',
  title: {
    default: 'Althion',
    template: '%s | Althion',
  },
  icons: {
    icon: [
      { url: '/brand/official/png/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/official/png/favicon-64.png', sizes: '64x64', type: 'image/png' },
    ],
    apple: '/brand/official/png/favicon-180.png',
  },
  openGraph: {
    description: 'Infraestrutura de Recuperação e Performance da Agenda para clínicas.',
    images: [
      {
        alt: 'Althion — Recuperação e Performance da Agenda',
        height: 630,
        url: '/brand/official/png/og-image-1200x630.png',
        width: 1200,
      },
    ],
    locale: 'pt_BR',
    siteName: 'Althion',
    title: 'Althion',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    description: 'Infraestrutura de Recuperação e Performance da Agenda para clínicas.',
    images: ['/brand/official/png/og-image-1200x630.png'],
    title: 'Althion',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${inter.variable} ${manrope.variable}`} lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
