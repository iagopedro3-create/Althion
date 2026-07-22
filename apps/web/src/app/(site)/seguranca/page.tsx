import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  description:
    'Isolamento por organização, decisões explicáveis, minimização de dados e ausência de função clínica: os princípios de segurança e privacidade da Althion.',
  title: 'Segurança e privacidade',
};

// Diferenciais factuais do produto (docs/product/non-goals.md, security-model.md, vision.md).
const PRINCIPLES = [
  {
    body: 'Cada organização enxerga apenas os próprios dados. O isolamento entre clientes é um requisito de produto, aplicado no banco e testado com casos negativos.',
    title: 'Isolamento por organização',
  },
  {
    body: 'Notas, recomendações e alertas trazem sua regra, evidência e versão. Preferimos regras determinísticas à IA quando a decisão é clara.',
    title: 'Decisões explicáveis',
  },
  {
    body: 'Coletamos o mínimo necessário e respeitamos consentimento, supressão e frequência. Nenhum contato ocorre sem base aplicável.',
    title: 'Minimização e consentimento',
  },
  {
    body: 'A Althion atua na jornada administrativa. Não há diagnóstico, prescrição, prontuário, triagem ou interpretação de exames — conteúdo potencialmente clínico é encaminhado a uma pessoa, sem interpretação pela IA.',
    title: 'Sem função clínica',
  },
  {
    body: 'Integrações são tratadas como provedores substituíveis. O sistema operacional de atendimento funciona em paralelo; a Althion mantém contratos próprios para evitar acoplamento a um fornecedor específico.',
    title: 'Integrações substituíveis',
  },
] as const;

export default function SegurancaPage() {
  return (
    <main className="site-main">
      <section className="site-page-header">
        <p className="eyebrow">Segurança e privacidade</p>
        <h1>Governança antes de automação.</h1>
        <p className="lead-copy">
          A confiança do gestor vem de rastreabilidade e de limites claros. Estes princípios são
          parte do produto, não um adendo.
        </p>
      </section>

      <section aria-label="Princípios de segurança" className="site-card-grid two-up">
        {PRINCIPLES.map((principle) => (
          <article className="site-card" key={principle.title}>
            <h2>{principle.title}</h2>
            <p>{principle.body}</p>
          </article>
        ))}
      </section>

      <section className="site-note-card">
        <p>
          <strong>Conformidade LGPD.</strong> Bases legais, retenção, descarte e o encarregado de
          dados fazem parte da documentação jurídica em preparação.{' '}
          <span className="marker">[POLÍTICA DE PRIVACIDADE E BASE LEGAL A APROVAR]</span> Consulte
          a <Link href="/privacidade">política de privacidade</Link> quando publicada.
        </p>
      </section>
    </main>
  );
}
