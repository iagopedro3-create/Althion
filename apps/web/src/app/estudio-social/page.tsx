import type { Metadata } from 'next';

import { SocialStudio } from './social-studio';

export const metadata: Metadata = {
  description: 'Estúdio de posts da Althion em formato 4:5, prontos para exportação em PNG.',
  title: 'Estúdio Social',
};

export default function SocialStudioPage() {
  return <SocialStudio />;
}
