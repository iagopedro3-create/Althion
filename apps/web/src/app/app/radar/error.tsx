'use client';

export default function RadarError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <main className="portal-main">
      <section className="state-card danger" role="alert">
        <h1>Não foi possível abrir o Radar</h1>
        <p>Nenhum dado foi perdido. Tente carregar novamente.</p>
        <button onClick={reset} type="button">
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
