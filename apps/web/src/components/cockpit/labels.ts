export const HEALTH_LABELS: Record<string, string> = {
  attention: 'Atenção',
  critical: 'Crítica',
  healthy: 'Saudável',
};

export const RISK_LABELS: Record<string, string> = {
  data_freshness: 'Atualização de dados',
  engagement: 'Engajamento',
  operational: 'Operacional',
  performance: 'Performance',
  responsiveness: 'Tempo de resposta',
};

export const SLA_LABELS: Record<string, string> = {
  at_risk: 'Em risco',
  breached: 'Estourado',
  met: 'Cumprido',
  on_track: 'No prazo',
};

export const INCIDENT_STATUS_LABELS: Record<string, string> = {
  closed: 'Encerrado',
  investigating: 'Em investigação',
  mitigated: 'Mitigado',
  open: 'Aberto',
  resolved: 'Resolvido',
};

export const INCIDENT_SEVERITY_LABELS: Record<string, string> = {
  critical: 'Crítica',
  high: 'Alta',
  low: 'Baixa',
  medium: 'Média',
};

export const INCIDENT_CATEGORY_LABELS: Record<string, string> = {
  data_quality: 'Qualidade dos dados',
  engagement_risk: 'Risco de engajamento',
  integration_failure: 'Falha de integração',
  operational: 'Operacional',
  other: 'Outro',
  sla_breach: 'SLA estourado',
};

export const MEETING_STATUS_LABELS: Record<string, string> = {
  cancelled: 'Cancelada',
  completed: 'Concluída',
  no_show: 'Não compareceu',
  scheduled: 'Agendada',
};

export const MEETING_PURPOSE_LABELS: Record<string, string> = {
  checkin: 'Check-in',
  escalation: 'Escalonamento',
  onboarding: 'Onboarding',
  other: 'Outro',
  review: 'Revisão',
};

export const COMPLEXITY_LABELS: Record<string, string> = {
  high: 'Alta (peso 3)',
  low: 'Baixa (peso 1)',
  standard: 'Padrão (peso 2)',
};

export const REQUEST_PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta',
  low: 'Baixa',
  normal: 'Normal',
  urgent: 'Urgente',
};

export const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );

export const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(value));
