import Link from "next/link";
import { getSession } from "@/lib/session";
import Icon from "@/components/ui/Icon";
import GlowCard from "@/components/ui/GlowCard";
import Timeline from "@/components/ui/Timeline";
import StockBadge from "@/components/ui/StockBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import CountUp from "@/components/ui/CountUp";
import { btn } from "@/components/ui/styles";

const ROLES = [
  ["Admin", "shield", "bg-tone-teal", ["Approve or reject new suppliers", "Manage products and categories", "Watch inventory value and alerts"]],
  ["Manager", "check", "bg-tone-sky", ["Approve goods in and out", "Create restock orders", "Review delivery inspections"]],
  ["Staff", "box", "bg-tone-mint", ["Record goods in and out", "Inspect arriving deliveries", "Mark orders as Shipped"]],
  ["Supplier", "truck", "bg-tone-cyan", ["Confirm or reject orders", "Mark orders In Transit", "See your delivery history"]],
];

const STOCK = [
  ["Out of Stock", "Stock is 0."],
  ["Severe", "Stock is at or below the minimum."],
  ["Low", "Stock is at or below the low limit."],
  ["Normal", "Stock is above the low limit."],
];

const NUMBERS = [
  [4, "User roles"],
  [4, "Stock statuses"],
  [5, "Restock stages"],
  [3, "Outgoing steps"],
];

const MOCK_ROWS = [
  ["Keyboard", "w-[85%]", "bg-tone-green"],
  ["Monitor", "w-[45%]", "bg-tone-yellow"],
  ["Cable", "w-[18%]", "bg-tone-red"],
  ["Adapter", "w-[4%]", "bg-tone-gray"],
];

function Heading({ title, text }) {
  return (
    <div className="mb-8 max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-2 text-ink-soft">{text}</p>
    </div>
  );
}

