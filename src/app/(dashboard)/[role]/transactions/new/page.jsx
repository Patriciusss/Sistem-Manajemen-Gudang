import { requireUser } from "@/lib/session";
import { listProducts } from "@/lib/products";
import { listSuppliers } from "@/lib/suppliers";
import { availablePos } from "@/lib/summary";
import { pick } from "@/lib/query";
import TransactionForm from "@/components/transactions/TransactionForm";
import PageHeader from "@/components/ui/PageHeader";

export default async function NewTransactionPage({ searchParams }) {
  const user = await requireUser(["manager", "staff"]);
  const query = await searchParams;
  const type = pick(query.type) === "OUT" ? "OUT" : "IN";
  const base = `/${user.role}/transactions`;
  const [{ data: products }, { data: suppliers }, pos] = await Promise.all([
    listProducts({ limit: 500 }),
    type === "IN" ? listSuppliers("Approved") : { data: [] },
    type === "IN" ? availablePos() : [],
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={type === "IN" ? "New incoming transaction" : "New outgoing transaction"} subtitle="Stock changes only after a manager approves it." />
      <TransactionForm
        type={type}
        products={products}
        suppliers={suppliers}
        pos={pos}
        poId={pick(query.po) ?? ""}
        today={new Date().toISOString().slice(0, 10)}
        redirectTo={`${base}?type=${type}`}
        cancelHref={`${base}?type=${type}`}
        className="glass-strong p-4 sm:p-6"
      />
    </div>
  );
}
