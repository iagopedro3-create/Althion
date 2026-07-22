// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CapacityCalor } from './CapacityCalor';

describe('CapacityCalor', () => {
  it('marks a single default day as pressed with a text status label', () => {
    render(<CapacityCalor />);

    const pressed = screen.getByRole('button', { pressed: true });
    expect(pressed).toHaveAccessibleName(/Terça/);
    // Status must be available as text, not conveyed by dot color alone.
    expect(pressed).toHaveAccessibleName(/Ocupação baixa/);
  });

  it('moves the pressed state to the clicked day', () => {
    render(<CapacityCalor />);
    const monday = screen.getByRole('button', { name: /Segunda/ });

    fireEvent.click(monday);

    expect(monday).toHaveAttribute('aria-pressed', 'true');
    expect(monday).toHaveAccessibleName(/Ocupação saudável/);
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1);
  });
});
