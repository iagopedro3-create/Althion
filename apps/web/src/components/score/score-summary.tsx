import type { ScoreDetailView } from '@/lib/api/radar';

const DIMENSIONS: Record<string, string> = {
  attendance: 'Comparecimento',
  continuity: 'Continuidade',
  conversion: 'Conversão',
  data_intelligence: 'Inteligência de dados',
  occupancy: 'Ocupação',
  recovery: 'Recuperação',
  retention: 'Retenção',
  speed: 'Velocidade',
};

const PRIORITIES = { high: 'Alta', low: 'Baixa', medium: 'Média' } as const;

export function ScoreSummary({ detail }: Readonly<{ detail: ScoreDetailView }>) {
  const { score } = detail;
  return (
    <>
      <section className="score-hero" aria-labelledby="score-heading">
        <div>
          <p className="eyebrow">Althion Score · {detail.formula.version}</p>
          <h1 id="score-heading">
            {score.status === 'calculated' ? `${score.score_value}/100` : 'Dados insuficientes'}
          </h1>
          <p>
            Cobertura de {score.coverage}% · fórmula{' '}
            {detail.formula.status === 'draft' ? 'provisória' : 'publicada'}
          </p>
        </div>
        <div
          className="coverage-ring"
          style={{ '--coverage': `${score.coverage}%` } as React.CSSProperties}
        >
          <strong>{score.coverage}%</strong>
          <span>cobertura</span>
        </div>
      </section>

      {score.status === 'insufficient_data' ? (
        <section className="state-card warning" role="status">
          <h2>A nota global não foi publicada</h2>
          <p>
            Os componentes disponíveis continuam visíveis. Complete as dimensões obrigatórias sem
            substituir dados ausentes por zero.
          </p>
        </section>
      ) : null}

      <section aria-labelledby="components-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Explicação da nota</p>
            <h2 id="components-heading">Componentes operacionais</h2>
          </div>
        </div>
        <div className="score-grid">
          {detail.components.map((component) => (
            <article className="score-card" key={component.id}>
              <div className="score-card-heading">
                <h3>{DIMENSIONS[component.dimension] ?? component.dimension}</h3>
                <span>Peso {component.weight}%</span>
              </div>
              <strong>
                {component.score_value === null ? 'Sem dados' : `${component.score_value}%`}
              </strong>
              <div className="score-bar" aria-hidden="true">
                <span style={{ width: `${component.score_value ?? 0}%` }} />
              </div>
              <small>
                Contribuição:{' '}
                {component.contribution === null ? 'não calculada' : component.contribution}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="recommendations-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Próximas ações</p>
            <h2 id="recommendations-heading">Recomendações administrativas</h2>
          </div>
        </div>
        {detail.recommendations.length ? (
          <div className="recommendation-list">
            {detail.recommendations.map((recommendation) => (
              <article className="recommendation-card" key={recommendation.id}>
                <span className={`priority ${recommendation.priority}`}>
                  {PRIORITIES[recommendation.priority]}
                </span>
                <div>
                  <h3>{recommendation.title}</h3>
                  <p>{recommendation.rationale}</p>
                  <small>Regra {recommendation.rule_version}</small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="state-card">
            <p>Nenhuma lacuna foi identificada pelos critérios provisórios.</p>
          </div>
        )}
      </section>
    </>
  );
}
