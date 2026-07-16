import { AuthCard } from '@/components/auth-card';

export default function UpdatePasswordPage() {
  return (
    <AuthCard
      description="Crie uma senha exclusiva com pelo menos 12 caracteres."
      mode="update-password"
      title="Defina uma nova senha"
    />
  );
}
