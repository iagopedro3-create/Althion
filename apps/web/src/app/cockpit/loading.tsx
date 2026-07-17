export default function CockpitLoading() {
  return (
    <main className="portal-main" aria-busy="true" aria-live="polite">
      <div className="skeleton title" />
      <div className="skeleton card" />
      <span className="sr-only">Carregando a carteira…</span>
    </main>
  );
}
