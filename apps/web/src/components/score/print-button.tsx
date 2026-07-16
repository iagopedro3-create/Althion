'use client';

export function PrintButton() {
  return (
    <button className="primary-button no-print" onClick={() => window.print()} type="button">
      Imprimir ou salvar em PDF
    </button>
  );
}
