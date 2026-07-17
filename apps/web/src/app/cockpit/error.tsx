'use client';

export default function CockpitError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <main className="portal-main">
      <section className="state-card danger" role="alert">
        <h1>Não foi possível carregar o Cockpit</h1>
        <p>Tente novamente. Se o problema persistir, informe o suporte sem compartilhar dados.</p>
        <button onClick={reset} type="button">
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
