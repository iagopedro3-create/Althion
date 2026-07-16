// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScoreTrend } from './score-trend';

const point = (index: number) => ({
  calculatedAt: `2026-0${index + 1}-15T12:00:00Z`,
  coverage: 80 + index,
  id: `70000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  scoreValue: 60 + index,
});

describe('ScoreTrend', () => {
  it('shows exact snapshots instead of implying a trend with too few observations', () => {
    render(<ScoreTrend points={[point(0), point(1)]} />);

    expect(screen.getByText('60/100')).toBeInTheDocument();
    expect(screen.getByText('61/100')).toBeInTheDocument();
    expect(screen.getByText(/linha ser.* exibido com oito/i)).toBeInTheDocument();
    expect(document.querySelector('.score-chart')).not.toBeInTheDocument();
  });

  it('explains how to create the first historical observation', () => {
    render(<ScoreTrend points={[]} />);

    expect(screen.getByText(/Envie diagn.*do Radar/i)).toBeInTheDocument();
    expect(screen.queryByText('0/100')).not.toBeInTheDocument();
  });
});
