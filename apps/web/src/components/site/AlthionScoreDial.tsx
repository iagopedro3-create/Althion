'use client';

import { useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Dimension {
  key: string;
  title: string;
  shortLabel: string;
  score: number;
  status: 'critical' | 'warning' | 'healthy';
  description: string;
  bottleneck: string;
  action: string;
}

// ─── 8 Dimensões do Althion Radar ────────────────────────────────────────────
// Todos os scores são dados ilustrativos — não representam métricas reais.

const DIMENSIONS: Dimension[] = [
  {
    key: 'resposta',
    title: 'Velocidade de resposta',
    shortLabel: 'Resposta',
    score: 41,
    status: 'critical',
    description:
      'Avalia o tempo entre o primeiro contato e o retorno administrativo. Demoras superiores a 15 minutos reduzem significativamente a chance de agendamento.',
    bottleneck:
      'Conversas acumulam sem priorização. A recepção responde em ordem de chegada, sem triagem por intenção.',
    action:
      'Configurar fluxo de triagem automática para identificar contatos com intenção de agendamento e notificar a equipe.',
  },
  {
    key: 'conversao',
    title: 'Conversão em agendamento',
    shortLabel: 'Conversão',
    score: 67,
    status: 'warning',
    description:
      'Mede a proporção de contatos qualificados que avançam até a confirmação de um horário.',
    bottleneck:
      'Muitos interessados recebem opções de horário, mas não são acompanhados até a confirmação.',
    action:
      'Disparar mensagens de confirmação com link de agendamento direto após 30 minutos sem resposta.',
  },
  {
    key: 'comparecimento',
    title: 'Taxa de comparecimento',
    shortLabel: 'Comparec.',
    score: 78,
    status: 'healthy',
    description:
      'Analisa o índice de ausências e cancelamentos de última hora sem realocação de horário.',
    bottleneck:
      'Confirmações são feitas com menos de 12 horas de antecedência, inviabilizando encaixes rápidos.',
    action:
      'Antecipar confirmações para 48 h antes e acionar a lista de espera assim que surgir cancelamento.',
  },
  {
    key: 'recuperacao',
    title: 'Recuperação de vagas',
    shortLabel: 'Recuperação',
    score: 34,
    status: 'critical',
    description:
      'Mede a capacidade de identificar cancelamentos e oferecer a vaga a contatos da fila de espera no mesmo dia.',
    bottleneck:
      'Cancelamentos diários se tornam vagas ociosas sem tentativa estruturada de reposição.',
    action: 'Ativar acionamento imediato da fila de espera ao detectar cancelamento na agenda.',
  },
  {
    key: 'followup',
    title: 'Seguimento ativo',
    shortLabel: 'Follow-up',
    score: 29,
    status: 'critical',
    description:
      'Avalia se leads que demonstraram interesse sem agendar recebem contato proativo em 24–72 horas.',
    bottleneck:
      'Leads frios ficam nas conversas sem próxima ação definida e sem alerta para a equipe.',
    action:
      'Criar fila de follow-up automático com cadência de 24 h, 48 h e 72 h para contatos sem agendamento.',
  },
  {
    key: 'retorno',
    title: 'Retorno de pacientes',
    shortLabel: 'Retorno',
    score: 55,
    status: 'warning',
    description:
      'Mede se pacientes de procedimentos recorrentes recebem convite ativo para o próximo agendamento.',
    bottleneck:
      'Pacientes concluem uma etapa de tratamento sem receber proposta de retorno preventivo.',
    action:
      'Configurar gatilho de lembrete de retorno baseado no tipo de procedimento e ciclo médio.',
  },
  {
    key: 'capacidade',
    title: 'Aproveitamento de agenda',
    shortLabel: 'Agenda',
    score: 61,
    status: 'warning',
    description:
      'Analisa a proporção de horários disponíveis que são efetivamente preenchidos ao longo da semana.',
    bottleneck:
      'Horários liberados por cancelamentos permanecem ociosos por falta de comunicação proativa.',
    action:
      'Monitorar disponibilidade da agenda em tempo real e acionar lista de encaixe automaticamente.',
  },
  {
    key: 'visibilidade',
    title: 'Visibilidade da operação',
    shortLabel: 'Visibilidade',
    score: 48,
    status: 'warning',
    description:
      'Avalia se o gestor tem acesso consolidado às métricas de conversão, perda e desempenho operacional.',
    bottleneck:
      'Dados de atendimento, cancelamento e recuperação estão dispersos em diferentes sistemas sem consolidação.',
    action:
      'Centralizar indicadores no painel unificado com atualização diária e alertas de variação.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<Dimension['status'], string> = {
  critical: '#F47E6B',
  warning: '#F5A26F',
  healthy: '#18A987',
};

const STATUS_LABEL: Record<Dimension['status'], string> = {
  critical: 'Atenção crítica',
  warning: 'Requer atenção',
  healthy: 'Saudável',
};

const STATUS_BADGE: Record<Dimension['status'], string> = {
  critical: 'danger',
  warning: 'warning',
  healthy: 'success',
};

function getOverallScore(dims: Dimension[]): number {
  const sum = dims.reduce((acc, d) => acc + d.score, 0);
  return Math.round(sum / dims.length);
}

// Semi-anel SVG (180°)
function ScoreRing({ score, color }: { score: number; color: string }) {
  // Circunferência do semi-círculo: raio 80, π × r = ~251
  const circ = Math.PI * 80; // ~251.3
  const offset = circ - circ * (score / 100);

  return (
    <svg
      aria-hidden="true"
      height="116"
      style={{ display: 'block' }}
      viewBox="0 0 200 116"
      width="200"
    >
      {/* Trilha */}
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke="#EEF1EE"
        strokeLinecap="round"
        strokeWidth="14"
      />
      {/* Score */}
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        pathLength={circ}
        stroke={color}
        strokeDasharray={`${circ - offset} ${offset}`}
        strokeLinecap="round"
        strokeWidth="14"
        style={{
          transition: 'stroke-dasharray 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.35s ease',
        }}
      />
    </svg>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function AlthionScoreDial() {
  const [selectedKey, setSelectedKey] = useState(DIMENSIONS[0]!.key);
  const current = DIMENSIONS.find((d) => d.key === selectedKey) ?? DIMENSIONS[0]!;
  const overall = getOverallScore(DIMENSIONS);
  const overallColor =
    overall >= 70
      ? STATUS_COLOR.healthy
      : overall >= 50
        ? STATUS_COLOR.warning
        : STATUS_COLOR.critical;

  return (
    <div className="radar-shell">
      {/* ── Coluna esquerda: anel + grade de dimensões ────────────────── */}
      <div className="radar-left">
        {/* Score global */}
        <div className="radar-ring-wrap">
          <ScoreRing color={overallColor} score={overall} />
          <div className="radar-ring-center">
            <span className="radar-score-number">{overall}</span>
            <span className="radar-score-unit">/ 100</span>
          </div>
          <p className="radar-score-label">Score geral — dado ilustrativo</p>
        </div>

        {/* Grade 2×4 de dimensões */}
        <div className="radar-grid" role="group" aria-label="Dimensões do Althion Radar">
          {DIMENSIONS.map((dim) => (
            <button
              aria-label={`${dim.title}: ${dim.score} pontos — ${STATUS_LABEL[dim.status]}`}
              aria-pressed={dim.key === selectedKey}
              className={`radar-dim-btn${dim.key === selectedKey ? ' radar-dim-btn--active' : ''}`}
              key={dim.key}
              onClick={() => setSelectedKey(dim.key)}
              type="button"
            >
              {/* Mini score bar */}
              <div className="radar-dim-bar-wrap">
                <div
                  className="radar-dim-bar-fill"
                  style={{
                    width: `${dim.score}%`,
                    background: STATUS_COLOR[dim.status],
                  }}
                />
              </div>
              <span className="radar-dim-label">{dim.shortLabel}</span>
              <span className="radar-dim-score" style={{ color: STATUS_COLOR[dim.status] }}>
                {dim.score}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Coluna direita: detalhe da dimensão ─────────────────────────*/}
      <div className="radar-detail" aria-live="polite" aria-atomic="true">
        {/* Cabeçalho */}
        <div className="radar-detail-header">
          <div>
            <span
              className={`badge ${STATUS_BADGE[current.status]}`}
              style={{ fontSize: '0.72rem' }}
            >
              {STATUS_LABEL[current.status]}
            </span>
            <h3 className="radar-detail-title">{current.title}</h3>
          </div>
          <div className="radar-detail-score-wrap">
            <span className="radar-detail-score" style={{ color: STATUS_COLOR[current.status] }}>
              {current.score}
            </span>
            <span className="radar-detail-score-max">/ 100</span>
          </div>
        </div>

        {/* Barra de score detalhada */}
        <div className="radar-detail-bar-wrap" aria-label={`Score: ${current.score} de 100`}>
          <div className="radar-detail-bar-bg">
            <div
              className="radar-detail-bar-fill"
              style={{
                width: `${current.score}%`,
                background: STATUS_COLOR[current.status],
              }}
            />
          </div>
          <span className="radar-detail-bar-note">Dado ilustrativo</span>
        </div>

        {/* Descrição */}
        <p className="radar-detail-desc">{current.description}</p>

        {/* Gargalo */}
        <div className="radar-insight radar-insight--bottleneck" aria-label="Gargalo identificado">
          <span className="radar-insight-label">Gargalo identificado</span>
          <p className="radar-insight-text">{current.bottleneck}</p>
        </div>

        {/* Acao sugerida */}
        <div className="radar-insight radar-insight--action" aria-label="Proxima acao sugerida">
          <span className="radar-insight-label">Proxima acao sugerida</span>
          <p className="radar-insight-text">{current.action}</p>
        </div>
      </div>
    </div>
  );
}
