import Link from "next/link";
import { btn } from "@/components/ui/styles";

export default function Pagination({ page, pages, total, noun, hrefFor }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft">
      <span>
        {total} {noun}, page {page} of {pages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={hrefFor(page - 1)} className={btn.secondary}>
            Previous
          </Link>
        )}
        {page < pages && (
          <Link href={hrefFor(page + 1)} className={btn.secondary}>
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
