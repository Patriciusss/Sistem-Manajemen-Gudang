import Link from "next/link";
import { transactionStatusCounts, restockStatusCounts } from "@/lib/summary";
import Stat from "@/components/ui/Stat";
import Section from "@/components/ui/Section";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import Timeline from "@/components/ui/Timeline";
import EmptyState from "@/components/ui/EmptyState";
import TransactionActions from "@/components/transactions/TransactionActions";
import RestockActions from "@/components/restock/RestockActions";
import { link } from "@/components/ui/styles";

export default async function ManagerDashboard({ data }) {
  const [incoming, outgoing, restock] = await Promise.all([transactionStatusCounts("IN"), transactionStatusCounts("OUT"), restockStatusCounts({ role: "manager" })]);
  const alerts = data.out_of_stock + data.severe + data.low;
  const segments = [
    ["Out of Stock", data.out_of_stock, "bg-tone-gray"],
    ["Severe", data.severe, "bg-tone-red"],
    ["Low", data.low, "bg-tone-yellow"],
    ["Normal", data.total_products - alerts, "bg-tone-green"],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Manager dashboard" subtitle="Stock health, approvals and deliveries that need you." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total items in stock" value={data.total_items} icon="box" tone="teal" href="/manager/products" index={0} />
        <Stat label="Low stock alerts" value={alerts} icon="alert" tone="red" href="/manager/products?status=Low" index={1} />
        <Stat label="Pending approval" value={incoming.Pending + outgoing.Pending} icon="clock" tone="yellow" href="/manager/transactions" index={2} />
        <Stat label="Restock in progress" value={restock.Pending + restock.Confirmed + restock["In Transit"]} icon="truck" tone="cyan" href="/manager/restock" index={3} />
      </div>

      <Section title="Stock health" index={4}>
        <div className="flex h-4 overflow-hidden rounded-full bg-white/60" role="img" aria-label={segments.map(([l, n]) => `${l} ${n}`).join(", ")}>
          {data.total_products > 0 &&
            segments.map(([label, n, tone]) => n > 0 && <span key={label} className={`${tone} grow`} style={{ width: `${(n / data.total_products) * 100}%` }} />)}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {segments.map(([label, n, tone]) => (
            <li key={label} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${tone}`} />
              {label}: <span className="font-semibold tabular-nums">{n}</span>
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Transactions to approve" href="/manager/transactions" index={5}>
          {data.pending_transactions.length === 0 ? (
            <EmptyState title="Nothing to approve" text="New transactions from staff will show up here." />
          ) : (
            <ul className="space-y-3">
              {data.pending_transactions.map((t) => (
                <li key={t.id} className="space-y-2 rounded-xl bg-white/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/manager/transactions/${t.id}`} className={`${link} font-mono text-sm`}>
                      {t.trx_number}
                    </Link>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-sm text-ink-soft">
                    {t.type === "IN" ? "Incoming from" : "Outgoing to"} {t.party} - {t.total_quantity} units on {t.trx_date}
                  </p>
                  <TransactionActions trx={t} role="manager" />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Restock orders in progress" href="/manager/restock" index={6}>
          {data.active_restock.length === 0 ? (
            <EmptyState title="No open orders" text="Create a restock order when stock runs low." href="/manager/restock/new" action="New restock order" />
          ) : (
            <ul className="space-y-3">
              {data.active_restock.map((o) => (
                <li key={o.id} className="space-y-3 rounded-xl bg-white/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/manager/restock/${o.id}`} className={`${link} font-mono text-sm`}>
                      {o.po_number}
                    </Link>
                    <span className="text-sm text-ink-soft">
                      {o.supplier_name} - due {o.expected_date}
                    </span>
                  </div>
                  <Timeline status={o.status} />
                  <RestockActions order={o} role="manager" />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
