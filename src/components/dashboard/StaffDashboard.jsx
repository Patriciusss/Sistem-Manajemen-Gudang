import Link from "next/link";
import { listProducts } from "@/lib/products";
import { listRestock } from "@/lib/restock";
import Stat from "@/components/ui/Stat";
import Section from "@/components/ui/Section";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionActions from "@/components/transactions/TransactionActions";
import { link } from "@/components/ui/styles";

export default async function StaffDashboard({ data }) {
  const [{ data: products }, { data: inspecting }] = await Promise.all([listProducts({ limit: 500 }), listRestock({ role: "staff" }, { status: "Inspecting", limit: 5 })]);
  const today = data.today_transactions;
  const count = (status) => today.filter((t) => t.status === status).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Staff dashboard" subtitle="Record outgoing goods quickly and follow today's work." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Today's transactions" value={today.length} icon="swap" tone="teal" href="/staff/transactions" index={0} />
        <Stat label="Waiting approval" value={count("Pending")} icon="clock" tone="yellow" index={1} />
        <Stat label="Ready to ship" value={count("Approved")} icon="check" tone="green" index={2} />
        <Stat label="Shipped" value={count("Shipped")} icon="truck" tone="cyan" index={3} />
      </div>

      <Section title="Goods waiting for inspection" href="/staff/restock" index={4}>
        {inspecting.length === 0 ? (
          <p className="text-sm text-ink-soft">No delivery is waiting for inspection.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {inspecting.map((o) => (
              <li key={o.id} className="space-y-1 rounded-xl bg-white/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/staff/restock/${o.id}`} className={`${link} font-mono text-sm`}>
                    {o.po_number}
                  </Link>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-sm text-ink-soft">
                  {o.supplier_name} - {o.total_quantity} units
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="grid gap-6 xl:grid-cols-5">
        <Section title="Quick entry: outgoing goods" index={5} className="xl:col-span-3">
          <TransactionForm type="OUT" products={products} today={new Date().toISOString().slice(0, 10)} />
          <p className="mt-3 text-sm text-ink-soft">
            Need incoming goods?{" "}
            <Link href="/staff/transactions/new?type=IN" className={link}>
              Record incoming transaction
            </Link>
          </p>
        </Section>

        <Section title="Today's transactions" href="/staff/transactions" index={6} className="xl:col-span-2">
          {today.length === 0 ? (
            <EmptyState title="Nothing recorded today" text="Use the quick entry form to add the first one." />
          ) : (
            <ul className="space-y-3">
              {today.map((t) => (
                <li key={t.id} className="space-y-2 rounded-xl bg-white/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/staff/transactions/${t.id}`} className={`${link} font-mono text-sm`}>
                      {t.trx_number}
                    </Link>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-sm text-ink-soft">
                    {t.type === "IN" ? "From" : "To"} {t.party} - {t.total_quantity} units
                  </p>
                  <TransactionActions trx={t} role="staff" />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
