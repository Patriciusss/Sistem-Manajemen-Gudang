import { requireUser } from "@/lib/session";
import { listSuppliers } from "@/lib/suppliers";
import { pick, withParams } from "@/lib/query";
import ActionForm from "@/components/ui/ActionForm";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import Stat from "@/components/ui/Stat";
import EmptyState from "@/components/ui/EmptyState";
import { th, td, row } from "@/components/ui/styles";
import { reviewSupplierAction } from "@/actions/suppliers";

const TABS = [
  ["Pending", "clock", "yellow"],
  ["Approved", "check", "green"],
  ["Rejected", "x", "red"],
];

export default async function SuppliersPage({ searchParams }) {
  await requireUser(["admin"]);
  const requested = pick((await searchParams).status);
  const status = TABS.some(([s]) => s === requested) ? requested : "Pending";
  const lists = await Promise.all(TABS.map(([s]) => listSuppliers(s)));
  const suppliers = lists[TABS.findIndex(([s]) => s === status)].data;

  return (
    <div className="space-y-6">
      <PageHeader title="Supplier verification" subtitle="New suppliers can sign in only after you approve them." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TABS.map(([s, icon, tone], i) => (
          <Stat key={s} label={s} value={lists[i].data.length} icon={icon} tone={tone} href={withParams({ status: s })} active={s === status} index={i} />
        ))}
      </div>
      <div className="glass-strong overflow-x-auto">
        <table className="rtable w-full text-left text-sm sm:min-w-160">
          <thead>
            <tr>
              {["Name", "Email", "Registered", "Status", "Actions"].map((h) => (
                <th key={h} scope="col" className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className={row}>
                <td className={`${td} font-semibold`} data-label="Name">{s.name}</td>
                <td className={td} data-label="Email">{s.email}</td>
                <td className={td} data-label="Registered">{s.created_at.toISOString().slice(0, 10)}</td>
                <td className={td} data-label="Status">
                  <StatusBadge status={s.status} />
                </td>
                <td className={td} data-label="Actions">
                  {s.status === "Pending" && (
                    <div className="flex flex-wrap gap-2">
                      {["Approved", "Rejected"].map((next) => (
                        <ActionForm key={next} action={reviewSupplierAction} label={next === "Approved" ? "Approve" : "Reject"} variant={next === "Approved" ? "primary" : "danger"} success={`${s.name} ${next.toLowerCase()}`}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="status" value={next} />
                        </ActionForm>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {suppliers.length === 0 && <EmptyState title={`No ${status.toLowerCase()} suppliers`} text="Nothing to review here right now." />}
      </div>
    </div>
  );
}
