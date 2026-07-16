export default function PortalLoading() {
  return (
    <main className="portal-main" aria-busy="true" aria-live="polite">
      <div className="skeleton title" />
      <div className="skeleton card" />
      <span className="sr-only">Carregando seu ambiente…</span>
    </main>
  );
}
