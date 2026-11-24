import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listRestock } from "@/lib/restock";
import { restockStatusCounts } from "@/lib/summary";
import { pick, withParams } from "@/lib/query";
import StatusBadge from "@/components/ui/StatusBadge";
import Timeline from "@/components/ui/Timeline";
import Stat from "@/components/ui/Stat";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import RestockActions from "@/components/restock/RestockActions";
import { btn, link } from "@/components/ui/styles";

const LIMIT = 8;
const TILES = [
  ["Pending", "clock", "yellow"],
  ["Confirmed", "check", "sky"],
  ["In Transit", "truck", "cyan"],
  ["Inspecting", "alert", "orange"],
  ["Received", "box", "green"],
  ["Rejected", "x", "red"],
  ["Returned", "x", "red"],
];

export default async function RestockPage({ searchParams }) {
  const user = await requireUser(["manager", "supplier", "staff"]);
  const status = pick((await searchParams).status);
  const page = Math.max(1, parseInt(pick((await searchParams).page)) || 1);
  const [{ data: orders, total }, counts] = await Promise.all([listRestock(user, { status, page, limit: LIMIT }), restockStatusCounts(user)]);
  const pages = Math.max(1, Math.ceil(total / LIMIT));
  const base = `/${user.role}/restock`;

  return (
    <div className="space-y-6">
      <PageHeader title="Restock orders" subtitle={{ manager: "Order stock from approved suppliers and follow each delivery.", supplier: "Confirm orders, send the goods and upload the arrival photo.", staff: "Inspect arriving goods and write the inspection report." }[user.role]}>
        {user.role === "manager" && (
          <Link href={`${base}/new`} className={btn.primary}>
            <Icon name="plus" />
            New restock order
          </Link>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="All orders" value={counts.total} icon="truck" tone="teal" href={withParams({})} active={!status} index={0} />
        {TILES.map(([s, icon, tone], i) => (
          <Stat key={s} label={s} value={counts[s]} icon={icon} tone={tone} href={withParams({ status: s })} active={status === s} index={i + 1} />
        ))}
      </div>

      {orders.length === 0 && (
        <div className="glass-strong">
          <EmptyState title="No restock orders" text="Orders will appear here as soon as they are created." href={user.role === "manager" ? `${base}/new` : undefined} action="New restock order" />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {orders.map((o, i) => (
          <article key={o.id} style={{ "--i": i }} className="glass-strong rise space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link href={`${base}/${o.id}`} className={`${link} font-mono text-lg`}>
                  {o.po_number}
                </Link>
                <p className="text-sm text-ink-soft">
                  {o.supplier_name} - {o.item_count} products, {o.total_quantity} units
                </p>
                <p className="text-sm text-ink-soft">
                  Ordered {o.order_date}, expected {o.expected_date}
                </p>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <Timeline status={o.status} />
            {o.status_note && <p className="rounded-xl bg-white/60 px-3 py-2 text-sm">Note: {o.status_note}</p>}
            <RestockActions order={o} role={user.role} />
          </article>
        ))}
      </div>

      <Pagination page={page} pages={pages} total={total} noun="orders" hrefFor={(p) => withParams({ status, page: p })} />
    </div>
  );
}
