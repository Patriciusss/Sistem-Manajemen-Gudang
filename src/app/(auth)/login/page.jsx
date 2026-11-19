"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message);
      setLoading(false);
      return;
    }
    router.push(`/${data.role}`);
    router.refresh();
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Use your warehouse account."
      onSubmit={handleSubmit}
      footer={
        <>
          Supplier without an account?{" "}
          <Link href="/register" className="font-medium text-primary underline underline-offset-2">
            Register
          </Link>
        </>
      }
    >
      <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} required />
      {error && (
        <p role="alert" className="rounded-lg border border-destructive bg-card px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
    </AuthCard>
  );
}
