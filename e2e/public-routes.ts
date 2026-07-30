/**
 * Lista canônica das rotas que respondem sem sessão.
 *
 * É a única fonte para os conjuntos que varrem o site inteiro — CSP
 * (`foundation.spec.ts`) e acessibilidade (`accessibility.spec.ts`). Manter uma
 * lista só é o que garante que uma rota pública nova nasça coberta pelos dois.
 */
export const PUBLIC_ROUTES = [
  '/',
  '/contato',
  '/definir-senha',
  '/diagnostico',
  '/entrar',
  '/privacidade',
  '/produto',
  '/radar',
  '/recuperar-acesso',
  '/seguranca',
  '/sobre',
  '/termos',
] as const;
