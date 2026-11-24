import { requireUser } from "@/lib/session";
import { listUsers } from "@/lib/users";
import ActionForm from "@/components/ui/ActionForm";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import Stat from "@/components/ui/Stat";
import { inputClass, th, td, row } from "@/components/ui/styles";
import { resetPasswordAction } from "@/actions/users";

const ROLES = [
  ["admin", "Admins", "shield", "cyan"],
  ["manager", "Managers", "users", "teal"],
  ["staff", "Staff", "box", "sky"],
  ["supplier", "Suppliers", "truck", "green"],
];

export default async function UsersPage() {
  await requireUser(["admin"]);
  const { data: users } = await listUsers();

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle="Set a new password for a user who forgot theirs. Their current sessions are signed out." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ROLES.map(([role, label, icon, tone], i) => (
          <Stat key={role} label={label} value={users.filter((u) => u.role === role).length} icon={icon} tone={tone} index={i} />
        ))}
      </div>
      <div className="glass-strong overflow-x-auto">
        <table className="rtable w-full text-left text-sm sm:min-w-176">
          <thead>
            <tr>
              {["Name", "Email", "Role", "Status", "New password"].map((h) => (
                <th key={h} scope="col" className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={`${row} align-top`}>
                <td className={`${td} font-semibold`} data-label="Name">{u.name}</td>
                <td className={td} data-label="Email">{u.email}</td>
                <td className={`${td} capitalize`} data-label="Role">{u.role}</td>
                <td className={td} data-label="Status">
                  <StatusBadge status={u.status} />
                </td>
                <td className={td} data-label="New password">
                  <ActionForm action={resetPasswordAction} label="Reset" success={`Password updated for ${u.name}`} className="flex flex-wrap items-start gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <input name="password" type="password" minLength={6} required autoComplete="new-password" placeholder="Min 6 characters" aria-label={`New password for ${u.name}`} className={`${inputClass} w-48`} />
                  </ActionForm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
