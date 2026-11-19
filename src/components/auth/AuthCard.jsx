export default function AuthCard({ title, subtitle, onSubmit, footer, children }) {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5 rounded-xl border border-border bg-card p-6 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
      <p className="text-center text-sm text-muted-foreground">{footer}</p>
    </form>
  );
}