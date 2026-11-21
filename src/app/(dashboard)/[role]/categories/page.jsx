import Link from "next/link";
import { requireUser } from "@/lib/session";
import { listCategories } from "@/lib/categories";
import ActionForm from "@/components/ui/ActionForm";
import { btn } from "@/components/ui/styles";
import { deleteCategoryAction } from "@/actions/categories";

export default async function CategoriesPage() {
  const user = await requireUser(["admin", "manager"]);
  const { data: categories } = await listCategories();
  const base = `/${user.role}/categories`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <Link href={`${base}/new`} className={btn.primary}>
          New category
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="border-b border-border bg-muted text-muted-foreground">
            <tr>
              {["Name", "Description", "Products", "Actions"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-border align-top last:border-0">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.description}</td>
                <td className="px-4 py-3">{c.product_count}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-start gap-2">
                    <Link href={`${base}/${c.id}/edit`} className={btn.secondary}>
                      Edit
                    </Link>
                    <ActionForm action={deleteCategoryAction} label="Delete" variant="danger" confirm={`Delete category ${c.name}?`}>
                      <input type="hidden" name="id" value={c.id} />
                    </ActionForm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
