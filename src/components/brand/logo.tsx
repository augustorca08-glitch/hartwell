/**
 * Identidad tipográfica de HARTWELL.
 * Wordmark: versales de Cormorant Garamond con tracking amplio.
 * Monograma: H y W entrelazadas dentro de un óvalo de doble filete. Una sola tinta (currentColor),
 * pensado para bordarse, estamparse o grabarse. Archivos fuente en /public/assets/hartwell/logo.
 */

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span translate="no" className={`inline-block font-serif font-semibold uppercase leading-none tracking-[0.3em] [margin-right:-0.3em] ${className}`}>
      Hartwell
    </span>
  );
}

export function Monogram({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title} fill="none" stroke="currentColor">
      <ellipse cx="50" cy="50" rx="45" ry="47.5" strokeWidth="1.6" />
      <ellipse cx="50" cy="50" rx="41" ry="43.5" strokeWidth="0.6" />
      <g fill="currentColor" stroke="none">
        <rect x="31" y="28" width="6" height="44" />
        <rect x="63" y="28" width="6" height="44" />
        <rect x="37" y="48" width="26" height="2.4" />
        <rect x="27.5" y="27" width="13" height="1.8" />
        <rect x="27.5" y="71.2" width="13" height="1.8" />
        <rect x="59.5" y="27" width="13" height="1.8" />
        <rect x="59.5" y="71.2" width="13" height="1.8" />
      </g>
      <polyline points="23,28 37,72 50,37 63,72 77,28" strokeWidth="2.2" />
      <path d="M19 27.9h8M73 27.9h8" strokeWidth="1.6" />
    </svg>
  );
}

/** Sello circular con leyenda: confirmaciones, packaging, cierre de página. */
export function Seal({ className = "", legend = "HARTWELL · EST. 1931 · HARTWELL · EST. 1931 · " }: { className?: string; legend?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden fill="none" stroke="currentColor">
      <defs>
        <path id="seal-path" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
      </defs>
      <circle cx="100" cy="100" r="96" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="62" strokeWidth="0.8" />
      <text fill="currentColor" stroke="none" fontSize="13.5" letterSpacing="3.2" fontFamily="var(--font-serif)" fontWeight="600">
        <textPath href="#seal-path">{legend}</textPath>
      </text>
      <g transform="translate(64 62) scale(0.72)">
        <g fill="currentColor" stroke="none">
          <rect x="31" y="28" width="6" height="44" />
          <rect x="63" y="28" width="6" height="44" />
          <rect x="37" y="48" width="26" height="2.4" />
          <rect x="27.5" y="27" width="13" height="1.8" />
          <rect x="27.5" y="71.2" width="13" height="1.8" />
          <rect x="59.5" y="27" width="13" height="1.8" />
          <rect x="59.5" y="71.2" width="13" height="1.8" />
        </g>
        <polyline points="23,28 37,72 50,37 63,72 77,28" strokeWidth="2.2" />
        <path d="M19 27.9h8M73 27.9h8" strokeWidth="1.6" />
      </g>
    </svg>
  );
}
