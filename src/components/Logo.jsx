// Direction A "Route N" (placeholder until a final logo is chosen).
export function Mark({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M10 40V10L38 40V18" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="38" cy="9" r="5.5" fill="#D9A21B" />
    </svg>
  );
}

export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight ${className}`}>
      <Mark />
      Netryk
    </span>
  );
}
