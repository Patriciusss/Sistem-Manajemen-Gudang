import { requireUser } from "@/lib/session";
import { listSuppliers } from "@/lib/suppliers";
import ActionForm from "@/components/ui/ActionForm";
import { reviewSupplierAction } from "@/actions/suppliers";

export default async function SuppliersPage() {
  await requireUser(["admin"]);
  const { data: suppliers } = await listSuppliers("Pending");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Supplier verification</h1>
        <p className="text-sm text-muted-foreground">Suppliers who registered and are waiting for approval. They can sign in only after you approve them.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-140 text-left text-sm">
          <thead className="border-b border-border bg-muted text-muted-foreground">
            <tr>
              {["Name", "Email", "Registered", "Actions"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No pending suppliers.
                </td>
              </tr>
            )}
            {suppliers.map((s) => (
              <tr key={s.id} className="border-b border-border align-top last:border-0">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">{s.created_at.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-start gap-2">
                    {["Approved", "Rejected"].map((status) => (
                      <ActionForm
                        key={status}
                        action={reviewSupplierAction}
                        label={status === "Approved" ? "Approve" : "Reject"}
                        variant={status === "Approved" ? "primary" : "danger"}
                        confirm={`${status === "Approved" ? "Approve" : "Reject"} ${s.name}?`}
                      >
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="status" value={status} />
                      </ActionForm>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}