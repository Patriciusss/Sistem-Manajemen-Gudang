"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

export default function DashboardNav({ items }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {items.map(({ href, label, icon }, index) => {
        const active = index === 0 ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 text-sm transition-colors motion-reduce:transition-none ${
              active ? "bg-linear-to-r from-brand/20 to-brand-sky/20 font-bold text-deep ring-1 ring-brand/30" : "font-medium text-ink hover:bg-white/70"
            }`}
          >
            <Icon name={icon} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
