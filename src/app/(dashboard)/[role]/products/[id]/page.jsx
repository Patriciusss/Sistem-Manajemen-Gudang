import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getProduct } from "@/lib/products";
import { parseId } from "@/lib/api";
import StockBadge from "@/components/ui/StockBadge";
import ActionForm from "@/components/ui/ActionForm";
import { btn } from "@/components/ui/styles";
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
    ["SKU", p.sku],
    ["Category", p.category_name],
    ["Stock", `${p.stock} ${p.unit}`],
    ["Shelf", p.shelf_location],
    ["Buy price", rupiah(p.buy_price)],
    ["Sell price", rupiah(p.sell_price)],
    ["Severe at or below", p.min_stock],
    ["Low at or below", p.low_stock],
    ["Added", p.created_at.toISOString().slice(0, 10)],
  ];

  return (
    <div className="space-y-6">
      <Link href={base} className="text-sm text-muted-foreground underline underline-offset-2">
        Back to products
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{p.name}</h1>
          <StockBadge status={p.stock_status} />
        </div>
        <div className="flex flex-wrap items-start gap-3">
          {user.role === "manager" && p.stock_status !== "Normal" && (
            <Link href={`/manager/restock/new?product_id=${p.id}`} className={btn.primary}>
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
                confirm={`Delete ${p.name}?${p.stock > 0 ? ` It still has ${p.stock} ${p.unit} in stock.` : ""}`}
              >
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="force" value="true" />
              </ActionForm>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <p className="mb-4 text-muted-foreground">{p.description}</p>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {info.map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        {p.image && <img src={p.image} alt={p.name} className="aspect-square w-full rounded-xl border border-border object-cover" />}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Last 5 transactions</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-120 text-left text-sm">
            <thead className="border-b border-border bg-muted text-muted-foreground">
              <tr>
                {["Number", "Type", "Date", "Quantity", "Status"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No transactions yet.
                  </td>
                </tr>
              )}
              {p.history.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{t.trx_number}</td>
                  <td className="px-4 py-3">{t.type === "IN" ? "Incoming" : "Outgoing"}</td>
                  <td className="px-4 py-3">{t.trx_date}</td>
                  <td className="px-4 py-3">{t.quantity}</td>
                  <td className="px-4 py-3">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
