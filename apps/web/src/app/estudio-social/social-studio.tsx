'use client';

import { toPng } from 'html-to-image';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';

import styles from './page.module.css';

type Theme = 'dark' | 'light' | 'coral';
type Visual =
  | 'leak'
  | 'inbox'
  | 'aftercare'
  | 'question'
  | 'diagnosis'
  | 'pipeline'
  | 'stage'
  | 'blindspot'
  | 'measure'
  | 'warning'
  | 'statement'
  | 'layers'
  | 'priorities'
  | 'plan'
  | 'transformation'
  | 'execution'
  | 'action-formula'
  | 'systems'
  | 'minimal'
  | 'next-action'
  | 'status-dead-end'
  | 'signal-action'
  | 'platform'
  | 'support'
  | 'accompaniment'
  | 'action-rail'
  | 'cycle';

type Slide = {
  title: string;
  body?: string;
  emphasis?: string;
  eyebrow?: string;
  label?: string;
  theme: Theme;
  visual: Visual;
};

type Post = {
  caption: string;
  id: string;
  week: string;
  number: string;
  format: 'Carrossel' | 'Estático';
  title: string;
  slides: Slide[];
};

const POSTS: Post[] = [
  {
    id: 'post-01',
    week: 'Semana 01',
    number: '01',
    format: 'Carrossel',
    title: 'Nem toda agenda vazia começa com falta de demanda.',
    caption: `Uma agenda com espaços não significa, automaticamente, que a clínica precise gerar mais contatos.

Parte das oportunidades pode estar se perdendo entre a primeira mensagem, o agendamento, a confirmação e o retorno.

Antes de aumentar o investimento em demanda, vale observar a jornada atual: onde as conversas param? O que acontece com cancelamentos e faltas? Quem acompanha cada próxima ação?

O primeiro passo é tornar essas perdas visíveis.

Sua clínica consegue responder o que acontece com as oportunidades que já chegam?

#GestãoDeClínicas #JornadaDoPaciente #PerformanceDaAgenda #Althion`,
    slides: [
      {
        title: 'Nem toda agenda vazia começa com falta de demanda.',
        emphasis: 'falta de demanda',
        eyebrow: 'O problema pode estar no percurso',
        theme: 'dark',
        visual: 'leak',
      },
      {
        title: 'Sua clínica pode receber contatos todos os dias',
        body: '— e ainda perder oportunidades entre a primeira conversa e o agendamento.',
        emphasis: 'perder oportunidades',
        eyebrow: 'A entrada existe. A conversão nem sempre.',
        theme: 'light',
        visual: 'inbox',
      },
      {
        title: 'Outras perdas acontecem depois.',
        body: 'Cancelamentos, faltas, ausência de follow-up e retornos que nunca acontecem.',
        emphasis: 'acontecem depois',
        eyebrow: 'A jornada não termina no agendamento',
        theme: 'coral',
        visual: 'aftercare',
      },
      {
        title: 'Antes de investir em mais demanda, existe uma pergunta importante:',
        body: 'o que acontece com as oportunidades que já chegam?',
        emphasis: 'o que acontece com as oportunidades que já chegam?',
        eyebrow: 'Pare. Observe. Pergunte.',
        theme: 'dark',
        visual: 'question',
      },
      {
        title: 'A Althion começa por aí:',
        body: 'entendendo onde a jornada está perdendo oportunidades.',
        emphasis: 'onde a jornada está perdendo oportunidades',
        eyebrow: 'Diagnóstico Althion',
        theme: 'light',
        visual: 'diagnosis',
      },
    ],
  },
  {
    id: 'post-02',
    week: 'Semana 01',
    number: '02',
    format: 'Estático',
    title: 'O que acontece com as oportunidades depois?',
    caption: `Receber oportunidades é apenas o início.

Entre o primeiro contato e o retorno existem várias passagens: atendimento, agendamento, confirmação, comparecimento e continuidade.

Quando uma dessas etapas não tem processo, responsável ou próxima ação, a oportunidade pode desaparecer da operação sem que ninguém perceba.

Em qual etapa da jornada sua clínica tem menos visibilidade hoje?

#GestãoDeClínicas #ExperiênciaDoPaciente #AgendaMédica #Althion`,
    slides: [
      {
        title: 'Sua clínica já recebe oportunidades.',
        body: 'O que acontece com elas depois?',
        emphasis: 'O que acontece com elas depois?',
        eyebrow: 'A jornada precisa ser visível',
        theme: 'dark',
        visual: 'pipeline',
      },
    ],
  },
  {
    id: 'post-03',
    week: 'Semana 01',
    number: '03',
    format: 'Carrossel',
    title: '4 lugares onde sua clínica pode perder oportunidades.',
    caption: `Nem toda perda é evidente. Muitas acontecem em pequenas interrupções da rotina.

1. O contato espera demais por uma resposta.
2. A conversa demonstra interesse, mas não avança para o agendamento.
3. Cancelamentos e faltas ficam sem retomada.
4. A gestão não consegue enxergar onde essas interrupções se concentram.

Identificar o ponto de perda é o que permite escolher a ação certa — e agir na ordem certa.

Qual desses quatro pontos merece mais atenção na sua clínica?

#OperaçãoDeClínicas #GestãoDeAtendimento #Conversão #Althion`,
    slides: [
      {
        title: '4 lugares onde sua clínica pode perder oportunidades sem perceber.',
        emphasis: '4 lugares',
        eyebrow: 'Mapeie os pontos de perda',
        theme: 'dark',
        visual: 'blindspot',
      },
      {
        title: 'Atendimento',
        body: 'O contato chega, mas demora para receber resposta ou não recebe direcionamento claro.',
        eyebrow: 'Ponto de perda 01',
        label: 'Tempo de resposta',
        theme: 'light',
        visual: 'stage',
      },
      {
        title: 'Conversão',
        body: 'Existe interesse, mas a conversa termina antes do agendamento.',
        eyebrow: 'Ponto de perda 02',
        label: 'Interesse sem próxima ação',
        theme: 'light',
        visual: 'stage',
      },
      {
        title: 'Continuidade',
        body: 'Cancelamentos, faltas e contatos sem resposta ficam sem próxima ação.',
        eyebrow: 'Ponto de perda 03',
        label: 'Jornada interrompida',
        theme: 'coral',
        visual: 'stage',
      },
      {
        title: 'Gestão',
        body: 'Quando ninguém consegue enxergar essas perdas, fica difícil saber onde agir primeiro.',
        emphasis: 'onde agir primeiro',
        eyebrow: 'Ponto de perda 04',
        label: 'Sem visibilidade',
        theme: 'dark',
        visual: 'stage',
      },
    ],
  },
  {
    id: 'post-04',
    week: 'Semana 02',
    number: '04',
    format: 'Carrossel',
    title: 'Antes de automatizar sua clínica, responda isso.',
    caption: `Automação amplifica o processo que já existe.

Se a jornada tem etapas pouco claras, dados dispersos ou contatos sem responsável, automatizar primeiro pode apenas fazer a desorganização acontecer mais rápido.

Antes da ferramenta, quatro respostas precisam estar visíveis:

— tempo até a primeira resposta;
— interesse que não vira agendamento;
— tratamento dado a cancelamentos e faltas;
— próxima ação para quem deixa de responder.

Quantas dessas respostas sua clínica consegue acompanhar hoje?

#Automação #GestãoDeClínicas #EficiênciaOperacional #Althion`,
    slides: [
      {
        title: 'Antes de automatizar sua clínica, responda estas 4 perguntas.',
        emphasis: '4 perguntas',
        eyebrow: 'Diagnosticar antes de acelerar',
        theme: 'dark',
        visual: 'measure',
      },
      {
        title: 'Quanto tempo um novo contato espera pela primeira resposta?',
        emphasis: 'Quanto tempo',
        eyebrow: 'Pergunta 01 · Atendimento',
        label: 'Primeira resposta',
        theme: 'light',
        visual: 'measure',
      },
      {
        title: 'Quantos demonstram interesse, mas não chegam ao agendamento?',
        emphasis: 'não chegam ao agendamento',
        eyebrow: 'Pergunta 02 · Conversão',
        label: 'Interesse × agendamento',
        theme: 'light',
        visual: 'measure',
      },
      {
        title: 'O que acontece com quem cancela, falta ou para de responder?',
        emphasis: 'O que acontece',
        eyebrow: 'Pergunta 03 · Continuidade',
        label: 'Próxima ação',
        theme: 'coral',
        visual: 'measure',
      },
      {
        title: 'Se essas respostas ainda não estão claras,',
        body: 'automatizar primeiro pode apenas acelerar um processo desorganizado.',
        emphasis: 'acelerar um processo desorganizado',
        eyebrow: 'Pergunta 04 · Decisão',
        theme: 'dark',
        visual: 'warning',
      },
    ],
  },
  {
    id: 'post-05',
    week: 'Semana 02',
    number: '05',
    format: 'Estático',
    title: 'Diagnóstico antes da tecnologia.',
    caption: `A pergunta mais importante não é “qual ferramenta devemos contratar?”.

É “onde a operação está perdendo oportunidades — e por quê?”.

Tecnologia faz sentido quando existe clareza sobre o problema, a prioridade, o processo e o resultado que precisa ser acompanhado.

Na Althion, o diagnóstico vem antes da tecnologia.

#DiagnósticoOperacional #TecnologiaParaClínicas #Gestão #Althion`,
    slides: [
      {
        title: 'Não começamos perguntando qual automação sua clínica precisa.',
        body: 'Começamos perguntando onde sua operação perde oportunidades.',
        emphasis: 'onde sua operação perde oportunidades',
        eyebrow: 'Uma escolha de método',
        label: 'Diagnóstico antes da tecnologia.',
        theme: 'light',
        visual: 'statement',
      },
    ],
  },
  {
    id: 'post-06',
    week: 'Semana 02',
    number: '06',
    format: 'Carrossel',
    title: 'O diagnóstico precisa mostrar onde agir.',
    caption: `Um diagnóstico útil não termina em uma lista de problemas.

Ele distingue sintomas de causas, mostra onde a jornada é interrompida, organiza prioridades e define quais indicadores precisam ser acompanhados.

O resultado precisa ser um plano compreensível:

o que fazer, por que fazer, quem será responsável e como medir a evolução.

Diagnóstico não é o fim do trabalho. É o ponto de partida para transformar a operação.

#Diagnóstico #GestãoDeClínicas #PlanoDeAção #Althion`,
    slides: [
      {
        title: 'Diagnóstico não é um relatório bonito.',
        body: 'É saber onde agir primeiro.',
        emphasis: 'onde agir primeiro',
        eyebrow: 'Da leitura à decisão',
        theme: 'dark',
        visual: 'diagnosis',
      },
      {
        title: 'Separar sintomas dos problemas que realmente interrompem a jornada.',
        emphasis: 'realmente interrompem a jornada',
        eyebrow: '01 · Distinguir',
        theme: 'light',
        visual: 'layers',
      },
      {
        title: 'Identificar perdas, prioridades e indicadores que ainda precisam ser estruturados.',
        emphasis: 'perdas, prioridades e indicadores',
        eyebrow: '02 · Priorizar',
        theme: 'coral',
        visual: 'priorities',
      },
      {
        title: 'Transformar informações dispersas em um plano claro de ação.',
        emphasis: 'plano claro de ação',
        eyebrow: '03 · Organizar',
        theme: 'light',
        visual: 'plan',
      },
      {
        title: 'Na Althion, o diagnóstico não é o fim.',
        body: 'É o começo da transformação da operação.',
        emphasis: 'começo da transformação',
        eyebrow: 'Diagnóstico Althion',
        theme: 'dark',
        visual: 'transformation',
      },
    ],
  },
  {
    id: 'post-07',
    week: 'Semana 03',
    number: '07',
    format: 'Carrossel',
    title: 'Diagnóstico sem execução vira apenas um relatório.',
    caption: `Descobrir uma perda não recupera uma oportunidade.

Depois do diagnóstico, cada prioridade precisa se transformar em ação, responsável, momento certo e acompanhamento.

É nessa passagem que atendimento, CRM, automação, relacionamento e dados deixam de funcionar como partes isoladas e passam a sustentar uma operação.

A tecnologia cria a infraestrutura. A execução orientada é o que aproxima a clínica da performance.

#Execução #CRMParaClínicas #PerformanceOperacional #Althion`,
    slides: [
      {
        title: 'Diagnóstico sem execução vira apenas um relatório.',
        emphasis: 'sem execução',
        eyebrow: 'Da identificação à execução',
        theme: 'dark',
        visual: 'execution',
      },
      {
        title: 'Saber que existem oportunidades sem follow-up não resolve o problema.',
        emphasis: 'não resolve o problema',
        eyebrow: 'Descoberta não é desfecho',
        label: 'Oportunidade identificada · sem próxima ação',
        theme: 'light',
        visual: 'status-dead-end',
      },
      {
        title: 'É preciso transformar a descoberta em:',
        body: 'ação + responsável + momento certo + acompanhamento.',
        emphasis: 'ação + responsável + momento certo + acompanhamento.',
        eyebrow: 'Execução estruturada',
        theme: 'light',
        visual: 'action-formula',
      },
      {
        title: 'É por isso que conectamos atendimento, CRM, automação, relacionamento e dados.',
        emphasis: 'conectamos',
        eyebrow: 'Uma operação, não ferramentas isoladas',
        theme: 'dark',
        visual: 'systems',
      },
      {
        title: 'A tecnologia é a infraestrutura.',
        body: 'Performance é o objetivo.',
        emphasis: 'Performance é o objetivo.',
        eyebrow: 'Princípio Althion',
        theme: 'light',
        visual: 'minimal',
      },
    ],
  },
  {
    id: 'post-08',
    week: 'Semana 03',
    number: '08',
    format: 'Estático',
    title: 'A tecnologia é o meio. Performance é o produto.',
    caption: `Software, CRM e automação são partes importantes da infraestrutura.

Mas o objetivo não é acumular ferramentas. É melhorar a capacidade da operação de responder, acompanhar, recuperar oportunidades e aprender com os resultados.

A tecnologia é o meio. Performance é o produto.

#Performance #Tecnologia #OperaçãoDeClínicas #Althion`,
    slides: [
      {
        title: 'A tecnologia é o meio.',
        body: 'Performance é o produto.',
        emphasis: 'Performance é o produto.',
        eyebrow: 'Althion · Tese 01',
        theme: 'dark',
        visual: 'minimal',
      },
    ],
  },
  {
    id: 'post-09',
    week: 'Semana 03',
    number: '09',
    format: 'Carrossel',
    title: 'Toda perda precisa virar uma próxima ação.',
    caption: `“Não respondeu”, “cancelou” e “faltou” descrevem o que aconteceu.

Mas um status, sozinho, não orienta a operação.

Cada sinal precisa ser avaliado para definir se existe uma oportunidade elegível, qual é a prioridade, quem deve agir e quando a retomada deve acontecer.

Quando a próxima ação fica clara, a jornada deixa de terminar no registro da perda.

Quais status ainda funcionam como ponto final na sua clínica?

#FollowUp #RecuperaçãoDeOportunidades #GestãoDeClínicas #Althion`,
    slides: [
      {
        title: 'Toda perda identificada precisa virar uma próxima ação.',
        emphasis: 'próxima ação',
        eyebrow: 'Sinal sem ação continua sendo perda',
        theme: 'dark',
        visual: 'next-action',
      },
      {
        title: 'Lead sem resposta ou conversa sem agendamento?',
        body: 'Pode existir uma oportunidade de follow-up.',
        emphasis: 'oportunidade de follow-up',
        eyebrow: 'Sinal 01 · Conversão',
        label: 'Retomar a conversa',
        theme: 'light',
        visual: 'next-action',
      },
      {
        title: 'Cancelamento ou falta?',
        body: 'Pode existir uma oportunidade de retomada.',
        emphasis: 'oportunidade de retomada',
        eyebrow: 'Sinal 02 · Continuidade',
        label: 'Criar nova passagem',
        theme: 'coral',
        visual: 'next-action',
      },
      {
        title: 'O problema é quando tudo termina apenas em um status:',
        body: '“não respondeu”, “cancelou”, “faltou”.',
        emphasis: '“não respondeu”, “cancelou”, “faltou”.',
        eyebrow: 'Status não é próxima ação',
        theme: 'light',
        visual: 'status-dead-end',
      },
      {
        title: 'A Althion transforma sinais da operação em',
        body: 'oportunidades, prioridades e próximas ações.',
        emphasis: 'oportunidades, prioridades e próximas ações.',
        eyebrow: 'Cartografia operacional',
        theme: 'dark',
        visual: 'signal-action',
      },
    ],
  },
  {
    id: 'post-10',
    week: 'Semana 04',
    number: '10',
    format: 'Carrossel',
    title: 'Plataforma sozinha não transforma uma operação.',
    caption: `Uma plataforma pode organizar dados, processos e alertas.

Ainda assim, alguém precisa interpretar o que é prioridade, acompanhar a execução, entender os desvios e ajustar o plano.

Por isso, a Althion combina tecnologia, inteligência operacional e acompanhamento especializado.

Não entregamos apenas acesso a uma ferramenta. Estruturamos uma operação acompanhada e orientada à evolução.

#TecnologiaParaClínicas #InteligênciaOperacional #Performance #Althion`,
    slides: [
      {
        title: 'Uma plataforma sozinha não transforma uma operação.',
        emphasis: 'sozinha',
        eyebrow: 'Tecnologia precisa de direção',
        theme: 'dark',
        visual: 'platform',
      },
      {
        title: 'Tecnologia organiza informações e processos.',
        emphasis: 'organiza',
        eyebrow: 'O papel da infraestrutura',
        theme: 'light',
        visual: 'systems',
      },
      {
        title:
          'Mas alguém ainda precisa interpretar prioridades, acompanhar a execução e entender o que precisa mudar.',
        emphasis: 'interpretar prioridades',
        eyebrow: 'Inteligência com responsabilidade',
        theme: 'light',
        visual: 'support',
      },
      {
        title: 'Por isso, a Althion combina',
        body: 'tecnologia + inteligência + acompanhamento especializado.',
        emphasis: 'tecnologia + inteligência + acompanhamento especializado.',
        eyebrow: 'Modelo Althion',
        theme: 'dark',
        visual: 'accompaniment',
      },
      {
        title: 'Você não recebe apenas acesso a uma plataforma.',
        body: 'Recebe uma operação acompanhada.',
        emphasis: 'Recebe uma operação acompanhada.',
        eyebrow: 'Da ferramenta ao resultado',
        theme: 'light',
        visual: 'accompaniment',
      },
    ],
  },
  {
    id: 'post-11',
    week: 'Semana 04',
    number: '11',
    format: 'Estático',
    title: 'Você não precisa de mais um dashboard.',
    caption: `Mais dados não significam, necessariamente, mais clareza.

Um dashboard só gera valor quando ajuda a responder:

— o que está sendo perdido;
— qual é a prioridade;
— quem precisa agir;
— qual resultado deve ser acompanhado.

Informação precisa terminar em decisão — e decisão precisa terminar em ação.

#Dados #GestãoDeClínicas #TomadaDeDecisão #Althion`,
    slides: [
      {
        title: 'Você não precisa de mais um dashboard.',
        body: 'Precisa saber o que fazer depois de olhar para ele.',
        emphasis: 'o que fazer depois',
        eyebrow: 'Informação precisa orientar decisão',
        theme: 'light',
        visual: 'action-rail',
      },
    ],
  },
  {
    id: 'post-12',
    week: 'Semana 04',
    number: '12',
    format: 'Carrossel',
    title: 'Como funciona a Althion.',
    caption: `A transformação da operação não acontece em uma única implantação.

Na Althion, ela funciona como um ciclo:

1. Diagnosticar onde a jornada perde oportunidades.
2. Estruturar processos, tecnologia, dados e responsáveis.
3. Recuperar oportunidades elegíveis com ações acompanhadas.
4. Evoluir a operação a partir dos resultados.

Performance é diagnóstico, ação, mensuração e melhoria contínua.

Quer descobrir onde sua clínica está perdendo oportunidades? Comece pelo diagnóstico da operação em althionops.com.br/diagnostico

#GestãoDeClínicas #PerformanceDaAgenda #DiagnósticoOperacional #Althion`,
    slides: [
      {
        title: 'Como a Althion funciona?',
        eyebrow: 'Um ciclo orientado à performance',
        theme: 'dark',
        visual: 'cycle',
      },
      {
        title: 'Diagnosticar',
        body: 'Identificamos onde a jornada administrativa está perdendo oportunidades.',
        emphasis: 'perdendo oportunidades',
        eyebrow: 'Etapa 01',
        label: 'Ler a operação',
        theme: 'light',
        visual: 'diagnosis',
      },
      {
        title: 'Estruturar',
        body: 'Organizamos tecnologia, processos, dados e responsáveis para melhorar a operação.',
        emphasis: 'tecnologia, processos, dados e responsáveis',
        eyebrow: 'Etapa 02',
        label: 'Conectar a execução',
        theme: 'light',
        visual: 'systems',
      },
      {
        title: 'Recuperar',
        body: 'Transformamos oportunidades elegíveis em ações e acompanhamos seus resultados.',
        emphasis: 'ações e acompanhamos seus resultados',
        eyebrow: 'Etapa 03',
        label: 'Ativar a próxima ação',
        theme: 'coral',
        visual: 'signal-action',
      },
      {
        title: 'Evoluir',
        body: 'Performance não é uma implantação. É um ciclo de diagnóstico, ação, mensuração e melhoria.',
        emphasis: 'ciclo de diagnóstico, ação, mensuração e melhoria.',
        eyebrow: 'Etapa 04 · Melhoria contínua',
        theme: 'dark',
        visual: 'cycle',
      },
    ],
  },
];

