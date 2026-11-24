import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getRestock } from "@/lib/restock";
import { parseId } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import Timeline from "@/components/ui/Timeline";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import RestockActions from "@/components/restock/RestockActions";
import { btn, th, td, row, link } from "@/components/ui/styles";

export default async function RestockDetailPage({ params }) {
  const user = await requireUser(["manager", "supplier", "staff"]);
  const id = parseId((await params).id);
  const result = id ? await getRestock(user, id) : { status: 404 };
  if (result.status === 404) notFound();
  const o = result.data;
  const base = `/${user.role}/restock`;
  const info = [
    ["Supplier", o.supplier_name],
    ["Created by", o.manager_name],
    ["Order date", o.order_date],
    ["Expected delivery", o.expected_date],
  ];

  return (
    <div className="space-y-6">
      <Link href={base} className={`${link} inline-flex h-11 items-center text-sm`}>
        &larr; Back to restock orders
      </Link>
      <PageHeader title={o.po_number}>
        <StatusBadge status={o.status} />
      </PageHeader>

      <Section title="Progress" index={1}>
        <Timeline status={o.status} />
        {o.status_note && <p className="mt-4 rounded-xl bg-white/60 px-3 py-2 text-sm">Note: {o.status_note}</p>}
        <div className="mt-4">
          <RestockActions order={o} role={user.role} detail />
        </div>
        {o.status === "Returned" && user.role === "manager" && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-white/60 px-3 py-2 text-sm">
            <span>Ask the supplier for a refund. If the stock is still needed, create a new restock order.</span>
            <Link href="/manager/restock/new" className={btn.primary}>
              New restock order
            </Link>
          </div>
        )}
      </Section>

      {(o.arrival_photo || o.inspection_report) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {o.arrival_photo && (
            <Section title="Arrival photo" index={2}>
              <img src={o.arrival_photo} alt={`Arrival of ${o.po_number}`} className="max-h-80 w-full rounded-2xl border border-white/80 object-cover" />
            </Section>
          )}
          {o.inspection_report && (
            <Section title="Inspection report" index={2}>
              <p className="whitespace-pre-line text-sm">{o.inspection_report}</p>
            </Section>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <Section title="Details" index={2} className="h-fit">
          <dl className="space-y-3 text-sm">
            {info.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white/60 px-3 py-2">
                <dt className="text-ink-soft">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          {o.notes && <p className="mt-3 text-sm text-ink-soft">Notes: {o.notes}</p>}
        </Section>
        <Section title="Items" index={3}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-96 text-left text-sm">
              <thead>
                <tr>
                  {["Product", "SKU", "Quantity"].map((h) => (
                    <th key={h} scope="col" className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {o.items.map((i) => (
                  <tr key={i.id} className={row}>
                    <td className={`${td} font-semibold`}>{i.product_name}</td>
                    <td className={`${td} font-mono text-xs`}>{i.product_sku}</td>
                    <td className={`${td} tabular-nums`}>{i.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
}
