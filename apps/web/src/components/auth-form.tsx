'use client';

import { useActionState } from 'react';

import {
  requestPasswordReset,
  signIn,
  updatePassword,
  type AuthActionState,
} from '@/app/auth/actions';

const initialState: AuthActionState = {};

interface AuthFormProps {
  readonly mode: 'login' | 'recover' | 'update-password';
}

export function AuthForm({ mode }: AuthFormProps) {
  const action =
    mode === 'login' ? signIn : mode === 'recover' ? requestPasswordReset : updatePassword;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="auth-form">
      {mode !== 'update-password' ? (
        <label>
          <span>E-mail</span>
          <input
            autoComplete="email"
            inputMode="email"
            name="email"
            placeholder="voce@clinica.com.br"
            required
            type="email"
          />
        </label>
      ) : null}

      {mode !== 'recover' ? (
        <label>
          <span>{mode === 'login' ? 'Senha' : 'Nova senha'}</span>
          <input
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={12}
            name="password"
            required
            type="password"
          />
        </label>
      ) : null}

      {mode === 'update-password' ? (
        <label>
          <span>Confirmar nova senha</span>
          <input
            autoComplete="new-password"
            minLength={12}
            name="confirmPassword"
            required
            type="password"
          />
        </label>
      ) : null}

      <p aria-live="polite" className={state.error ? 'form-message error' : 'form-message'}>
        {state.error ?? state.success ?? ''}
      </p>

      <button disabled={pending} type="submit">
        {pending
          ? 'Processando…'
          : mode === 'login'
            ? 'Entrar com segurança'
            : mode === 'recover'
              ? 'Enviar instruções'
              : 'Atualizar senha'}
      </button>
    </form>
  );
}
