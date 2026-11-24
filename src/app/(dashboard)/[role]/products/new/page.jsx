import PageHeader from "@/components/ui/PageHeader";
import { requireUser } from "@/lib/session";
import { listCategories } from "@/lib/categories";
import ProductForm from "@/components/products/ProductForm";

export default async function NewProductPage() {
  const user = await requireUser(["admin", "manager"]);
  const { data: categories } = await listCategories();

  return (
    <div className="space-y-6">
      <PageHeader title="New product" />
      <ProductForm categories={categories} backHref={`/${user.role}/products`} />
    </div>
  );
}
