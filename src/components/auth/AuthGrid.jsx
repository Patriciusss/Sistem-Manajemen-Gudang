"use client";

import { usePathname } from "next/navigation";

export default function AuthGrid({ aside, children }) {
  const formFirst = usePathname() === "/login";

  return (
    <main className="grid flex-1 gap-6 py-4 lg:grid-cols-2 lg:gap-10">
      <div className={`flex min-w-0 justify-center ${formFirst ? "lg:order-1" : "lg:order-2"}`}>{children}</div>
      <div className={`hidden lg:flex ${formFirst ? "lg:order-2" : "lg:order-1"}`}>{aside}</div>
    </main>
  );
}
