import { requireUser } from "@/lib/session";
import { getDashboard } from "@/lib/dashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import StaffDashboard from "@/components/dashboard/StaffDashboard";
import SupplierDashboard from "@/components/dashboard/SupplierDashboard";

const VIEWS = { admin: AdminDashboard, manager: ManagerDashboard, staff: StaffDashboard, supplier: SupplierDashboard };

export default async function RoleHomePage({ params }) {
  const { role } = await params;
  const user = await requireUser([role]);
  const View = VIEWS[user.role];
  return <View data={await getDashboard(user)} user={user} />;
}
