import Link from "next/link";
import { link } from "@/components/ui/styles";

export default function Section({ title, href, linkLabel = "View all", index = 0, className = "", children }) {
  return (
    <section style={{ "--i": index }} className={`glass-strong rise p-4 sm:p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {href && (
          <Link href={href} className={`${link} text-sm`}>
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
