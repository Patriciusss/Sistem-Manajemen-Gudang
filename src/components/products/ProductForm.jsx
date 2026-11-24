import ActionForm from "@/components/ui/ActionForm";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import ImageField from "@/components/ui/ImageField";
import { createProductAction, updateProductAction } from "@/actions/products";

export default function ProductForm({ product, categories, backHref }) {
  const value = (key, fallback = "") => product?.[key] ?? fallback;

  return (
    <ActionForm
      action={product ? updateProductAction : createProductAction}
      label={product ? "Save changes" : "Create product"}
      success={product ? "Product updated" : "Product created"}
      redirectTo={backHref}
      cancelHref={backHref}
      className="glass-strong space-y-4 p-4 sm:p-6"
    >
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" name="name" defaultValue={value("name")} maxLength={150} required />
        {product ? (
          <div>
            <p className="mb-1.5 text-sm font-medium">SKU</p>
            <p className="flex h-11 items-center rounded-xl bg-white/60 px-3 text-sm">{product.sku}</p>
          </div>
        ) : (
          <Input label="SKU" name="sku" maxLength={50} required />
        )}
        <Select label="Category" name="category_id" defaultValue={value("category_id")} required>
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input label="Unit" name="unit" defaultValue={value("unit", "pcs")} maxLength={20} required />
        <Input label="Buy price (Rp)" name="buy_price" type="number" min="0" step="1" defaultValue={value("buy_price")} required />
        <Input label="Sell price (Rp)" name="sell_price" type="number" min="0" step="1" defaultValue={value("sell_price")} required />
        <Input label="Stock" name="stock" type="number" min="0" step="1" defaultValue={value("stock", 0)} required />
        <Input label="Shelf location" name="shelf_location" defaultValue={value("shelf_location")} maxLength={50} required />
        <Input label="Severe at or below" name="min_stock" type="number" min="0" step="1" defaultValue={value("min_stock")} required />
        <Input label="Low at or below" name="low_stock" type="number" min="0" step="1" defaultValue={value("low_stock")} required />
      </div>
      <Textarea label="Description" name="description" defaultValue={value("description")} maxLength={5000} required />
      <ImageField initial={value("image")} />
    </ActionForm>
  );
}
