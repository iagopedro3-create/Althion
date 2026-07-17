import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  description:
    'Radar, Score, Portal, Especialista e Recovery: como a Althion identifica perdas administrativas na agenda e orienta ações explicáveis.',
  title: 'Produto',
};

// Descrições factuais dos pilares (docs/product/vision.md e mvp-scope.md).
// A forma de comunicar publicamente a maturidade de cada pilar é decisão de marketing:
// marcada como pendente, não afirmada aqui. [ESTÁGIO DE COMUNICAÇÃO A APROVAR]
const PILLARS = [
  {
    body: 'Diagnóstico da operação com entrada manual de indicadores administrativos e recomendação de um plano inicial. Mostra a cobertura e a confiança dos dados usados.',
    name: 'Radar',
  },
  {
    body: 'Althion Score de 0 a 100 com fórmula, pesos e versão explícitos. Cada nota é rastreável até os dados de entrada, com componentes, histórico, comparação e indicação de dados insuficientes.',
    name: 'Score',
  },
  {
    body: 'Dashboard orientado a problemas e próximas ações: indicadores prioritários, oportunidades, solicitações, plano de melhoria, especialista e estado das integrações.',
    name: 'Portal',
  },
  {
    body: 'Carteira do Especialista de Relacionamento com saúde das contas, SLAs, incidentes, capacidade e próxima melhor ação explicável — risco sinalizado como heurística com evidência, nunca como fato.',
    name: 'Especialista',
  },
  {
    body: 'Motor de recuperação com regras determinísticas e versionadas, simulação, aprovação humana, idempotência, limite de frequência, consentimento e supressão. Nenhuma ação é executada sem decisão humana registrada.',
    name: 'Recovery',
  },
] as const;

export default function ProdutoPage() {
  return (
    <main className="site-main">
      <section className="site-page-header">
        <p className="eyebrow">Produto</p>
        <h1>Perda, ação e impacto — com rastreabilidade.</h1>
        <p className="lead-copy">
          A Althion acompanha estados e eventos administrativos da jornada: contato, atendimento,
          agendamento, confirmação, comparecimento e retorno. Ela não registra prontuário,
          diagnóstico, exame, prescrição ou decisão clínica.
        </p>
      </section>

      <section aria-label="Pilares do produto" className="site-feature-list">
        {PILLARS.map((pillar, index) => (
          <article className="site-feature" key={pillar.name}>
            <span className="site-feature-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h2>{pillar.name}</h2>
              <p>{pillar.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="site-note-card">
        <p>
          <strong>Sobre maturidade e resultados.</strong> A forma de comunicar o estágio de cada
          pilar e qualquer número de resultado depende de validação e aprovação.{' '}
          <span className="marker">[ESTÁGIO DE COMUNICAÇÃO E MÉTRICAS A APROVAR]</span> Nenhuma
          estimativa é apresentada como receita realizada.
        </p>
      </section>

      <section aria-labelledby="produto-cta" className="site-cta">
        <div>
          <p className="eyebrow">Próximo passo</p>
          <h2 id="produto-cta">Veja como isso se aplica à sua clínica.</h2>
          <p className="lead-copy">Uma conversa de diagnóstico, sem compromisso de contratação.</p>
        </div>
        <Link className="primary-link" href="/contato">
          Agendar um diagnóstico
        </Link>
      </section>
    </main>
  );
}
