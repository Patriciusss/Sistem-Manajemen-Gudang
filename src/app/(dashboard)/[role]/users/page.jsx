import { requireUser } from "@/lib/session";
import { listUsers } from "@/lib/users";
import ActionForm from "@/components/ui/ActionForm";
import { inputClass } from "@/components/ui/styles";
import { resetPasswordAction } from "@/actions/users";

export default async function UsersPage() {
  await requireUser(["admin"]);
  const { data: users } = await listUsers();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Set a new password for a user who forgot theirs. Their current sessions are signed out.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="border-b border-border bg-muted text-muted-foreground">
            <tr>
              {["Name", "Email", "Role", "Status", "New password"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border align-top last:border-0">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">{u.status}</td>
                <td className="px-4 py-3">
                  <ActionForm action={resetPasswordAction} label="Reset" success="Password updated." className="flex flex-wrap items-start gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <input
                      name="password"
                      type="password"
                      minLength={6}
                      required
                      autoComplete="new-password"
                      placeholder="Min 6 characters"
                      aria-label={`New password for ${u.name}`}
                      className={`${inputClass} w-48`}
                    />
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
