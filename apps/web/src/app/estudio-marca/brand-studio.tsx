'use client';

import { toPng } from 'html-to-image';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';

import styles from './page.module.css';

type HighlightKind =
  'diagnostico' | 'jornada' | 'performance' | 'recuperacao' | 'metodo' | 'althion';

type Highlight = {
  filename: string;
  kind: HighlightKind;
  label: string;
  note: string;
  theme: 'ink' | 'ivory';
};

const HIGHLIGHTS: Highlight[] = [
  {
    filename: 'destaque-diagnostico.png',
    kind: 'diagnostico',
    label: 'Diagnóstico',
    note: 'Evidência enquadrada',
    theme: 'ink',
  },
  {
    filename: 'destaque-jornada.png',
    kind: 'jornada',
    label: 'Jornada',
    note: 'Passagens visíveis',
    theme: 'ivory',
  },
  {
    filename: 'destaque-performance.png',
    kind: 'performance',
    label: 'Performance',
    note: 'Evolução acompanhada',
    theme: 'ink',
  },
  {
    filename: 'destaque-recuperacao.png',
    kind: 'recuperacao',
    label: 'Recuperação',
    note: 'Break vira passagem',
    theme: 'ivory',
  },
  {
    filename: 'destaque-metodo.png',
    kind: 'metodo',
    label: 'Método',
    note: 'Diagnóstico até ação',
    theme: 'ink',
  },
  {
    filename: 'destaque-althion.png',
    kind: 'althion',
    label: 'Althion',
    note: 'Assinatura institucional',
    theme: 'ivory',
  },
];

const DOWNLOADS = [
  {
    description: 'Uso padrão sobre fundos claros',
    file: '/brand/official/svg/althion-lockup-ink.svg',
    label: 'Logo horizontal · Ink',
  },
  {
    description: 'Uso sobre Althion Ink e superfícies escuras',
    file: '/brand/official/svg/althion-lockup-negative.svg',
    label: 'Logo horizontal · Negativo',
  },
  {
    description: 'Perfil principal para Instagram, LinkedIn e X',
    file: '/brand/official/png/avatar-forest-1080.png',
    label: 'Avatar Forest · 1080',
  },
  {
    description: 'Alternativa para interfaces de fundo escuro',
    file: '/brand/official/png/avatar-ivory-1080.png',
    label: 'Avatar Ivory · 1080',
  },
  {
    description: 'Compartilhamento em site, WhatsApp e LinkedIn',
    file: '/brand/official/png/og-image-1200x630.png',
    label: 'Open Graph · 1200 × 630',
  },
  {
    description: 'Capa institucional para página do LinkedIn',
    file: '/brand/official/png/linkedin-cover-1128x191.png',
    label: 'Capa LinkedIn · 1128 × 191',
  },
] as const;

function BrandLockup({ inverse = false }: { inverse?: boolean }) {
  return (
    <img
      alt="Althion"
      height="48"
      src={`/brand/official/svg/althion-lockup-${inverse ? 'negative' : 'ink'}.svg`}
      width="228"
    />
  );
}

