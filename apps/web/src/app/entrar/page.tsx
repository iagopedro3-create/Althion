import { AuthCard } from '@/components/auth-card';

export default function LoginPage() {
  return (
    <AuthCard
      description="Use o acesso recebido pela sua organização. Não há cadastro público."
      mode="login"
      title="Acesse sua operação"
    />
  );
}
