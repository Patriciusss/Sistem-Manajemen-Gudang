const COLORS = { "Out of Stock": "#64748b", Severe: "#dc2626", Low: "#ca8a04", Normal: "#16a34a" };
const R = 52;
const CIRCLE = 2 * Math.PI * R;

const tick = (fraction) => {
  const angle = -Math.PI / 2 + fraction * 2 * Math.PI;
  const at = (radius) => [70 + radius * Math.cos(angle), 70 + radius * Math.sin(angle)];
  const [x1, y1] = at(44);
  const [x2, y2] = at(62);
  return { x1, y1, x2, y2 };
};

export default function StockRing({ stock, minStock, lowStock, unit, status }) {
  const full = Math.max(lowStock * 2, stock, 1);
  const fraction = Math.min(1, stock / full);

  return (
    <figure className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 140 140" className="h-40 w-40" role="img" aria-label={`Stock ${stock} ${unit}, severe at ${minStock}, low at ${lowStock}`}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="#0b2536" strokeOpacity="0.12" strokeWidth="12" />
        <g className="ring-in" style={{ transformOrigin: "70px 70px" }}>
          <circle cx="70" cy="70" r={R} fill="none" stroke={COLORS[status]} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${CIRCLE * fraction} ${CIRCLE}`} transform="rotate(-90 70 70)" />
        </g>
        {[minStock, lowStock].map((value) => (
          <line key={value} {...tick(Math.min(1, value / full))} stroke="#0b2536" strokeWidth="2" strokeLinecap="round" />
        ))}
        <text x="70" y="70" textAnchor="middle" fontSize="26" fontWeight="700" fill="#0b2536">
          {stock}
        </text>
        <text x="70" y="90" textAnchor="middle" fontSize="12" fill="#2f4a5c">
          {unit}
        </text>
      </svg>
      <figcaption className="text-xs text-ink-soft">
        Ticks: Severe at {minStock}, Low at {lowStock}
      </figcaption>
    </figure>
  );
}
