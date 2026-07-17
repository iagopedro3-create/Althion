import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('presents the Althion positioning and access path', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Transforme oportunidades administrativas em consultas realizadas',
  );
  await page.getByRole('link', { name: 'Acessar plataforma' }).focus();
  await expect(page.getByRole('link', { name: 'Acessar plataforma' })).toBeFocused();
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
