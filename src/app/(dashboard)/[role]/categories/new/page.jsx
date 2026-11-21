import { requireUser } from "@/lib/session";
import CategoryForm from "@/components/categories/CategoryForm";

export default async function NewCategoryPage() {
  const user = await requireUser(["admin", "manager"]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New category</h1>
      <CategoryForm backHref={`/${user.role}/categories`} />
    </div>
  );
}
