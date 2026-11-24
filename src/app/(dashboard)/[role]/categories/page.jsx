import { notFound } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { requireUser } from "@/lib/session";
import { getCategory } from "@/lib/categories";
import { parseId } from "@/lib/api";
import CategoryForm from "@/components/categories/CategoryForm";

export default async function EditCategoryPage({ params }) {
  const user = await requireUser(["admin", "manager"]);
  const id = parseId((await params).id);
  const result = id ? await getCategory(id) : { status: 404 };
  if (result.status === 404) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${result.data.name}`} />
      <CategoryForm category={result.data} backHref={`/${user.role}/categories`} />
    </div>
  );
}
