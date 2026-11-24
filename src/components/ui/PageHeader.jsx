export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="rise flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-ink-soft">{subtitle}</p>}
        <div className="mt-2 h-1 w-14 rounded-full bg-linear-to-r from-brand to-brand-sky" />
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}
