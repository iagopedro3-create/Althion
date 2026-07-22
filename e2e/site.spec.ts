import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PUBLIC_PATHS = ['/', '/produto', '/seguranca', '/sobre', '/contato', '/diagnostico'] as const;

test('navigates the public site without requiring a session', async ({ page }) => {
  await page.goto('/');

  // A navegação e a conversão principal apontam para seções e rotas públicas.
  const siteNav = page.getByRole('navigation', { name: 'Seções da página' });
  await expect(siteNav.getByRole('link', { name: 'Como funciona' })).toHaveAttribute(
    'href',
    '#como-funciona',
  );
  await expect(page.getByRole('link', { name: 'Solicitar diagnóstico' }).first()).toHaveAttribute(
    'href',
    '/diagnostico',
  );

  // Uma navegação real confirma que a página pública abre sem sessão.
  await page.getByRole('link', { name: 'Solicitar diagnóstico' }).first().click();
  await page.waitForURL(/\/diagnostico$/, { timeout: 30_000 });
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

test('keeps the diagnostic form gated until a real destination is configured', async ({ page }) => {
  await page.goto('/diagnostico');

  await expect(page.getByText('Canal em preparação')).toBeVisible();
  await expect(page.getByText('Nenhum dado será armazenado ou encaminhado')).toBeVisible();
});

test('does not persist diagnostic contact PII in the browser draft', async ({ page }) => {
  await page.goto('/diagnostico');
  await page.getByLabel('Nome completo').fill('Gestora Sintética');
  await page.getByLabel('Seu cargo / função na clínica').fill('Gestora');
  await page.getByLabel('E-mail profissional').fill('gestora@example.com');
  await page.getByLabel('WhatsApp profissional').fill('(11) 98888-7777');
  await page.getByRole('button', { name: 'Avançar' }).click();

  const draft = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('althion_diagnosis_draft_v2') ?? '{}'),
  );

  expect(draft).not.toHaveProperty('name');
  expect(draft).not.toHaveProperty('role');
  expect(draft).not.toHaveProperty('email');
  expect(draft).not.toHaveProperty('whatsapp');
});

test('stops illustrative autoplay when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const queue = page.getByText('Oportunidades processadas com aprovação humana');
  await queue.scrollIntoViewIfNeeded();
  await expect(page.getByText('Identificada', { exact: true })).toBeVisible();
  await page.waitForTimeout(5_500);
  await expect(page.getByText('Identificada', { exact: true })).toBeVisible();
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
