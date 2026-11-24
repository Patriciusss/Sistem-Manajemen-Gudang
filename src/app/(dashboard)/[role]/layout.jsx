import { requireUser } from "@/lib/session";
import DashboardNav from "@/components/layout/DashboardNav";
import Icon from "@/components/ui/Icon";
import ToastHost from "@/components/ui/ToastHost";
import { btn } from "@/components/ui/styles";

const NAV = {
  admin: [["", "Dashboard", "home"], ["/products", "Products", "box"], ["/categories", "Categories", "tag"], ["/transactions", "Transactions", "swap"], ["/suppliers", "Suppliers", "shield"], ["/users", "Users", "users"]],
  manager: [["", "Dashboard", "home"], ["/products", "Products", "box"], ["/categories", "Categories", "tag"], ["/transactions", "Transactions", "swap"], ["/restock", "Restock", "truck"]],
  staff: [["", "Dashboard", "home"], ["/products", "Products", "box"], ["/transactions", "Transactions", "swap"], ["/restock", "Restock", "truck"]],
  supplier: [["", "Dashboard", "home"], ["/restock", "Restock", "truck"]],
};

function SignOut({ className }) {
  return (
    <form action="/api/logout" method="post" className={className}>
      <button className={`${btn.secondary} w-full`}>
        <Icon name="logout" />
        Sign out
      </button>
    </form>
  );
}

export default async function DashboardLayout({ children, params }) {
  const { role } = await params;
  const user = await requireUser([role]);
  const items = NAV[user.role].map(([path, label, icon]) => ({ href: `/${user.role}${path}`, label, icon }));

  return (
    <div className="dash min-h-screen md:grid md:grid-cols-[15.5rem_1fr]">
      <div className="mesh" aria-hidden="true">
        <i className="blob blob-a" />
        <i className="blob blob-b" />
        <i className="blob blob-c" />
      </div>
      <aside className="glass m-3 flex flex-col gap-3 p-3 md:sticky md:top-3 md:h-[calc(100vh-1.5rem)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 px-1">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-brand to-brand-sky text-white">
              <Icon name="box" className="h-6 w-6" />
            </span>
            <span className="text-lg font-bold tracking-tight">Warehouse</span>
          </div>
          <SignOut className="md:hidden" />
        </div>
        <div className="rounded-xl bg-white/60 px-3 py-2 text-sm">
          <p className="truncate font-semibold">{user.name}</p>
          <p className="text-ink-soft capitalize">{user.role}</p>
        </div>
        <DashboardNav items={items} />
        <SignOut className="hidden md:mt-auto md:block" />
      </aside>
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 md:p-8">{children}</main>
      <ToastHost />
    </div>
  );
}
