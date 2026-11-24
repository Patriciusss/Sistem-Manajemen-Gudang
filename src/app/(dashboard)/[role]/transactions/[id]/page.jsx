import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getTransaction } from "@/lib/transactions";
import { listProducts } from "@/lib/products";
import { parseId } from "@/lib/api";
import ActionForm from "@/components/ui/ActionForm";
import ItemRows from "@/components/ui/ItemRows";
import Textarea from "@/components/ui/Textarea";
import PageHeader from "@/components/ui/PageHeader";
import { updateTransactionAction } from "@/actions/transactions";

export default async function EditTransactionPage({ params }) {
  const user = await requireUser(["manager", "staff"]);
  const id = parseId((await params).id);
  const result = id ? await getTransaction(id) : { status: 404 };
  if (result.status === 404) notFound();
  const t = result.data;
  const back = `/${user.role}/transactions/${id}`;
  if (t.status !== "Pending" || (user.role === "staff" && t.created_by !== user.id)) redirect(back);
  const { data: products } = await listProducts({ limit: 500 });

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={`Edit ${t.trx_number}`} subtitle="Only products, quantities and notes can be changed." />
      <ActionForm action={updateTransactionAction} label="Save changes" success="Transaction updated" redirectTo={back} cancelHref={back} className="glass-strong space-y-4 p-4 sm:p-6">
        <input type="hidden" name="id" value={t.id} />
        <ItemRows products={products} initial={t.items.map((i) => ({ product_id: i.product_id ? String(i.product_id) : "", quantity: i.quantity }))} />
        <Textarea label="Notes (optional)" name="notes" rows={3} defaultValue={t.notes ?? ""} />
      </ActionForm>
    </div>
  );
}
