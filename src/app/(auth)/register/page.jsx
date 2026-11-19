"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [result, setResult] = useState({ ok: false, message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setResult({ ok: res.ok, message: data.message });
    if (res.ok) setForm({ name: "", email: "", password: "" });
    setLoading(false);
  }

  return (
    <AuthCard
      title="Supplier registration"
      subtitle="Your account is reviewed by an admin before you can sign in."
      onSubmit={handleSubmit}
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-medium text-primary underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <Field label="Name" name="name" autoComplete="name" value={form.name} onChange={handleChange} required />
      <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
      <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={6} value={form.password} onChange={handleChange} required />
      {result.message && (
        <p
          role="alert"
          className={`rounded-lg border px-3 py-2 text-sm ${result.ok ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-destructive bg-card text-destructive"}`}
        >
          {result.message}
        </p>
      )}
      <Button disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
    </AuthCard>
  );
}
