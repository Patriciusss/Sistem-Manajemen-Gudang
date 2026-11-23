import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listProducts } from "@/lib/products";
import { listCategories } from "@/lib/categories";
import StockBadge from "@/components/ui/StockBadge";
import Field from "@/components/ui/Field";
import Select from "@/components/ui/Select";
import { btn } from "@/components/ui/styles";

const LIMIT = 10;
const STATUSES = ["Out of Stock", "Severe", "Low", "Normal"];
const SORTS = [
  ["name", "Name A-Z"],
  ["stock_asc", "Stock, low to high"],
  ["stock_desc", "Stock, high to low"],
  ["newest", "Newest"],
  ["oldest", "Oldest"],
];

const pick = (value) => (Array.isArray(value) ? value[0] : value);

export default async function ProductsPage({ searchParams }) {
  const user = await requireUser(["admin", "manager", "staff"]);
  const query = await searchParams;
  const filters = { search: pick(query.search), category_id: pick(query.category_id), status: pick(query.status), sort: pick(query.sort) };
  const page = Math.max(1, parseInt(pick(query.page)) || 1);
  const [{ data: products, total }, { data: categories }] = await Promise.all([
    listProducts({ ...filters, page, limit: LIMIT }),
    listCategories(),
  ]);
  const pages = Math.max(1, Math.ceil(total / LIMIT));
  const pageHref = (p) => `?${new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), page: p })}`;
  const base = `/${user.role}/products`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        {user.role !== "staff" && (
          <Link href={`${base}/new`} className={btn.primary}>
            New product
          </Link>
        )}
      </div>

      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_10rem_10rem_11rem_auto] lg:items-end">
        <Field label="Search name or SKU" name="search" defaultValue={filters.search ?? ""} />
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
          {STATUSES.map((s) => (
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

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="border-b border-border bg-muted text-muted-foreground">
            <tr>
              {["SKU", "Name", "Category", "Stock", "Shelf", "Status"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No products match your filters.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 font-medium">
                  <Link href={`${base}/${p.id}`} className="underline underline-offset-2">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.category_name}</td>
                <td className="px-4 py-3">
                  {p.stock} {p.unit}
                </td>
                <td className="px-4 py-3">{p.shelf_location}</td>
                <td className="px-4 py-3">
                  <StockBadge status={p.stock_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} products, page {page} of {pages}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className={btn.secondary}>
              Previous
            </Link>
          )}
          {page < pages && (
            <Link href={pageHref(page + 1)} className={btn.secondary}>
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}