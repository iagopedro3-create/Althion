import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Home from './page';

describe('landing page', () => {
  it('apresenta o posicionamento e encaminha ao diagnóstico disponível', () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).toContain('Descubra onde elas se perdem');
    expect(html).toContain('Diagnóstico operacional para clínicas');
    expect(html).toContain('href="/diagnostico"');
    expect(html).toContain('PLATAFORMA ALTHION');
    expect(html).toContain('A composição da infraestrutura é definida');
    expect(html).toContain('Recuperação de oportunidades');
    expect(html).toContain('operação acompanhada');
    expect(html).toContain('O diagnóstico abre uma jornada clara de evolução');
  });

  it('não expõe fornecedores internos nem promete resultado financeiro', () => {
    const html = renderToStaticMarkup(<Home />);

    expect(html).not.toContain('Helena');
    expect(html).not.toContain('garantimos');
    expect(html).toContain('não representa resultados ou métricas reais');
  });
});
