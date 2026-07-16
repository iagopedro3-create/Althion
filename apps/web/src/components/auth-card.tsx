import Link from 'next/link';

import { AuthForm } from './auth-form';

interface AuthCardProps {
  readonly description: string;
  readonly mode: 'login' | 'recover' | 'update-password';
  readonly title: string;
}

export function AuthCard({ description, mode, title }: AuthCardProps) {
  return (
    <main className="auth-page">
      <Link className="brand" href="/" aria-label="Althion, página inicial">
        <span className="brand-mark">A</span>
        <span>Althion</span>
      </Link>
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">Acesso protegido</p>
        <h1 id="auth-title">{title}</h1>
        <p>{description}</p>
        <AuthForm mode={mode} />
        {mode === 'login' ? (
          <Link className="text-link" href="/recuperar-acesso">
            Esqueci minha senha
          </Link>
        ) : mode === 'recover' ? (
          <Link className="text-link" href="/entrar">
            Voltar para o acesso
          </Link>
        ) : null}
      </section>
    </main>
  );
}
