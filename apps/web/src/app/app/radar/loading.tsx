export default function RadarLoading() {
  return (
    <main aria-busy="true" className="portal-main">
      <span className="sr-only">Carregando Radar</span>
      <div className="skeleton title" />
      <div className="skeleton card" />
      <div className="skeleton card" />
    </main>
  );
}
