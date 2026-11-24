import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listProducts } from "@/lib/products";
import { listCategories } from "@/lib/categories";
import { productStatusCounts } from "@/lib/summary";
import { pick, withParams } from "@/lib/query";
import StockBadge from "@/components/ui/StockBadge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Stat from "@/components/ui/Stat";
import Icon from "@/components/ui/Icon";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { btn, th, td, row, link } from "@/components/ui/styles";

const LIMIT = 10;
const STATUSES = [
  ["Out of Stock", "x", "gray"],
  ["Severe", "alert", "red"],
  ["Low", "alert", "yellow"],
  ["Normal", "check", "green"],
];
const SORTS = [
  ["name", "Name A-Z"],
  ["stock_asc", "Stock, low to high"],
  ["stock_desc", "Stock, high to low"],
  ["newest", "Newest"],
  ["oldest", "Oldest"],
];

export default async function ProductsPage({ searchParams }) {
  const user = await requireUser(["admin", "manager", "staff"]);
  const query = await searchParams;
  const filters = { search: pick(query.search), category_id: pick(query.category_id), status: pick(query.status), sort: pick(query.sort) };
  const page = Math.max(1, parseInt(pick(query.page)) || 1);
  const [{ data: products, total }, { data: categories }, counts] = await Promise.all([
    listProducts({ ...filters, page, limit: LIMIT }),
    listCategories(),
    productStatusCounts(),
  ]);
  const pages = Math.max(1, Math.ceil(total / LIMIT));
  const base = `/${user.role}/products`;
  const hrefFor = (over) => withParams({ ...filters, ...over });

  return (
    <div className="space-y-6">
      <PageHeader title="Products" subtitle="Track stock, shelf location and stock status of every item.">
        {user.role !== "staff" && (
          <Link href={`${base}/new`} className={btn.primary}>
            <Icon name="plus" />
            New product
          </Link>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="All products" value={counts.total} icon="box" tone="teal" href={hrefFor({ status: "" })} active={!filters.status} index={0} />
        {STATUSES.map(([status, icon, tone], i) => (
          <Stat key={status} label={status} value={counts[status]} icon={icon} tone={tone} href={hrefFor({ status })} active={filters.status === status} index={i + 1} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_16rem]">
        <div className="min-w-0 space-y-4">
          <form className="glass-strong grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_10rem_10rem_11rem_auto] lg:items-end">
            <Input label="Search name or SKU" name="search" defaultValue={filters.search ?? ""} />
            <Select label="Category" name="category_id" defaultValue={filters.category_id ?? ""}>
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select label="Stock status" name="status" defaultValue={filters.status ?? ""}>
              <option value="">All</option>
              {STATUSES.map(([s]) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <Select label="Sort by" name="sort" defaultValue={filters.sort ?? "name"}>
              {SORTS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <button className={btn.primary}>Apply</button>
          </form>

          <div className="glass-strong overflow-x-auto">
            <table className="w-full min-w-176 text-left text-sm">
              <thead>
                <tr>
                  {["Product", "SKU", "Category", "Stock", "Shelf", "Status"].map((h) => (
                    <th key={h} scope="col" className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={row}>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt="" className="h-10 w-10 rounded-xl border border-white/80 object-cover" />
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-tone-teal/50">
                            <Icon name="box" />
                          </span>
                        )}
                        <Link href={`${base}/${p.id}`} className={link}>
                          {p.name}
                        </Link>
                      </div>
                    </td>
                    <td className={`${td} font-mono text-xs`}>{p.sku}</td>
                    <td className={td}>{p.category_name}</td>
                    <td className={`${td} font-semibold tabular-nums`}>
                      {p.stock} {p.unit}
                    </td>
                    <td className={td}>{p.shelf_location}</td>
                    <td className={td}>
                      <StockBadge status={p.stock_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <EmptyState title="No products match your filters" text="Try a different search or clear the filters." href={base} action="Clear filters" />}
          </div>

          <Pagination page={page} pages={pages} total={total} noun="products" hrefFor={(p) => hrefFor({ page: p })} />
        </div>

        <aside className="glass-strong h-fit space-y-2 p-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <Link href={hrefFor({ category_id: "" })} className={`flex h-11 items-center justify-between rounded-xl px-3 text-sm font-medium hover:bg-white/70 ${!filters.category_id ? "bg-white/80 font-bold ring-1 ring-brand/40" : ""}`}>
            All categories
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={hrefFor({ category_id: c.id })} className={`flex h-11 items-center justify-between gap-2 rounded-xl px-3 text-sm font-medium hover:bg-white/70 ${filters.category_id === String(c.id) ? "bg-white/80 font-bold ring-1 ring-brand/40" : ""}`}>
              <span className="truncate">{c.name}</span>
              <span className="rounded-full bg-tone-sky px-2 py-0.5 text-xs font-semibold">{c.product_count}</span>
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}
