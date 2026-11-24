import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getTransaction } from "@/lib/transactions";
import { parseId } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import ActionForm from "@/components/ui/ActionForm";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import TransactionActions from "@/components/transactions/TransactionActions";
import { btn, th, td, row, link } from "@/components/ui/styles";
import { deleteTransactionAction } from "@/actions/transactions";

export default async function TransactionDetailPage({ params }) {
  const user = await requireUser(["admin", "manager", "staff"]);
  const id = parseId((await params).id);
  const result = id ? await getTransaction(id) : { status: 404 };
  if (result.status === 404) notFound();
  const t = result.data;
  const base = `/${user.role}/transactions`;
  const incoming = t.type === "IN";
  const reviewable = user.role === "manager" && t.status === "Pending";
  const shippable = user.role === "staff" && !incoming && t.status === "Approved";
  const canChange = t.status === "Pending" && (user.role === "manager" || (user.role === "staff" && t.created_by === user.id));
  const info = [
    ["Type", incoming ? "Incoming (Barang Masuk)" : "Outgoing (Barang Keluar)"],
    ["Date", t.trx_date],
    [incoming ? "Supplier" : "Customer", incoming ? t.supplier_name : t.customer_name],
    ["Purchase order", t.restock_order_id && user.role !== "admin" ? <Link href={`/${user.role}/restock/${t.restock_order_id}`} className={link}>{t.po_number}</Link> : (t.po_number ?? "-")],
    ["Created by", t.created_by_name],
    ["Reviewed by", t.approved_by_name ?? "-"],
  ];

  return (
    <div className="space-y-6">
      <Link href={`${base}?type=${t.type}`} className={`${link} inline-flex h-11 items-center text-sm`}>
        &larr; Back to transactions
      </Link>
      <PageHeader title={t.trx_number}>
        <StatusBadge status={t.status} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          <Section title="Details" index={1}>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {info.map(([label, value]) => (
                <div key={label} className="rounded-xl bg-white/60 px-3 py-2">
                  <dt className="text-ink-soft">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            {t.notes && <p className="mt-3 text-sm text-ink-soft">Notes: {t.notes}</p>}
            {t.reject_reason && <p className="mt-3 rounded-xl border border-red-700 bg-white/70 px-3 py-2 text-sm font-medium text-red-700">Rejected: {t.reject_reason}</p>}
          </Section>

          <Section title="Items" index={2}>
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
                  {t.items.map((i) => (
                    <tr key={i.id} className={row}>
                      <td className={`${td} font-semibold`}>{i.product_id ? <Link href={`/${user.role}/products/${i.product_id}`} className={link}>{i.product_name}</Link> : i.product_name}</td>
                      <td className={`${td} font-mono text-xs`}>{i.product_sku}</td>
                      <td className={`${td} tabular-nums`}>{i.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        <Section title="Actions" index={3} className="h-fit space-y-3">
          <TransactionActions trx={t} role={user.role} />
          {canChange && (
            <div className="flex flex-wrap gap-2">
              <Link href={`${base}/${t.id}/edit`} className={btn.secondary}>
                Edit
              </Link>
              <ActionForm action={deleteTransactionAction} label="Delete" variant="danger" redirectTo={`${base}?type=${t.type}`} success="Transaction deleted" confirm={`Delete ${t.trx_number}?`}>
                <input type="hidden" name="id" value={t.id} />
              </ActionForm>
            </div>
          )}
          {!canChange && !reviewable && !shippable && <p className="text-sm text-ink-soft">No actions available for you on this transaction.</p>}
        </Section>
      </div>
    </div>
  );
}
