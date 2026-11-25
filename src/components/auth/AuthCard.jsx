import Icon from "@/components/ui/Icon";

export default function AuthCard({ title, subtitle, onSubmit, footer, children }) {
  return (
    <form onSubmit={onSubmit} className="glass-strong rise flex w-full max-w-md flex-col justify-center space-y-5 p-6 sm:p-8">
      <div className="flex items-center gap-2.5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-brand to-brand-sky text-white">
          <Icon name="box" className="h-6 w-6" />
        </span>
        <span className="text-lg font-bold tracking-tight">Warehouse</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>
      </div>
      {children}
      <p className="text-center text-sm text-ink-soft">{footer}</p>
    </form>
  );
}
