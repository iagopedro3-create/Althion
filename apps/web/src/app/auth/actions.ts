'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

export interface AuthActionState {
  readonly error?: string;
  readonly success?: string;
}

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(12).max(128),
});

const emailSchema = z.object({ email: z.email() });
const passwordSchema = z
  .object({
    confirmPassword: z.string(),
    password: z.string().min(12).max(128),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const input = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) {
    return { error: 'Informe um e-mail válido e uma senha com pelo menos 12 caracteres.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(input.data);
    if (error) return { error: 'E-mail ou senha inválidos.' };
  } catch {
    return { error: 'A autenticação ainda não está configurada neste ambiente.' };
  }

  redirect('/app');
}

export async function requestPasswordReset(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const input = emailSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: 'Informe um e-mail válido.' };

  try {
    const supabase = await createClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://127.0.0.1:3000';
    await supabase.auth.resetPasswordForEmail(input.data.email, {
      redirectTo: `${baseUrl}/auth/callback?next=/definir-senha`,
    });
  } catch {
    return { error: 'A recuperação de acesso ainda não está configurada neste ambiente.' };
  }

  return {
    success: 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.',
  };
}

export async function updatePassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const input = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) {
    return { error: input.error.issues[0]?.message ?? 'Verifique a senha informada.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: input.data.password });
    if (error) return { error: 'O link expirou ou a senha não pôde ser atualizada.' };
  } catch {
    return { error: 'A autenticação ainda não está configurada neste ambiente.' };
  }

  redirect('/app');
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/entrar');
}
