import Link from "next/link";

export default function TabLinks({ tabs }) {
  const index = Math.max(0, tabs.findIndex((t) => t.active));

  return (
    <div role="tablist" className="glass-strong relative grid max-w-md p-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 rounded-2xl bg-linear-to-r from-brand to-brand-sky transition-transform duration-300 motion-reduce:transition-none"
        style={{ width: `calc((100% - 0.5rem) / ${tabs.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {tabs.map((t) => (
        <Link key={t.label} href={t.href} role="tab" aria-selected={t.active} className={`relative z-10 flex h-11 items-center justify-center rounded-2xl text-sm font-semibold ${t.active ? "text-white" : "text-ink"}`}>
          {t.label}
        </Link>
      ))}
    </div>
  );
}
