import { AuthCard } from '@/components/auth-card';

export default function RecoverAccessPage() {
  return (
    <AuthCard
      description="Enviaremos instruções apenas se houver um acesso ativo para o endereço informado."
      mode="recover"
      title="Recupere seu acesso"
    />
  );
}
