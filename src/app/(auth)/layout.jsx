import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AuthLayout({ children }) {
  const user = await getSession();
  if (user) redirect(`/${user.role}`);

  return (
    <main className="flex min-h-screen flex-col items-center px-6 pb-10 pt-[10vh]">
      <Link href="/" className="mb-6 font-semibold tracking-tight">
        Warehouse
      </Link>
      {children}
    </main>
  );
}