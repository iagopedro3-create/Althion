// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuthForm } from './auth-form';

vi.mock('@/app/auth/actions', () => ({
  requestPasswordReset: vi.fn(),
  signIn: vi.fn(),
  updatePassword: vi.fn(),
}));

describe('AuthForm', () => {
  it('associates accessible labels with login inputs', () => {
    render(<AuthForm mode="login" />);

    expect(screen.getByRole('textbox', { name: 'E-mail' })).toBeRequired();
    expect(screen.getByLabelText('Senha')).toBeRequired();
    expect(screen.getByRole('button', { name: 'Entrar com segurança' })).toBeEnabled();
  });
});
