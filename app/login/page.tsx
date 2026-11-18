"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell, { Field, PasswordField, fieldClass, primaryBtn, focusRing, GREEN } from "@/components/AuthShell";

/**
 * app/login/page.tsx
 * Connect `onSubmit` to your auth (NextAuth, Clerk, your own API, etc.).
 */

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    const password = String(f.get("password"));

    try {
      // TODO: call your sign-in API here, e.g.
      // const res = await fetch("/api/login", { method: "POST", body: JSON.stringify({ email, password }) });
      // if (!res.ok) throw new Error("Wrong email or password.");
      // router.push("/");
      void email; void password;
    } catch {
      setError("The email or password is incorrect. Check them and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      heading="Welcome back"
      intro="Sign in to reorder your favourite spices and track your orders."
      perks={["Reorder in a few taps", "Track every order", "Save your delivery details"]}
      formTitle="Sign in"
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
          <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={fieldClass} />
        </Field>

        <PasswordField label="Password" name="password" autoComplete="current-password" />

        <p role="alert" aria-live="assertive" className={error ? "rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" : "sr-only"}>
          {error}
        </p>

        <button type="submit" disabled={loading} className={primaryBtn} style={{ backgroundColor: GREEN }}>
          {loading ? "Signing in" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
