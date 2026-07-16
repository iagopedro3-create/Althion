// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { PortalDashboardView } from '@/lib/api/portal';

import { PortalDashboard } from './portal-dashboard';

const dashboard: PortalDashboardView = {
  clinicId: '20000000-0000-4000-8000-000000000001',
  generatedAt: '2026-07-16T12:00:00Z',
  integrations: [],
  opportunities: [],
  organizationId: '10000000-0000-4000-8000-000000000001',
  plan: null,
  requests: { highPriorityOpen: 0, open: 0, totalVisible: 0 },
  score: { availability: 'insufficient_data', coverage: 55 },
  sources: [
    {
      availability: 'source_blocked',
      key: 'leads',
      label: 'Leads e conversas',
      source: 'helena',
    },
  ],
  specialist: { availability: 'not_assigned' },
  trend: [],
};

describe('PortalDashboard', () => {
  it('turns unavailable data into actions without fabricating a score or specialist', () => {
    render(
      <PortalDashboard
        clinicName="Clinica Horizonte"
        context={{
          clinicId: dashboard.clinicId,
          organizationId: dashboard.organizationId,
        }}
        dashboard={dashboard}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Dados insuficientes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Iniciar Radar' })).toBeInTheDocument();
    expect(screen.getByText('Fonte bloqueada')).toBeInTheDocument();
    expect(screen.getByText(/Especialista ainda n.*atribu/i)).toBeInTheDocument();
    expect(screen.queryByText('0/100')).not.toBeInTheDocument();
  });
});
