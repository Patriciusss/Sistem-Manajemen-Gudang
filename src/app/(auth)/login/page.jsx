"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import Notice from "@/components/auth/Notice";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { link } from "@/components/ui/styles";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [notice, setNotice] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setNotice(null);
    setErrors({});
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? {});
        const reviewing = res.status === 403 && /review/i.test(data.message);
        setNotice({
          tone: reviewing ? "amber" : "red",
          title: res.status !== 403 ? "" : reviewing ? "Account under review" : "Registration rejected",
          message: data.message,
        });
        setLoading(false);
        return;
      }
      router.push(`/${data.role}`);
      router.refresh();
    } catch {
      setNotice({ tone: "red", title: "", message: "Network error. Please try again." });
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Use your warehouse account."
      onSubmit={handleSubmit}
      footer={
        <>
          Supplier without an account?{" "}
          <Link href="/register" className={link}>
            Register
          </Link>
          <span className="mt-1 block">Forgot your password? Contact an admin.</span>
        </>
      }
    >
      <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} error={errors.password} required />
      {notice && (
        <Notice tone={notice.tone} title={notice.title}>
          {notice.message}
        </Notice>
      )}
      <Button loading={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
    </AuthCard>
  );
}
