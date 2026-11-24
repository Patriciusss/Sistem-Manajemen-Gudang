import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listCategories } from "@/lib/categories";
import ActionForm from "@/components/ui/ActionForm";
import PageHeader from "@/components/ui/PageHeader";
import Stat from "@/components/ui/Stat";
import Icon from "@/components/ui/Icon";
import EmptyState from "@/components/ui/EmptyState";
import { btn } from "@/components/ui/styles";
import { deleteCategoryAction } from "@/actions/categories";

export default async function CategoriesPage() {
  const user = await requireUser(["admin", "manager"]);
  const { data: categories } = await listCategories();
  const base = `/${user.role}/categories`;
  const products = categories.reduce((sum, c) => sum + c.product_count, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" subtitle="Group products so they are easy to find and filter.">
        <Link href={`${base}/new`} className={btn.primary}>
          <Icon name="plus" />
          New category
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Categories" value={categories.length} icon="tag" tone="teal" index={0} />
        <Stat label="Products" value={products} icon="box" tone="sky" index={1} />
        <Stat label="Empty categories" value={categories.filter((c) => c.product_count === 0).length} icon="alert" tone="yellow" index={2} />
      </div>

      {categories.length === 0 && (
        <div className="glass-strong">
          <EmptyState title="No categories yet" text="Create the first category to start adding products." href={`${base}/new`} action="New category" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c, i) => (
          <article key={c.id} style={{ "--i": i }} className="glass-strong rise flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              {c.image ? (
                <img src={c.image} alt="" className="h-14 w-14 rounded-2xl border border-white/80 object-cover" />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-tone-teal to-tone-sky">
                  <Icon name="tag" className="h-7 w-7" />
                </span>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{c.name}</h2>
                <p className="text-sm text-ink-soft">{c.product_count} products</p>
              </div>
            </div>
            <p className="flex-1 text-sm text-ink-soft">{c.description || "No description."}</p>
            <div className="flex flex-wrap items-start gap-2">
              <Link href={`${base}/${c.id}/edit`} className={btn.secondary}>
                Edit
              </Link>
              <ActionForm action={deleteCategoryAction} label="Delete" variant="danger" success="Category deleted" confirm={`Delete category ${c.name}?`}>
                <input type="hidden" name="id" value={c.id} />
              </ActionForm>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
