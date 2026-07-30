import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { PUBLIC_ROUTES } from './public-routes';

/**
 * Um teste por rota, em vez de um laço dentro de um teste: assim o relatório
 * aponta qual página falhou. Num laço único, a primeira falha esconde o resto.
 *
 * O filtro em `critical`/`serious` é o critério já em uso no repositório —
 * violações `minor`/`moderate` continuam visíveis no relatório do axe, mas não
 * reprovam o conjunto.
 */
for (const route of PUBLIC_ROUTES) {
  test(`has no critical accessibility violations on ${route}`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    expect(
      results.violations.filter((violation) =>
        ['critical', 'serious'].includes(violation.impact ?? ''),
      ),
    ).toEqual([]);
  });
}
