"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { btn } from "@/components/ui/styles";

export default function ActionForm({ action, label, variant = "primary", redirectTo, cancelHref, confirm, success, className = "", children }) {
  const router = useRouter();
  const [errors, setErrors] = useState([]);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (confirm && !window.confirm(confirm)) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setDone(false);
    setPending(true);
    const result = await action(data);
    setPending(false);
    if (result?.errors) return setErrors(Object.values(result.errors));
    setErrors([]);
    setDone(true);
    form.reset();
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
      {errors.length > 0 && (
        <ul role="alert" className="mb-3 space-y-1 rounded-lg border border-destructive bg-card px-3 py-2 text-sm text-destructive">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {done && success && (
        <p role="status" className="mb-3 text-sm text-muted-foreground">
          {success}
        </p>
      )}
      <button disabled={pending} className={btn[variant]}>
        {pending ? "Please wait..." : label}
      </button>
      {cancelHref && (
        <Link href={cancelHref} className={`${btn.secondary} ml-3`}>
          Cancel
        </Link>
      )}
    </form>
  );
}
