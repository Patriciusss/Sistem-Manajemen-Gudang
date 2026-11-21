"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav({ items }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {items.map(({ href, label }, index) => {
        const active = index === 0 ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex h-11 items-center whitespace-nowrap rounded-lg px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none ${
              active ? "bg-muted font-semibold text-foreground" : "font-medium text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
