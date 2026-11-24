import Link from "next/link";
import Stat from "@/components/ui/Stat";
import Section from "@/components/ui/Section";
import PageHeader from "@/components/ui/PageHeader";
import StockBadge from "@/components/ui/StockBadge";
import ActionForm from "@/components/ui/ActionForm";
import EmptyState from "@/components/ui/EmptyState";
import Icon from "@/components/ui/Icon";
import { link } from "@/components/ui/styles";
import { reviewSupplierAction } from "@/actions/suppliers";

const QUICK = [
  ["/admin/products", "Products", "box"],
  ["/admin/categories", "Categories", "tag"],
  ["/admin/transactions", "Transactions", "swap"],
  ["/admin/suppliers", "Suppliers", "shield"],
  ["/admin/users", "Users", "users"],
];

export default function AdminDashboard({ data }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Admin dashboard" subtitle="Warehouse activity at a glance." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total products" value={data.total_products} icon="box" tone="teal" href="/admin/products" index={0} />
        <Stat label="Transactions this month" value={data.month_transactions} icon="swap" tone="sky" href="/admin/transactions" index={1} />
        <Stat label="Inventory value" value={Math.round(data.inventory_value)} prefix="Rp " icon="coin" tone="cyan" index={2} />
        <Stat label="Pending suppliers" value={data.pending_suppliers.length} icon="clock" tone="yellow" href="/admin/suppliers" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Suppliers waiting for approval" href="/admin/suppliers" index={4} className="lg:col-span-2">
          {data.pending_suppliers.length === 0 ? (
            <EmptyState title="All caught up" text="No supplier is waiting for approval." />
          ) : (
            <ul className="space-y-3">
              {data.pending_suppliers.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{s.name}</p>
                    <p className="truncate text-sm text-ink-soft">{s.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {["Approved", "Rejected"].map((next) => (
                      <ActionForm key={next} action={reviewSupplierAction} label={next === "Approved" ? "Approve" : "Reject"} variant={next === "Approved" ? "primary" : "danger"} success={`${s.name} ${next.toLowerCase()}`}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="status" value={next} />
                      </ActionForm>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Critical stock" href="/admin/products?status=Severe" index={5}>
          {data.critical_products.length === 0 ? (
            <EmptyState title="Stock looks healthy" text="No product is severe or out of stock." />
          ) : (
            <ul className="space-y-2">
              {data.critical_products.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/60 px-3 py-2">
                  <div className="min-w-0">
                    <Link href={`/admin/products/${p.id}`} className={`${link} block truncate`}>
                      {p.name}
                    </Link>
                    <p className="text-xs text-ink-soft">
                      {p.sku} - {p.stock} {p.unit}
                    </p>
                  </div>
                  <StockBadge status={p.stock_status} />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Section title="Quick access" index={6}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK.map(([href, label, icon]) => (
            <Link key={href} href={href} className="tile glass-hover flex h-14 items-center justify-between gap-2 px-4 font-semibold">
              <span className="flex items-center gap-2">
                <Icon name={icon} />
                {label}
              </span>
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
