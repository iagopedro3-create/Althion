import { describe, expect, it } from 'vitest';

import { escapeCsvCell } from './csv';

describe('escapeCsvCell', () => {
  it.each(['=CMD()', '+SUM(A1)', '-2+3', '@malicious'])('neutralizes formula input %s', (input) => {
    expect(escapeCsvCell(input)).toBe(`"'${input}"`);
  });

  it('escapes quotes without losing content', () => {
    expect(escapeCsvCell('origem "manual"')).toBe('"origem ""manual"""');
  });
});
