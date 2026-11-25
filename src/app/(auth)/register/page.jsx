"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import Notice from "@/components/auth/Notice";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { btn, link } from "@/components/ui/styles";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setErrors({});
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) setSuccess(data.message);
      else {
        setErrors(data.errors ?? {});
        setError(data.message);
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <AuthCard
      title="Supplier registration"
      subtitle="Only suppliers can register. An admin reviews your account before you can sign in."
      onSubmit={handleSubmit}
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className={link}>
            Sign in
          </Link>
        </>
      }
    >
      {success ? (
        <>
          <Notice tone="green" title="Registration successful">
            {success}
          </Notice>
          <Link href="/login" className={`${btn.primary} w-full`}>
            Go to sign in
          </Link>
        </>
      ) : (
        <>
          <Field label="Name" name="name" autoComplete="name" value={form.name} onChange={handleChange} error={errors.name} required />
          <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} required />
          <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={6} value={form.password} onChange={handleChange} error={errors.password} required />
          {error && <Notice tone="red">{error}</Notice>}
          <Button loading={loading}>{loading ? "Registering..." : "Register"}</Button>
        </>
      )}
    </AuthCard>
  );
}
