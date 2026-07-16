'use client';

import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';

import type { PortalDashboardView } from '@/lib/api/portal';

type TrendPoint = PortalDashboardView['trend'][number];

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(value));

export function ScoreTrend({ points }: Readonly<{ points: readonly TrendPoint[] }>) {
  const data = points.map((point) => ({
    ...point,
    dateLabel: formatDate(point.calculatedAt),
  }));

  if (data.length < 8) {
    return (
      <section className="portal-panel trend-panel" aria-labelledby="trend-heading">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Movimento</p>
            <h2 id="trend-heading">Evolução do Althion Score</h2>
          </div>
          <span className="data-chip">{data.length} snapshots</span>
        </div>
        {data.length ? (
          <div className="snapshot-strip" aria-label="Snapshots disponíveis">
            {data.map((point) => (
              <article key={point.id}>
                <time dateTime={point.calculatedAt}>{point.dateLabel}</time>
                <strong>{point.scoreValue}/100</strong>
                <span>{point.coverage}% coberto</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted-copy">Envie diagnósticos do Radar para formar uma série histórica.</p>
        )}
        <p className="chart-note">
          O gráfico de linha será exibido com oito ou mais snapshots. Antes disso, mostramos os
          valores exatos para não sugerir uma tendência sem observações suficientes.
        </p>
      </section>
    );
  }

  return (
    <section className="portal-panel trend-panel" aria-labelledby="trend-heading">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Movimento</p>
          <h2 id="trend-heading">Evolução do Althion Score</h2>
          <p>Snapshots calculados · escala de 0 a 100 · cobertura disponível na tabela.</p>
        </div>
      </div>
      <div className="score-chart" aria-label="Gráfico da evolução do Althion Score">
        <LineChart
          accessibilityLayer
          data={data}
          height={300}
          margin={{ bottom: 8, left: -8, right: 12, top: 12 }}
          responsive
          width="100%"
        >
          <CartesianGrid stroke="#d7ded8" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="dateLabel" stroke="#607067" tickLine={false} />
          <YAxis domain={[0, 100]} stroke="#607067" tickLine={false} width={42} />
          <Tooltip
            contentStyle={{ background: '#f7faf7', border: '1px solid #c9d4cc', borderRadius: 12 }}
            formatter={(value) => [`${String(value)}/100`, 'Score']}
          />
          <Line
            activeDot={{ fill: '#f3bd4f', r: 6, stroke: '#183d32', strokeWidth: 2 }}
            dataKey="scoreValue"
            dot={{ fill: '#f7faf7', r: 4, stroke: '#1f6b55', strokeWidth: 2 }}
            isAnimationActive={false}
            name="Althion Score"
            stroke="#1f6b55"
            strokeWidth={3}
            type="monotone"
          />
        </LineChart>
      </div>
      <details className="chart-table">
        <summary>Ver valores do gráfico</summary>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Score</th>
              <th>Cobertura</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.id}>
                <td>{point.dateLabel}</td>
                <td>{point.scoreValue}/100</td>
                <td>{point.coverage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