const INITIAL_POST = POSTS[0]!;

function RichText({ emphasis, text }: { emphasis: string | undefined; text: string }) {
  if (!emphasis || !text.includes(emphasis)) return <>{text}</>;
  const [before, after] = text.split(emphasis);
  return (
    <>
      {before}
      <strong>{emphasis}</strong>
      {after}
    </>
  );
}

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={styles.brand}>
      <img
        alt="Althion"
        height="48"
        src={`/brand/althion-lockup-${inverse ? 'negative' : 'ink'}.svg`}
        width="228"
      />
    </div>
  );
}

function Journey({ compact = false }: { compact?: boolean }) {
  const stages = [
    'Contato',
    'Atendimento',
    'Agendamento',
    'Confirmação',
    'Comparecimento',
    'Retorno',
  ];
  return (
    <div className={compact ? styles.journeyCompact : styles.journey}>
      {stages.map((stage, index) => (
        <div className={styles.journeyStage} key={stage}>
          <span aria-hidden="true" />
          <small>{String(index + 1).padStart(2, '0')}</small>
          <strong>{stage}</strong>
        </div>
      ))}
    </div>
  );
}

function VisualBlock({ slide, slideIndex }: { slide: Slide; slideIndex: number }) {
  const point = String(slideIndex + 1).padStart(2, '0');

  if (slide.visual === 'pipeline') return <Journey />;

  if (slide.visual === 'leak') {
    return (
      <div className={styles.leakVisual} aria-hidden="true">
        <div className={styles.leakTrack}>
          <span>Contatos</span>
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className={styles.leakDrop}>
          <i />
          <span>oportunidade perdida</span>
        </div>
        <div className={styles.leakTrack}>
          <span>Agenda</span>
          <i />
          <i />
          <i className={styles.emptyDot} />
          <i className={styles.emptyDot} />
        </div>
      </div>
    );
  }

  if (slide.visual === 'inbox') {
    return (
      <div className={styles.inboxVisual} aria-hidden="true">
        <div className={styles.inboxHeader}>
          <span>Novos contatos</span>
          <b>+12 hoje</b>
        </div>
        {[92, 74, 58].map((width, index) => (
          <div className={styles.messageRow} key={width}>
            <i />
            <span style={{ width: `${width}%` }} />
            <b>{index === 2 ? 'sem ação' : 'aberto'}</b>
          </div>
        ))}
        <div className={styles.routeBreak}>
          <span>primeira conversa</span>
          <i />
          <strong>agendamento</strong>
        </div>
      </div>
    );
  }

  if (slide.visual === 'aftercare') {
    return (
      <div className={styles.aftercareVisual} aria-hidden="true">
        {['Cancelamento', 'Falta', 'Sem follow-up', 'Retorno'].map((item, index) => (
          <div className={styles.lossCard} key={item}>
            <span>0{index + 1}</span>
            <strong>{item}</strong>
            <i />
          </div>
        ))}
      </div>
    );
  }

  if (slide.visual === 'question') {
    return (
      <div className={styles.questionVisual} aria-hidden="true">
        <span>?</span>
        <Journey compact />
      </div>
    );
  }

  if (slide.visual === 'diagnosis') {
    return (
      <div className={styles.diagnosisVisual} aria-hidden="true">
        <div className={styles.radarRing}>
          <i />
          <span>diagnóstico</span>
        </div>
        <div className={styles.diagnosisLines}>
          <i />
          <i />
          <i />
          <strong>ponto de ação</strong>
        </div>
      </div>
    );
  }

  if (slide.visual === 'blindspot') {
    return (
      <div className={styles.blindspotVisual} aria-hidden="true">
        {['Atendimento', 'Conversão', 'Continuidade', 'Gestão'].map((item, index) => (
          <div key={item}>
            <span>0{index + 1}</span>
            <strong>{item}</strong>
            <i />
          </div>
        ))}
      </div>
    );
  }

  if (slide.visual === 'stage') {
    return (
      <div className={styles.stageVisual} aria-hidden="true">
        <span className={styles.stageNumber}>{point}</span>
        <div className={styles.stageRoute}>
          <i />
          <i />
          <i className={styles.brokenStep} />
          <i />
        </div>
        <p>{slide.label}</p>
      </div>
    );
  }

  if (slide.visual === 'measure') {
    return (
      <div className={styles.measureVisual} aria-hidden="true">
        <span>{slideIndex === 0 ? '04' : point}</span>
        <div>
          <i />
          <i />
          <i />
          <i />
        </div>
        <p>{slide.label ?? 'perguntas antes da automação'}</p>
      </div>
    );
  }

  if (slide.visual === 'warning') {
    return (
      <div className={styles.warningVisual} aria-hidden="true">
        <div className={styles.tangledLines}>
          <i />
          <i />
          <i />
        </div>
        <span>automação</span>
        <div className={styles.fastLines}>
          <i />
          <i />
          <i />
        </div>
        <strong>processo desorganizado</strong>
      </div>
    );
  }

  if (slide.visual === 'statement') {
    return (
      <div className={styles.statementVisual} aria-hidden="true">
        <div>
          <span>01</span>
          <p>Automação</p>
          <i />
        </div>
        <div>
          <span>00</span>
          <p>Diagnóstico</p>
          <strong>começar aqui</strong>
        </div>
      </div>
    );
  }

  if (slide.visual === 'layers') {
    return (
      <div className={styles.layersVisual} aria-hidden="true">
        <div>
          <span>Sintoma</span>
          <strong>agenda vazia</strong>
        </div>
        <i />
        <div>
          <span>Problema</span>
          <strong>jornada interrompida</strong>
        </div>
      </div>
    );
  }

  if (slide.visual === 'priorities') {
    return (
      <div className={styles.prioritiesVisual} aria-hidden="true">
        {['Perdas', 'Prioridades', 'Indicadores'].map((item, index) => (
          <div key={item}>
            <span>0{index + 1}</span>
            <strong>{item}</strong>
            <i />
          </div>
        ))}
      </div>
    );
  }

  if (slide.visual === 'plan') {
    return (
      <div className={styles.planVisual} aria-hidden="true">
        <div className={styles.scattered}>
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <span>organizar</span>
        <div className={styles.actionPlan}>
          {['Prioridade', 'Responsável', 'Próxima ação'].map((item) => (
            <p key={item}>
              <i />
              {item}
            </p>
          ))}
        </div>
      </div>
    );
  }

  if (slide.visual === 'execution') {
    return (
      <div className={styles.executionVisual} aria-hidden="true">
        <div className={styles.reportBlock}>
          <span>Diagnóstico</span>
          <i />
          <i />
          <i />
        </div>
        <div className={styles.executionTrace}>
          <i />
          <strong>executar</strong>
        </div>
        <div className={styles.actionBlock}>
          <span>Próxima ação</span>
          <strong>Responsável definido</strong>
          <small>Momento certo · acompanhamento ativo</small>
        </div>
      </div>
    );
  }

  if (slide.visual === 'action-formula') {
    return (
      <div className={styles.actionFormula} aria-hidden="true">
        {['Ação', 'Responsável', 'Momento certo', 'Acompanhamento'].map((item, index) => (
          <div key={item}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <i />
            <strong>{item}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (slide.visual === 'systems') {
    return (
      <div className={styles.systemsVisual} aria-hidden="true">
        {['Atendimento', 'CRM', 'Automação', 'Relacionamento', 'Dados'].map((item, index) => (
          <div key={item}>
            <i className={index === 2 ? styles.systemFocus : ''} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  }

  if (slide.visual === 'minimal') {
    return (
      <div className={styles.minimalTrace} aria-hidden="true">
        <span>meio</span>
        <i />
        <strong>objetivo</strong>
      </div>
    );
  }

  if (slide.visual === 'next-action') {
    return (
      <div className={styles.nextActionVisual} aria-hidden="true">
        <div>
          <span>Sinal</span>
          <i />
        </div>
        <b>break</b>
        <div className={styles.nextActionTarget}>
          <span>Próxima ação</span>
          <strong>{slide.label ?? 'Definir passagem seguinte'}</strong>
        </div>
      </div>
    );
  }

  if (slide.visual === 'status-dead-end') {
    return (
      <div className={styles.statusDeadEnd} aria-hidden="true">
        {['não respondeu', 'cancelou', 'faltou'].map((item) => (
          <div key={item}>
            <span>{item}</span>
            <i />
          </div>
        ))}
        <strong>{slide.label ?? 'fim da jornada'}</strong>
      </div>
    );
  }

  if (slide.visual === 'signal-action') {
    return (
      <div className={styles.signalActionVisual} aria-hidden="true">
        {[
          ['Sinal', 'Oportunidade'],
          ['Impacto', 'Prioridade'],
          ['Decisão', 'Próxima ação'],
        ].map(([from, to]) => (
          <div key={from}>
            <span>{from}</span>
            <i />
            <strong>{to}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (slide.visual === 'platform') {
    return (
      <div className={styles.platformVisual} aria-hidden="true">
        <div>
          <span>Plataforma</span>
          <i />
          <i />
          <i />
        </div>
        <b>sozinha</b>
        <div>
          <span>Operação</span>
          <strong>transformação interrompida</strong>
        </div>
      </div>
    );
  }

  if (slide.visual === 'support') {
    return (
      <div className={styles.supportVisual} aria-hidden="true">
        {['Interpretar prioridades', 'Acompanhar a execução', 'Entender o que mudar'].map(
          (item, index) => (
            <div key={item}>
              <span>0{index + 1}</span>
              <strong>{item}</strong>
              <i />
            </div>
          ),
        )}
        <p>acompanhamento especializado</p>
      </div>
    );
  }

  if (slide.visual === 'accompaniment') {
    return (
      <div className={styles.accompanimentVisual} aria-hidden="true">
        {['Tecnologia', 'Inteligência', 'Acompanhamento'].map((item, index) => (
          <div key={item}>
            <i />
            <span>0{index + 1}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (slide.visual === 'action-rail') {
    return (
      <div className={styles.actionRail} aria-hidden="true">
        {['Perda', 'Prioridade', 'Ação', 'Responsável', 'Resultado'].map((item, index) => (
          <div key={item}>
            <i />
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (slide.visual === 'cycle') {
    return (
      <div className={styles.cycleVisual} aria-hidden="true">
        {['Diagnóstico', 'Ação', 'Mensuração', 'Melhoria'].map((item, index) => (
          <div key={item}>
            <span>0{index + 1}</span>
            <strong>{item}</strong>
            <i />
          </div>
        ))}
        <p>performance contínua</p>
      </div>
    );
  }

  return (
    <div className={styles.transformationVisual} aria-hidden="true">
      <div>
        <span>Diagnóstico</span>
        <i />
      </div>
      <strong>→</strong>
      <div>
        <span>Transformação</span>
        <i />
      </div>
    </div>
  );
}

function SlideCanvas({
  post,
  slide,
  slideIndex,
}: {
  post: Post;
  slide: Slide;
  slideIndex: number;
}) {
  const themeClass = {
    coral: styles.themeCoral,
    dark: styles.themeDark,
    light: styles.themeLight,
  }[slide.theme];

  return (
    <article
      className={`${styles.canvas} ${themeClass} ${slide.visual === 'minimal' ? styles.minimalCanvas : ''}`}
      data-export-canvas
    >
      <div className={styles.texture} />
      <header className={styles.slideHeader}>
        <Brand inverse={slide.theme === 'dark'} />
        <div className={styles.slideMeta}>
          <span>{post.week}</span>
          <strong>{post.number}</strong>
        </div>
      </header>

      <div className={styles.slideContent}>
        <div className={styles.copyBlock}>
          {slide.eyebrow && <p className={styles.eyebrow}>{slide.eyebrow}</p>}
          <h2>
            <RichText emphasis={slide.emphasis} text={slide.title} />
          </h2>
          {slide.body && (
            <p className={styles.body}>
              <RichText emphasis={slide.emphasis} text={slide.body} />
            </p>
          )}
        </div>
        <VisualBlock slide={slide} slideIndex={slideIndex} />
      </div>

      {slide.visual === 'statement' && <p className={styles.signature}>{slide.label}</p>}

      <footer className={styles.slideFooter}>
        <span>althionops.com.br</span>
        <div className={styles.progress}>
          {post.slides.map((_, index) => (
            <i className={index === slideIndex ? styles.activeProgress : ''} key={index} />
          ))}
        </div>
        <span>
          {String(slideIndex + 1).padStart(2, '0')} / {String(post.slides.length).padStart(2, '0')}
        </span>
      </footer>
    </article>
  );
}

function DownloadIcon() {
  return (
    <span aria-hidden="true" className={styles.downloadIcon}>
      ↓
    </span>
  );
}

export function SocialStudio() {
  const [activePostId, setActivePostId] = useState(INITIAL_POST.id);
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const activePost = POSTS.find((post) => post.id === activePostId) ?? INITIAL_POST;

  const exportNode = useCallback(async (node: HTMLElement, filename: string) => {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      canvasHeight: 1350,
      canvasWidth: 1080,
      height: 1350,
      pixelRatio: 1,
      skipAutoScale: true,
      width: 1080,
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }, []);

  const exportOne = useCallback(
    async (index: number) => {
      const node = galleryRef.current?.querySelectorAll<HTMLElement>('[data-export-canvas]')[index];
      if (!node) return;
      const key = `${activePost.id}-${index}`;
      setExporting(key);
      try {
        await exportNode(
          node,
          `althion-${activePost.id}-slide-${String(index + 1).padStart(2, '0')}.png`,
        );
      } finally {
        setExporting(null);
      }
    },
    [activePost, exportNode],
  );

  const exportAll = useCallback(async () => {
    const nodes = galleryRef.current?.querySelectorAll<HTMLElement>('[data-export-canvas]');
    if (!nodes) return;
    setExporting('all');
    try {
      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        if (!node) continue;
        await exportNode(
          node,
          `althion-${activePost.id}-slide-${String(index + 1).padStart(2, '0')}.png`,
        );
        await new Promise((resolve) => window.setTimeout(resolve, 180));
      }
    } finally {
      setExporting(null);
    }
  }, [activePost.id, exportNode]);

  const copyCaption = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(activePost.caption);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = activePost.caption;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }

    setCopiedCaptionId(activePost.id);
    window.setTimeout(() => {
      setCopiedCaptionId((current) => (current === activePost.id ? null : current));
    }, 1800);
  }, [activePost]);

  return (
    <main className={styles.studioShell}>
      <aside className={styles.sidebar}>
        <Brand />
        <nav aria-label="Estúdios Althion" className={styles.studioSwitch}>
          <Link aria-current="page" href="/estudio-social">
            Posts
          </Link>
          <Link href="/estudio-marca">Marca</Link>
        </nav>
        <div className={styles.sidebarIntro}>
          <span>Estúdio Social</span>
          <h1>Posts da campanha</h1>
          <p>44 peças em 1080 × 1350 px, organizadas em quatro semanas de conteúdo.</p>
        </div>
        <nav aria-label="Selecionar post" className={styles.postNav}>
          {POSTS.map((post) => (
            <button
              aria-current={post.id === activePost.id ? 'page' : undefined}
              className={post.id === activePost.id ? styles.activePost : ''}
              key={post.id}
              onClick={() => setActivePostId(post.id)}
              type="button"
            >
              <span>{post.number}</span>
              <div>
                <strong>Post {post.number}</strong>
                <small>
                  {post.format} · {post.slides.length}{' '}
                  {post.slides.length === 1 ? 'peça' : 'slides'}
                </small>
              </div>
            </button>
          ))}
        </nav>
        <p className={styles.sidebarNote}>
          Selecione um post, copie a legenda e exporte os slides em PNG.
        </p>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.workspaceHeader}>
          <div>
            <p>
              {activePost.week} · Post {activePost.number} · {activePost.format}
            </p>
            <h2>{activePost.title}</h2>
          </div>
          <button
            className={styles.exportAllButton}
            disabled={exporting !== null}
            onClick={exportAll}
            type="button"
          >
            <DownloadIcon />
            {exporting === 'all'
              ? 'Exportando…'
              : `Exportar ${activePost.slides.length === 1 ? 'PNG' : 'todos'}`}
          </button>
        </header>

        <section aria-labelledby="caption-title" className={styles.captionPanel}>
          <div className={styles.captionHeading}>
            <div>
              <p>Legenda pronta para publicar</p>
              <h3 id="caption-title">Texto editorial · Post {activePost.number}</h3>
            </div>
            <button onClick={copyCaption} type="button">
              {copiedCaptionId === activePost.id ? 'Legenda copiada' : 'Copiar legenda'}
            </button>
          </div>
          <p className={styles.captionText}>{activePost.caption}</p>
          <span aria-live="polite" className={styles.srOnly}>
            {copiedCaptionId === activePost.id
              ? 'Legenda copiada para a área de transferência.'
              : ''}
          </span>
        </section>

        <div className={styles.gallery} ref={galleryRef}>
          {activePost.slides.map((slide, index) => (
            <div className={styles.previewItem} key={`${activePost.id}-${index}`}>
              <div className={styles.previewTopbar}>
                <span>Slide {String(index + 1).padStart(2, '0')}</span>
                <button
                  disabled={exporting !== null}
                  onClick={() => exportOne(index)}
                  type="button"
                >
                  <DownloadIcon />
                  {exporting === `${activePost.id}-${index}` ? 'Gerando…' : 'PNG'}
                </button>
              </div>
              <div className={styles.previewFrame}>
                <div className={styles.previewScaler}>
                  <SlideCanvas post={activePost} slide={slide} slideIndex={index} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