function HighlightGlyph({ kind, theme }: { kind: HighlightKind; theme: Highlight['theme'] }) {
  if (kind === 'althion') {
    return (
      <img
        alt=""
        className={styles.symbolGlyph}
        src={`/brand/official/svg/althion-symbol-${theme === 'ink' ? 'negative' : 'ink'}.svg`}
      />
    );
  }

  if (kind === 'diagnostico') {
    return (
      <div className={styles.diagnosisGlyph}>
        <i />
        <i />
        <span />
      </div>
    );
  }

  if (kind === 'jornada') {
    return (
      <div className={styles.journeyGlyph}>
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    );
  }

  if (kind === 'performance') {
    return (
      <div className={styles.performanceGlyph}>
        <i />
        <i />
        <i />
        <span />
      </div>
    );
  }

  if (kind === 'recuperacao') {
    return (
      <div className={styles.recoveryGlyph}>
        <i />
        <i />
        <span />
        <i />
      </div>
    );
  }

  return (
    <div className={styles.methodGlyph}>
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

function HighlightCanvas({ highlight }: { highlight: Highlight }) {
  const inverse = highlight.theme === 'ink';
  return (
    <article
      className={`${styles.highlightCanvas} ${inverse ? styles.highlightInk : styles.highlightIvory}`}
      data-highlight-canvas
      data-highlight-filename={highlight.filename}
    >
      <div className={styles.highlightGrid} />
      <header>
        <BrandLockup inverse={inverse} />
      </header>
      <div className={styles.highlightCenter}>
        <div className={styles.highlightSafeCircle}>
          <HighlightGlyph kind={highlight.kind} theme={highlight.theme} />
        </div>
        <h2>{highlight.label}</h2>
        <p>{highlight.note}</p>
      </div>
      <footer>
        <span>Cartografia operacional</span>
        <i />
        <span>Althion</span>
      </footer>
    </article>
  );
}

export function BrandStudio() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const exportNode = useCallback(async (node: HTMLElement, filename: string) => {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      canvasHeight: 1920,
      canvasWidth: 1080,
      height: 1920,
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
      const node =
        galleryRef.current?.querySelectorAll<HTMLElement>('[data-highlight-canvas]')[index];
      const highlight = HIGHLIGHTS[index];
      if (!node || !highlight) return;
      setExporting(highlight.filename);
      try {
        await exportNode(node, highlight.filename);
      } finally {
        setExporting(null);
      }
    },
    [exportNode],
  );

  const exportAll = useCallback(async () => {
    const nodes = galleryRef.current?.querySelectorAll<HTMLElement>('[data-highlight-canvas]');
    if (!nodes) return;
    setExporting('all');
    try {
      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index];
        const highlight = HIGHLIGHTS[index];
        if (!node || !highlight) continue;
        await exportNode(node, highlight.filename);
        await new Promise((resolve) => window.setTimeout(resolve, 180));
      }
    } finally {
      setExporting(null);
    }
  }, [exportNode]);

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <BrandLockup />
        <nav aria-label="Estúdios Althion">
          <Link href="/estudio-social">Posts</Link>
          <Link aria-current="page" href="/estudio-marca">
            Marca
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <p>Estúdio de marca</p>
          <h1>Identidade pronta para ocupar cada superfície.</h1>
        </div>
        <p>
          Vetores oficiais preservados, avatares em alta resolução e seis capas de destaque
          construídas com a gramática visual da Althion.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span>01</span>
            <h2>Logo e aplicações oficiais</h2>
          </div>
          <p>
            Use SVG sempre que a plataforma aceitar. PNG apenas quando o bitmap for obrigatório.
          </p>
        </div>

        <div className={styles.logoShowcase}>
          <div className={styles.logoLight}>
            <BrandLockup />
          </div>
          <div className={styles.logoDark}>
            <BrandLockup inverse />
          </div>
        </div>

        <div className={styles.downloadGrid}>
          {DOWNLOADS.map((asset) => (
            <a download href={asset.file} key={asset.file}>
              <div>
                <strong>{asset.label}</strong>
                <span>{asset.description}</span>
              </div>
              <b>Baixar</b>
            </a>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span>02</span>
            <h2>Avatares para redes sociais</h2>
          </div>
          <p>
            Forest é o avatar padrão. Ivory funciona como alternativa quando a plataforma já usa
            fundo escuro.
          </p>
        </div>
        <div className={styles.avatarGrid}>
          <figure>
            <img
              alt="Avatar Althion sobre fundo Forest"
              src="/brand/official/png/avatar-forest-1080.png"
            />
            <figcaption>
              <strong>Forest</strong>
              <span>Uso principal</span>
            </figcaption>
          </figure>
          <figure>
            <img
              alt="Avatar Althion sobre fundo Ivory"
              src="/brand/official/png/avatar-ivory-1080.png"
            />
            <figcaption>
              <strong>Ivory</strong>
              <span>Uso alternativo</span>
            </figcaption>
          </figure>
          <div className={styles.avatarRules}>
            <span>Área de proteção</span>
            <strong>1 node livre</strong>
            <span>Redução mínima</span>
            <strong>16 px com variante micro</strong>
            <span>Tratamento</span>
            <strong>Sem sombra, glow ou distorção</strong>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span>03</span>
            <h2>Destaques do Instagram</h2>
          </div>
          <button disabled={exporting !== null} onClick={exportAll} type="button">
            {exporting === 'all' ? 'Exportando…' : 'Exportar todos em PNG'}
          </button>
        </div>
        <p className={styles.highlightNote}>
          Arquivos em 1080 × 1920. O símbolo principal permanece centralizado na área segura do
          recorte circular.
        </p>
        <div className={styles.highlightGallery} ref={galleryRef}>
          {HIGHLIGHTS.map((highlight, index) => (
            <div className={styles.highlightCard} key={highlight.filename}>
              <div className={styles.highlightCardHeader}>
                <div>
                  <strong>{highlight.label}</strong>
                  <span>{highlight.note}</span>
                </div>
                <button
                  data-export-highlight={highlight.filename}
                  disabled={exporting !== null}
                  onClick={() => exportOne(index)}
                  type="button"
                >
                  {exporting === highlight.filename ? 'Gerando…' : 'PNG'}
                </button>
              </div>
              <div className={styles.highlightPreview}>
                <div className={styles.highlightScaler}>
                  <HighlightCanvas highlight={highlight} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
