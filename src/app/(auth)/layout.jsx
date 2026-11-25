import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Icon from "@/components/ui/Icon";
import AuthGrid from "@/components/auth/AuthGrid";

const BENEFITS = [
  ["box", "Live stock status", "Every product is badged Out of Stock, Severe, Low, or Normal automatically."],
  ["check", "Approvals in one step", "Managers approve goods in and out, and stock updates together with the status."],
  ["truck", "Restock you can follow", "Orders to suppliers are tracked from Pending to Received."],
];

export default async function AuthLayout({ children }) {
  const user = await getSession();
  if (user) redirect(`/${user.role}`);

  return (
    <div className="dash relative min-h-screen overflow-x-clip">
      <div className="mesh" aria-hidden="true">
        <i className="blob blob-a" />
        <i className="blob blob-b" />
        <i className="blob blob-c" />
      </div>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 sm:px-6">
        <Link href="/" className="inline-flex h-11 items-center gap-2 self-start font-semibold text-deep underline-offset-4 hover:underline">
          <Icon name="arrow" className="h-4 w-4 rotate-180" />
          Back to home
        </Link>
        <AuthGrid
          aside={
            <aside className="glass rise flex w-full flex-col justify-center p-8">
              <h2 className="text-3xl font-bold tracking-tight">Warehouse stock, under control.</h2>
              <ul className="mt-8 space-y-6">
                {BENEFITS.map(([icon, title, text]) => (
                  <li key={title} className="flex gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/70">
                      <Icon name={icon} className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="mt-0.5 text-sm text-ink-soft">{text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          }
        >
          {children}
        </AuthGrid>
      </div>
    </div>
  );
}
