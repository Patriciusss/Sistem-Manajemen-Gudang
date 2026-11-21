import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getProduct } from "@/lib/products";
import { listCategories } from "@/lib/categories";
import { parseId } from "@/lib/api";
import ProductForm from "@/components/products/ProductForm";

export default async function EditProductPage({ params }) {
  const user = await requireUser(["admin", "manager"]);
  const id = parseId((await params).id);
  const result = id ? await getProduct(id) : { status: 404 };
  if (result.status === 404) notFound();
  const { data: categories } = await listCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit {result.data.name}</h1>
      <ProductForm product={result.data} categories={categories} backHref={`/${user.role}/products/${id}`} />
    </div>
  );
}
