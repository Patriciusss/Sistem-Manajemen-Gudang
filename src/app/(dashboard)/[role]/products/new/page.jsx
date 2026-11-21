import { requireUser } from "@/lib/session";
import { listCategories } from "@/lib/categories";
import ProductForm from "@/components/products/ProductForm";

export default async function NewProductPage() {
  const user = await requireUser(["admin", "manager"]);
  const { data: categories } = await listCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New product</h1>
      <ProductForm categories={categories} backHref={`/${user.role}/products`} />
    </div>
  );
}
