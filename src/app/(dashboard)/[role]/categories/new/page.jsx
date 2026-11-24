import PageHeader from "@/components/ui/PageHeader";
import { requireUser } from "@/lib/session";
import CategoryForm from "@/components/categories/CategoryForm";

export default async function NewCategoryPage() {
  const user = await requireUser(["admin", "manager"]);

  return (
    <div className="space-y-6">
      <PageHeader title="New category" />
      <CategoryForm backHref={`/${user.role}/categories`} />
    </div>
  );
}
