import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PUBLIC_PATHS = ['/', '/produto', '/seguranca', '/sobre', '/contato'] as const;

test('navigates the public site without requiring a session', async ({ page }) => {
  await page.goto('/');

  // A navegação e a conversão principal (agendar diagnóstico) apontam para as rotas públicas.
  const siteNav = page.getByRole('navigation', { name: 'Seções do site' });
  await expect(siteNav.getByRole('link', { name: 'Produto' })).toHaveAttribute('href', '/produto');
  await expect(page.getByRole('link', { name: 'Agendar um diagnóstico' }).first()).toHaveAttribute(
    'href',
    '/contato',
  );

  // Uma navegação real confirma que a página pública abre sem sessão.
  await page.getByRole('link', { name: 'Agendar um diagnóstico' }).first().click();
  await page.waitForURL(/\/contato$/, { timeout: 30_000 });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('keeps the contact form gated and honest before the channel is live', async ({ page }) => {
  await page.goto('/contato');
  await expect(page.getByText('Canal em preparação')).toBeVisible();

  await page.getByLabel('Nome', { exact: true }).fill('Gestora Sintética');
  await page.getByLabel('E-mail corporativo', { exact: true }).fill('gestora@example.com');
  await page.getByLabel('Clínica ou organização', { exact: true }).fill('Clínica Sintética');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Enviar contato' }).click();

  // Nenhum dado é armazenado enquanto o canal não está configurado.
  await expect(page.getByText('ainda não está ativo')).toBeVisible();
});

test('requires consent before the contact form submits', async ({ page }) => {
  await page.goto('/contato');
  await page.getByLabel('Nome', { exact: true }).fill('Gestora Sintética');
  await page.getByLabel('E-mail corporativo', { exact: true }).fill('gestora@example.com');
  await page.getByLabel('Clínica ou organização', { exact: true }).fill('Clínica Sintética');
  await page.getByRole('button', { name: 'Enviar contato' }).click();

  await expect(page.getByText('É necessário concordar com o uso dos dados')).toBeVisible();
});

for (const path of PUBLIC_PATHS) {
  test(`has no critical accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(
      results.violations.filter((violation) =>
        ['critical', 'serious'].includes(violation.impact ?? ''),
      ),
    ).toEqual([]);
  });
}