function MockDashboard() {
  return (
    <div className="glass-strong rise p-4 sm:p-5" style={{ "--i": 3 }} aria-hidden="true">
      <div className="flex gap-1.5">
        <i className="h-2.5 w-2.5 rounded-full bg-tone-red" />
        <i className="h-2.5 w-2.5 rounded-full bg-tone-yellow" />
        <i className="h-2.5 w-2.5 rounded-full bg-tone-green" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[["128", "Products"], ["12", "Low stock"], ["3", "Pending"]].map(([value, label]) => (
          <div key={label} className="rounded-xl bg-white/70 p-3">
            <p className="text-xl font-bold sm:text-2xl">{value}</p>
            <p className="text-xs text-ink-soft">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-3 rounded-xl bg-white/70 p-3">
        {MOCK_ROWS.map(([label, width, color]) => (
          <div key={label} className="flex items-center gap-3 text-xs">
            <span className="w-16 shrink-0 font-medium">{label}</span>
            <span className="h-2.5 flex-1 rounded-full bg-ink/10">
              <span className={`grow block h-full rounded-full ${width} ${color}`} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const user = await getSession();
  const dashboard = `/${user?.role}`;

  return (
    <div className="dash relative min-h-screen overflow-x-clip">
      <div className="mesh" aria-hidden="true">
        <i className="blob blob-a" />
        <i className="blob blob-b" />
        <i className="blob blob-c" />
      </div>

      <header className="sticky top-0 z-20 px-3 pt-3 sm:px-6">
        <nav className="glass mx-auto flex max-w-6xl items-center justify-between gap-2 p-2 pl-3" aria-label="Main">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-brand to-brand-sky text-white">
              <Icon name="box" className="h-6 w-6" />
            </span>
            <span className="text-lg font-bold tracking-tight">Warehouse</span>
          </Link>
          <div className="flex gap-2">
            {user ? (
              <Link href={dashboard} className={btn.primary}>
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className={btn.secondary}>
                  Login
                </Link>
                <Link href="/register" className={btn.primary}>
                  Register as supplier <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2">
          <div className="min-w-0">
            <p className="tile rise inline-block px-3 py-1 text-sm font-semibold text-deep">Warehouse management system</p>
            <h1 className="rise mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ "--i": 1 }}>
              Warehouse stock, <span className="bg-linear-to-r from-brand to-brand-sky bg-clip-text text-transparent">under control.</span>
            </h1>
            <p className="rise mt-5 max-w-xl text-lg text-ink-soft" style={{ "--i": 2 }}>
              Track inventory, approve goods in and out, and follow supplier restocks in one place.
            </p>
            <div className="rise mt-8 flex flex-wrap gap-3" style={{ "--i": 3 }}>
              {user ? (
                <Link href={dashboard} className={btn.primary}>
                  Go to dashboard <Icon name="arrow" className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link href="/login" className={btn.secondary}>
                    Login
                  </Link>
                  <Link href="/register" className={btn.primary}>
                    Register as supplier <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
          <MockDashboard />
        </section>

        <section className="grid grid-cols-2 gap-3 py-6 lg:grid-cols-4">
          {NUMBERS.map(([value, label], i) => (
            <div key={label} className="tile rise p-4 text-center" style={{ "--i": i }}>
              <p className="text-3xl font-bold">
                <CountUp value={value} />
              </p>
              <p className="text-sm text-ink-soft">{label}</p>
            </div>
          ))}
        </section>

        <section className="py-10 sm:py-14">
          <Heading title="One workspace, four roles" text="Each role sees only the tools it needs." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map(([name, icon, tone, points], i) => (
              <GlowCard key={name} className="tile rise p-5" style={{ "--i": i }}>
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}>
                  <Icon name={icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{name}</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
                  {points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </GlowCard>
            ))}
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <Heading title="How goods move" text="Stock only changes at one clear moment in each flow." />
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="tile p-5 lg:col-span-3">
              <h3 className="text-lg font-bold">Goods in: restock order</h3>
              <p className="mt-1 text-sm text-ink-soft">Staff then record an incoming transaction. Stock grows when the manager approves it.</p>
              <div className="mt-5 space-y-5 overflow-x-auto pb-1">
                <div className="min-w-88">
                  <p className="mb-3 text-sm font-semibold">Items match the order</p>
                  <Timeline status="Received" />
                </div>
                <div className="min-w-88">
                  <p className="mb-3 text-sm font-semibold">Items damaged or wrong</p>
                  <Timeline status="Returned" />
                </div>
              </div>
            </div>
            <div className="tile p-5 lg:col-span-2">
              <h3 className="text-lg font-bold">Goods out: outgoing transaction</h3>
              <p className="mt-1 text-sm text-ink-soft">Stock decreases when staff mark the order as Shipped, not before.</p>
              <ol className="mt-5 flex flex-wrap items-center gap-2">
                {["Pending", "Approved", "Shipped"].map((status, i) => (
                  <li key={status} className="flex items-center gap-2">
                    {i > 0 && <Icon name="arrow" className="h-4 w-4 text-ink-soft" />}
                    <StatusBadge status={status} />
                  </li>
                ))}
              </ol>
              <p className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
                <StatusBadge status="Rejected" /> A rejection always needs a reason.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <Heading title="Know your stock at a glance" text="Status is calculated automatically from each product's limits." />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STOCK.map(([status, text], i) => (
              <li key={status} className="tile rise flex flex-col items-start gap-3 p-5" style={{ "--i": i }}>
                <StockBadge status={status} />
                <p className="text-sm text-ink-soft">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="py-10 sm:py-14">
          <div className="glass p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to run your warehouse?</h2>
            <p className="mx-auto mt-2 max-w-md text-ink-soft">Sign in with your account, or register as a supplier to receive restock orders.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {user ? (
                <Link href={dashboard} className={btn.primary}>
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className={btn.primary}>
                    Login
                  </Link>
                  <Link href="/register" className={btn.secondary}>
                    Register as supplier
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 py-8 text-center text-sm text-ink-soft">&copy; 2026 Warehouse. Final project, Web Programming Practicum.</footer>
    </div>
  );
}
