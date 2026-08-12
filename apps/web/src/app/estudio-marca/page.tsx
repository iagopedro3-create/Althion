import type { Metadata } from 'next';

import { BrandStudio } from './brand-studio';

export const metadata: Metadata = {
  description: 'Kit oficial da marca Althion com logos, avatares e capas de destaques.',
  title: 'Estúdio de Marca',
};

export default function BrandStudioPage() {
  return <BrandStudio />;
}
