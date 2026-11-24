import Link from "next/link";
import { btn } from "@/components/ui/styles";

export default function EmptyState({ title, text, href, action }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <svg viewBox="0 0 120 100" className="h-24 w-28" aria-hidden="true">
        <ellipse cx="60" cy="90" rx="38" ry="6" fill="#99f6e4" opacity="0.6" />
        <path d="M20 40 60 22l40 18v36L60 94 20 76z" fill="#5eead4" />
        <path d="M20 40l40 18v36L20 76z" fill="#2dd4bf" />
        <path d="M100 40 60 58v36l40-18z" fill="#7dd3fc" />
        <path d="M20 40 60 22l40 18-40 18z" fill="#ccfbf1" />
        <path d="M42 31 82 49" stroke="#a5b4fc" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <p className="font-semibold">{title}</p>
      {text && <p className="max-w-xs text-sm text-ink-soft">{text}</p>}
      {href && (
        <Link href={href} className={`${btn.primary} mt-2`}>
          {action}
        </Link>
      )}
    </div>
  );
}
