"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell, { Field, PasswordField, fieldClass, primaryBtn, focusRing, GREEN } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const f = new FormData(e.currentTarget);
    const username = String(f.get("name")).trim();
    const phone = String(f.get("phone")).trim();
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    const confirm = String(f.get("confirm"));

    if (password !== confirm) {
      const msg = "The two passwords do not match. Please verify and try again.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await register({ username, phone, email, password });
      toast.success("Account created successfully! Welcome to Viyodha.");
      router.push("/products");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "We could not create your account. Please try again.";
      setError(msg);
      toast.error(msg);
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
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={fieldClass} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField label="Password" name="password" autoComplete="new-password" hint="At least 6 characters." />
          <PasswordField label="Confirm password" name="confirm" autoComplete="new-password" placeholder="Repeat password" />
        </div>

        {error && (
          <p role="alert" aria-live="assertive" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={primaryBtn} style={{ backgroundColor: GREEN }}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
