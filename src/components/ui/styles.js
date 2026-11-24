const base =
  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export const btn = {
  primary: `${base} bg-linear-to-r from-brand to-brand-sky text-white shadow-md shadow-brand/25`,
  secondary: `${base} border border-ink-soft/50 bg-white/70 text-ink hover:bg-white/95`,
  danger: `${base} border border-red-700 bg-white/70 text-red-700 hover:bg-white/95`,
};

export const inputClass =
  "h-11 w-full rounded-xl border border-ink-soft/70 bg-white/80 px-3 text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-brand focus:ring-2 focus:ring-brand/30 motion-reduce:transition-none";

export const th = "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft";
export const td = "px-4 py-3 align-middle";
export const row = "border-t border-ink/10 transition-colors hover:bg-white/60";
export const link = "font-semibold text-deep underline underline-offset-2";
