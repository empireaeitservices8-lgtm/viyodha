"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell, { Field, PasswordField, fieldClass, primaryBtn, focusRing, GREEN } from "@/components/AuthShell";

/**
 * app/register/page.tsx
 * Connect `onSubmit` to your sign-up API.
 */

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);

    if (f.get("password") !== f.get("confirm")) {
      setError("The two passwords do not match. Type the same password in both fields.");
      return;
    }

    setLoading(true);
    try {
      // TODO: call your sign-up API here, e.g.
      // const res = await fetch("/api/register", { method: "POST", body: JSON.stringify(Object.fromEntries(f)) });
      // if (!res.ok) throw new Error();
      // router.push("/login");
    } catch {
      setError("We could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      heading="Join Viyodha"
      intro="Create an account to order whole spices for your kitchen, shop or business."
      perks={["Faster checkout every time", "Order history and tracking", "Wholesale and export enquiries"]}
      formTitle="Create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className={`rounded-sm font-medium text-[#1F4D1F] underline underline-offset-4 ${focusRing}`}>
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name">
            <input name="name" type="text" required autoComplete="name" placeholder="Full name" className={fieldClass} />
          </Field>
          <Field label="Phone">
            <input name="phone" type="tel" required autoComplete="tel" pattern="[+0-9 ]{10,15}" title="Enter a valid phone number" placeholder="+91 98765 43210" className={fieldClass} />
          </Field>
        </div>

        <Field label="Email">
          <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={fieldClass} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField label="Password" name="password" autoComplete="new-password" hint="At least 8 characters." />
          <PasswordField label="Confirm password" name="confirm" autoComplete="new-password" placeholder="Repeat password" />
        </div>

        <p role="alert" aria-live="assertive" className={error ? "rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" : "sr-only"}>
          {error}
        </p>

        <button type="submit" disabled={loading} className={primaryBtn} style={{ backgroundColor: GREEN }}>
          {loading ? "Creating account" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
