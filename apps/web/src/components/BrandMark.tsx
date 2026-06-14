// Marca Emprendedos: dos barras ascendentes ("dos" + crecimiento).
export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6.6" y="12" width="4.4" height="7" rx="1.3" fill="#fa4a28" />
      <rect x="13" y="7.4" width="4.4" height="11.6" rx="1.3" fill="#07a86c" />
    </svg>
  );
}
