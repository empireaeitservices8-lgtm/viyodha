"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell, { Field, PasswordField, fieldClass, primaryBtn, focusRing, GREEN } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));

    try {
      const user = await login(email, password);
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/products");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "The email or password is incorrect.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      heading="Welcome back"
      intro="Sign in to reorder your favourite spices and track your orders."
      perks={["Reorder in a few taps", "Track every order live", "Save your delivery details"]}
      formTitle="Sign in to Viyodha"
      footer={
        <>
          New to Viyodha?{" "}
          <Link href="/register" className={`rounded-sm font-medium text-[#1F4D1F] underline underline-offset-4 ${focusRing}`}>
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate={false}>
        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={fieldClass} />
        </Field>

        <PasswordField label="Password" name="password" autoComplete="current-password" />

        {error && (
          <p role="alert" aria-live="assertive" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={primaryBtn} style={{ backgroundColor: GREEN }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
