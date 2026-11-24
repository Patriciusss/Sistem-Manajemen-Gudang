"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { btn } from "@/components/ui/styles";
import Modal from "@/components/ui/Modal";

export default function ActionForm({ action, label, variant = "primary", redirectTo, cancelHref, confirm, success = "Saved", onDone, className = "", children }) {
  const router = useRouter();
  const [errors, setErrors] = useState([]);
  const [pending, setPending] = useState(false);
  const [asking, setAsking] = useState(null);

  async function run(form) {
    setAsking(null);
    setPending(true);
    const result = await action(new FormData(form));
    setPending(false);
    if (result?.errors) return setErrors(Object.values(result.errors));
    setErrors([]);
    form.reset();
    window.dispatchEvent(new CustomEvent("toast", { detail: success }));
    onDone?.();
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (confirm) setAsking(e.currentTarget);
    else run(e.currentTarget);
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
      {errors.length > 0 && (
        <ul role="alert" className="mb-3 space-y-1 rounded-xl border border-red-700 bg-white/80 px-3 py-2 text-sm font-medium text-red-700">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      <button disabled={pending} className={btn[variant]}>
        {pending ? "Please wait..." : label}
      </button>
      {cancelHref && (
        <Link href={cancelHref} className={`${btn.secondary} ml-3`}>
          Cancel
        </Link>
      )}
      {asking && (
        <Modal title="Please confirm" onClose={() => setAsking(null)}>
          <p className="mb-4 text-ink-soft">{confirm}</p>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setAsking(null)} className={btn.secondary}>
              Cancel
            </button>
            <button type="button" autoFocus onClick={() => run(asking)} className={btn[variant]}>
              {label}
            </button>
          </div>
        </Modal>
      )}
    </form>
  );
}
