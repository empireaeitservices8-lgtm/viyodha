"use client";

import { useState } from "react";
import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";

/**
 * components/AuthShell.tsx
 * Shared layout + styles for the Viyodha login and register pages.
 * Needs /public/wooden2.jpg (already used on your home page).
 */

export const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });

export const GREEN = "#1F4D1F";
export const TINT = "#EEF3EA";

export const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]";

export const fieldClass =
  "w-full rounded-xl border border-[#1F4D1F]/25 bg-white px-4 py-3 text-base text-[#141414] outline-none transition-colors placeholder:text-[#141414]/40 focus:border-[#1F4D1F] focus:ring-2 focus:ring-[#1F4D1F]/20";

export const primaryBtn = `w-full rounded-full py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${focusRing}`;

/* ------------------------------ form helpers ------------------------------ */

export function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium ${className}`}>
      {label}
      {children}
    </label>
  );
}

export function PasswordField({
  label,
  name,
  autoComplete,
  hint,
  placeholder = "Password",
}: {
  label: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  hint?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={autoComplete === "new-password" ? 8 : undefined}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`${fieldClass} pr-16`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          aria-label={show ? "Hide password" : "Show password"}
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-sm font-medium text-[#1F4D1F] transition-colors hover:bg-[#EEF3EA] ${focusRing}`}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {hint && <p className="text-sm text-[#141414]/60">{hint}</p>}
    </div>
  );
}

/* --------------------------------- layout --------------------------------- */

const Check = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.500 4.500 4.500L19 7.500" />
  </svg>
);

export default function AuthShell({
  heading,
  intro,
  perks,
  formTitle,
  children,
  footer,
}: {
  heading: string;
  intro: string;
  perks: string[];
  formTitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="bg-white text-[#141414]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-8 lg:py-14">
        {/* Brand panel */}
        <aside
          className="flex flex-col gap-8 rounded-[2rem] rounded-tl-[4.5rem] p-8 pt-14 text-white sm:p-12 sm:pt-16 lg:rounded-tl-[6rem]"
          style={{ backgroundColor: GREEN }}
        >
          <div>
            <p className={`${serif.className} text-4xl font-semibold leading-[1.02] sm:text-5xl lg:text-6xl`} role="heading" aria-level={2}>
              {heading}
            </p>
            <p className="mt-4 max-w-sm text-white/80">{intro}</p>
          </div>

          <ul className="hidden flex-col gap-3 sm:flex">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15"><Check /></span>
                <span className="text-white/90">{p}</span>
              </li>
            ))}
          </ul>

          <div className="relative mt-auto hidden h-44 overflow-hidden rounded-2xl lg:block">
            <Image src="/auth.jpg" alt="Whole spices on a wooden board" fill sizes="40vw" className="object-cover" />
          </div>
        </aside>

        {/* Form card */}
        <div className="flex flex-col justify-center rounded-[2rem] border border-[#1F4D1F]/15 bg-white p-6 shadow-xl sm:p-10">
          <h1 className={`${serif.className} text-4xl font-semibold sm:text-5xl`} style={{ color: GREEN }}>
            {formTitle}
          </h1>
          <div className="mt-8">{children}</div>
          <p className="mt-8 border-t border-[#1F4D1F]/10 pt-6 text-center text-sm text-[#141414]/70">{footer}</p>
        </div>
      </div>
    </main>
  );
}
