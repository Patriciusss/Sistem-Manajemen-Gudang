import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getProduct } from "@/lib/products";
import { parseId } from "@/lib/api";
import StockBadge from "@/components/ui/StockBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import StockRing from "@/components/ui/StockRing";
import ActionForm from "@/components/ui/ActionForm";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import Icon from "@/components/ui/Icon";
import { btn, th, td, row, link } from "@/components/ui/styles";
import { deleteProductAction } from "@/actions/products";

const rupiah = (n) => `Rp ${n.toLocaleString("id-ID")}`;

export default async function ProductDetailPage({ params }) {
  const user = await requireUser(["admin", "manager", "staff"]);
  const id = parseId((await params).id);
  const result = id ? await getProduct(id) : { status: 404 };
  if (result.status === 404) notFound();
  const p = result.data;
  const base = `/${user.role}/products`;
  const info = [
    ["Category", p.category_name],
    ["Shelf", p.shelf_location],
    ["Buy price", rupiah(p.buy_price)],
    ["Sell price", rupiah(p.sell_price)],
    ["Severe at or below", p.min_stock],
    ["Low at or below", p.low_stock],
    ["Added", p.created_at.toISOString().slice(0, 10)],
  ];

  return (
    <div className="space-y-6">
      <Link href={base} className={`${link} inline-flex h-11 items-center text-sm`}>
        &larr; Back to products
      </Link>
      <PageHeader title={p.name} subtitle={`SKU ${p.sku}`}>
        {user.role === "manager" && p.stock_status !== "Normal" && (
          <Link href={`/manager/restock/new?product_id=${p.id}`} className={btn.primary}>
            <Icon name="truck" />
            Create Restock Order
          </Link>
        )}
        {user.role !== "staff" && (
          <>
            <Link href={`${base}/${p.id}/edit`} className={btn.secondary}>
              Edit
            </Link>
            <ActionForm
              action={deleteProductAction}
              label="Delete"
              variant="danger"
              redirectTo={base}
              success="Product deleted"
              confirm={`Delete ${p.name}?${p.stock > 0 ? ` It still has ${p.stock} ${p.unit} in stock.` : ""}`}
            >
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="force" value="true" />
            </ActionForm>
          </>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <aside className="glass-strong rise space-y-4 p-5">
          {p.image && <img src={p.image} alt={p.name} className="aspect-square w-full rounded-2xl border border-white/80 object-cover" />}
          <StockRing stock={p.stock} minStock={p.min_stock} lowStock={p.low_stock} unit={p.unit} status={p.stock_status} />
          <div className="text-center">
            <StockBadge status={p.stock_status} />
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <Section title="Details" index={1}>
            <p className="mb-4 text-ink-soft">{p.description}</p>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {info.map(([label, value]) => (
                <div key={label} className="rounded-xl bg-white/60 px-3 py-2">
                  <dt className="text-ink-soft">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section title="Last 5 transactions" index={2}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-120 text-left text-sm">
                <thead>
                  <tr>
                    {["Number", "Type", "Date", "Quantity", "Status"].map((h) => (
                      <th key={h} scope="col" className={th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.history.map((t) => (
                    <tr key={t.id} className={row}>
                      <td className={`${td} font-mono text-xs`}>
                        <Link href={`/${user.role}/transactions/${t.id}`} className={link}>
                          {t.trx_number}
                        </Link>
                      </td>
                      <td className={td}>{t.type === "IN" ? "Incoming" : "Outgoing"}</td>
                      <td className={td}>{t.trx_date}</td>
                      <td className={`${td} tabular-nums`}>{t.quantity}</td>
                      <td className={td}>
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {p.history.length === 0 && <p className="py-6 text-center text-sm text-ink-soft">No transactions yet.</p>}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
