import { requireUser } from "@/lib/session";
import DashboardNav from "@/components/layout/DashboardNav";
import { btn } from "@/components/ui/styles";

const NAV = {
  admin: [["", "Dashboard"], ["/products", "Products"], ["/categories", "Categories"], ["/transactions", "Transactions"], ["/suppliers", "Suppliers"], ["/users", "Users"]],
  manager: [["", "Dashboard"], ["/products", "Products"], ["/categories", "Categories"], ["/transactions", "Transactions"], ["/restock", "Restock"]],
  staff: [["", "Dashboard"], ["/products", "Products"], ["/transactions", "Transactions"]],
  supplier: [["", "Dashboard"], ["/restock", "Restock"]],
};

export default async function DashboardLayout({ children, params }) {
  const { role } = await params;
  const user = await requireUser([role]);
  const items = NAV[user.role].map(([path, label]) => ({ href: `/${user.role}${path}`, label }));

  return (
    <div className="min-h-screen md:grid md:grid-cols-[14rem_1fr]">
      <aside className="space-y-2 border-b border-border bg-card p-3 md:sticky md:top-0 md:h-screen md:space-y-4 md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-3">
          <span className="px-1 font-semibold tracking-tight">Warehouse</span>
          <form action="/api/logout" method="post">
            <button className={btn.secondary}>Sign out</button>
          </form>
        </div>
        <p className="px-1 text-sm text-muted-foreground">
          {user.name} <span className="capitalize">({user.role})</span>
        </p>
        <DashboardNav items={items} />
      </aside>
      <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
