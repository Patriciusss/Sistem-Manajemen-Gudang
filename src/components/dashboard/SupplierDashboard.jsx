import Link from "next/link";
import { restockStatusCounts } from "@/lib/summary";
import Stat from "@/components/ui/Stat";
import Section from "@/components/ui/Section";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import RestockActions from "@/components/restock/RestockActions";
import { th, td, row, link } from "@/components/ui/styles";

export default async function SupplierDashboard({ data, user }) {
  const counts = await restockStatusCounts(user);

  return (
    <div className="space-y-6">
      <PageHeader title="Supplier dashboard" subtitle="Orders from the warehouse and your deliveries." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Waiting for you" value={counts.Pending} icon="clock" tone="yellow" href="/supplier/restock?status=Pending" index={0} />
        <Stat label="Confirmed" value={counts.Confirmed} icon="check" tone="sky" href="/supplier/restock?status=Confirmed" index={1} />
        <Stat label="In transit" value={counts["In Transit"]} icon="truck" tone="cyan" href="/supplier/restock?status=In%20Transit" index={2} />
        <Stat label="Received" value={counts.Received} icon="box" tone="green" href="/supplier/restock?status=Received" index={3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Section title="Orders to confirm" href="/supplier/restock" index={4} className="xl:col-span-2">
          {data.to_confirm.length === 0 ? (
            <EmptyState title="No orders waiting" text="New restock orders will appear here." />
          ) : (
            <ul className="space-y-3">
              {data.to_confirm.map((o) => (
                <li key={o.id} className="space-y-2 rounded-xl bg-white/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/supplier/restock/${o.id}`} className={`${link} font-mono text-sm`}>
                      {o.po_number}
                    </Link>
                    <span className="text-sm text-ink-soft">
                      {o.total_quantity} units, due {o.expected_date}
                    </span>
                  </div>
                  <RestockActions order={o} role="supplier" />
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Shipments to the warehouse" href="/supplier/restock" index={5} className="xl:col-span-3">
          {data.shipment_history.length === 0 ? (
            <EmptyState title="No shipments yet" text="Orders in transit or received are listed here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-96 text-left text-sm">
                <thead>
                  <tr>
                    {["Order", "Expected", "Units", "Status"].map((h) => (
                      <th key={h} scope="col" className={th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.shipment_history.map((o) => (
                    <tr key={o.id} className={row}>
                      <td className={`${td} font-mono text-xs`}>
                        <Link href={`/supplier/restock/${o.id}`} className={link}>
                          {o.po_number}
                        </Link>
                      </td>
                      <td className={td}>{o.expected_date}</td>
                      <td className={`${td} tabular-nums`}>{o.total_quantity}</td>
                      <td className={td}>
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
