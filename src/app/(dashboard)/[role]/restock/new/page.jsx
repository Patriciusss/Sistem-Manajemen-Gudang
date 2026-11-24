import { requireUser } from "@/lib/session";
import { listProducts } from "@/lib/products";
import { listSuppliers } from "@/lib/suppliers";
import { parseId } from "@/lib/api";
import { pick } from "@/lib/query";
import ActionForm from "@/components/ui/ActionForm";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import ItemRows from "@/components/ui/ItemRows";
import PageHeader from "@/components/ui/PageHeader";
import { createRestockAction } from "@/actions/restock";

export default async function NewRestockPage({ searchParams }) {
  await requireUser(["manager"]);
  const productId = parseId(pick((await searchParams).product_id));
  const [{ data: products }, { data: suppliers }] = await Promise.all([listProducts({ limit: 500 }), listSuppliers("Approved")]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="New restock order" subtitle="The supplier will be asked to confirm this order." />
      <ActionForm action={createRestockAction} label="Create order" success="Restock order created" redirectTo="/manager/restock" cancelHref="/manager/restock" className="glass-strong space-y-4 p-4 sm:p-6">
        <Select label="Supplier" name="supplier_id" defaultValue="" required>
          <option value="" disabled>
            Select supplier
          </option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Order date" name="order_date" type="date" defaultValue={today} required />
          <Input label="Expected delivery date" name="expected_date" type="date" defaultValue={today} min={today} required />
        </div>
        <ItemRows products={products} initial={productId ? [{ product_id: String(productId), quantity: 1 }] : []} />
        <Textarea label="Notes (optional)" name="notes" rows={3} />
      </ActionForm>
    </div>
  );
}
