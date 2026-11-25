import { btn } from "@/components/ui/styles";

export default function Button({ loading = false, disabled, className = "", children, ...props }) {
  return (
    <button disabled={disabled || loading} aria-busy={loading} className={`${btn.primary} w-full ${className}`} {...props}>
      {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />}
      {children}
    </button>
  );
}
