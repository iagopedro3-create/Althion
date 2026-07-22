// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FAQAccordions } from './FAQAccordions';

describe('FAQAccordions', () => {
  it('starts collapsed with every trigger not expanded', () => {
    render(<FAQAccordions />);

    expect(screen.getByRole('button', { name: 'O que é a Althion?' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('expands a panel wired to its trigger on click', () => {
    render(<FAQAccordions />);
    const trigger = screen.getByRole('button', { name: 'A Althion é apenas um CRM?' });

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('region', { name: 'A Althion é apenas um CRM?' });
    expect(panel).toHaveTextContent(/não substituímos o CRM/i);
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
  });

  it('collapses when the open trigger is clicked again', () => {
    render(<FAQAccordions />);
    const trigger = screen.getByRole('button', { name: 'O que é a Althion?' });

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('keeps only one panel open at a time', () => {
    render(<FAQAccordions />);
    const first = screen.getByRole('button', { name: 'O que é a Althion?' });
    const second = screen.getByRole('button', { name: 'A Althion é apenas um CRM?' });

    fireEvent.click(first);
    fireEvent.click(second);

    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('region')).toHaveLength(1);
  });
});
