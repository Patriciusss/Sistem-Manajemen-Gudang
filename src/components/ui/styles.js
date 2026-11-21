const base =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

export const btn = {
  primary: `${base} bg-accent text-on-accent hover:brightness-95`,
  secondary: `${base} border border-input bg-card text-foreground hover:bg-muted`,
  danger: `${base} border border-destructive bg-card text-destructive hover:bg-muted`,
};

export const inputClass =
  "h-11 w-full rounded-lg border border-input bg-card px-3 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 motion-reduce:transition-none";
