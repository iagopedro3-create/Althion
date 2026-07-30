import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const publicRoutes = [
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

test('presents the Althion positioning and access path', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Converta mais dos contatos que sua clínica já recebe',
  );
  await page.getByRole('link', { name: 'Acessar a plataforma' }).focus();
  await expect(page.getByRole('link', { name: 'Acessar a plataforma' })).toBeFocused();
});

test('shows an accessible login form without public signup', async ({ page }) => {
  await page.goto('/entrar');

  await expect(page.getByLabel('E-mail')).toBeVisible();
  await expect(page.getByLabel('Senha')).toBeVisible();
  await expect(page.getByText('Não há cadastro público')).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(
    results.violations.filter((violation) =>
      ['critical', 'serious'].includes(violation.impact ?? ''),
    ),
  ).toEqual([]);
});

test('serves baseline browser security headers', async ({ page }) => {
  const response = await page.goto('/');
  const headers = response?.headers() ?? {};

  expect(headers['permissions-policy']).toBe('camera=(), geolocation=(), microphone=()');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
});

test('serves a Content-Security-Policy that contains exfiltration and framing', async ({
  page,
}) => {
  const response = await page.goto('/');
  const policy = response?.headers()['content-security-policy'] ?? '';

  // Diretivas que sustentam o controle mesmo sem nonce em `script-src`.
  expect(policy).toContain("default-src 'self'");
  expect(policy).toContain("base-uri 'self'");
  expect(policy).toContain("form-action 'self'");
  expect(policy).toContain("frame-ancestors 'none'");
  expect(policy).toContain("object-src 'none'");
  // `connect-src` nunca pode virar curinga: é o que impede exfiltração.
  expect(policy).toMatch(/connect-src [^;]*'self'/);
  expect(policy).not.toContain('connect-src *');
});

test('keeps development-only sources out of the production policy', async ({ page }) => {
  test.skip(process.env.E2E_EXPECT_PRODUCTION_CSP !== 'true');

  const response = await page.goto('/');
  const policy = response?.headers()['content-security-policy'] ?? '';

  expect(policy).toContain('upgrade-insecure-requests');
  expect(policy).not.toContain("'unsafe-eval'");
  expect(policy).not.toContain('ws:');
});

test('renders every public page without Content-Security-Policy violations', async ({ page }) => {
  test.setTimeout(120_000);

  const violations: string[] = [];
  page.on('console', (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text())) {
      violations.push(message.text());
    }
  });

  for (const route of publicRoutes) {
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `${route} should respond successfully`).toBe(true);
    await expect(page.locator('body')).toBeVisible();
  }

  expect(violations).toEqual([]);
});
