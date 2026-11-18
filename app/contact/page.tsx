"use client";

import { useState } from "react";
import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import { api } from "@/lib/api";

/**
 * app/contact/page.tsx  (Viyodha contact page)
 *
 * Uses the same palette, serif and shapes as the home page.
 * Needs /public/wooden2.jpg (already used on your home page).
 * The form opens the visitor's email app with the message filled in.
 * To send from your own server instead, replace the body of `onSubmit`
 * with a fetch() call to an API route.
 */

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";

const COMPANY = "Viyodha Trading Private Limited";
const PHONES = [
  { display: "62381 46282", tel: "+916238146282" },
  { display: "79028 53234", tel: "+917902853234" },
];
const EMAIL = "viyodhatradingpvtlimited@gmail.com";
const ADDRESS_LINES = ["MIG 1618, Gandhima Nagar", "Peelamedu, Coimbatore", "Tamil Nadu 641004"];
const MAP_SRC =
  "https://maps.google.com/maps?q=Gandhima+Nagar,+Peelamedu,+Coimbatore+641004&output=embed";

const TOPICS = ["Wholesale order", "Export enquiry", "Private label", "Something else"];

/* --------------------------------- icons ---------------------------------- */

const Icon = ({ d }: { d: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const PHONE_D =
  "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z";
const MAIL_D = "M4 6h16v12H4V6Zm0 0 8 7 8-7";
const PIN_D = "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.800-7 11-7 11Zm0-8.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5Z";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]";

/* ------------------------------ details panel ------------------------------ */

function DetailRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/12 text-white">
        <Icon d={icon} />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-white/60">{label}</p>
        <div className="mt-0.5 text-lg leading-snug text-white">{children}</div>
      </div>
    </div>
  );
}

function DetailsPanel() {
  const link = `rounded-sm underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`;
  return (
    <aside
      className="flex flex-col gap-9 rounded-[2rem] rounded-tl-[4.5rem] p-8 pt-14 text-white sm:p-12 sm:pt-16 lg:rounded-tl-[6rem]"
      style={{ backgroundColor: GREEN }}
    >
      <div>
        <h2 className={`${serif.className} text-4xl font-semibold leading-none sm:text-5xl`}>{COMPANY}</h2>
        <p className="mt-4 max-w-sm text-white/80">
          Call, write or visit. We reply to every enquiry, usually within one working day.
        </p>
      </div>

      <div className="flex flex-col gap-7">
        <DetailRow icon={PHONE_D} label="Call us">
          <ul className="flex flex-col">
            {PHONES.map((p) => (
              <li key={p.tel}>
                <a href={`tel:${p.tel}`} className={link}>{p.display}</a>
              </li>
            ))}
          </ul>
        </DetailRow>

        <DetailRow icon={MAIL_D} label="Email us">
          <a href={`mailto:${EMAIL}`} className={`${link} break-all`}>{EMAIL}</a>
        </DetailRow>

        <DetailRow icon={PIN_D} label="Visit our office">
          <address className="not-italic">
            {ADDRESS_LINES.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
          </address>
        </DetailRow>
      </div>

      <div className="mt-auto flex flex-wrap gap-3 pt-2">
        <a
          href={`https://wa.me/${PHONES[0].tel.replace("+", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-full bg-white px-6 py-3 text-sm font-medium text-[#1F4D1F] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
        >
          Chat on WhatsApp
        </a>
        <a
          href={`tel:${PHONES[0].tel}`}
          className="rounded-full border border-white/50 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-[#1F4D1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Call now
        </a>
      </div>
    </aside>
  );
}

/* ---------------------------------- form ---------------------------------- */

function ContactForm() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name"));
    const phone = String(f.get("phone"));
    const email = String(f.get("email"));
    const message = String(f.get("message"));

    try {
      await api.sendContact({ name, phone, email, message });
      setSent(true);
    } catch {
      const subject = `${topic} from ${name}`;
      const body = [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Topic: ${topic}`,
        "",
        `${message}`,
      ].join("\n");
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setSent(true);
    }
  };

  const field =
    "w-full rounded-xl border border-[#1F4D1F]/25 bg-white px-4 py-3 text-base text-[#141414] outline-none transition-colors placeholder:text-[#141414]/40 focus:border-[#1F4D1F] focus:ring-2 focus:ring-[#1F4D1F]/20";

  return (
    <div className="rounded-[2rem] border border-[#1F4D1F]/15 bg-white p-6 shadow-xl sm:p-10">
      <h2 className={`${serif.className} text-3xl font-semibold sm:text-4xl`} style={{ color: GREEN }}>
        Send us a message
      </h2>
      <p className="mt-2 text-[#141414]/70">Tell us what you need and how much. We will come back with prices and samples.</p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
       
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Your name
            <input name="name" type="text" required autoComplete="name" placeholder="Full name" className={field} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Phone
            <input name="phone" type="tel" required autoComplete="tel" placeholder="+91 98765 43210" className={field} />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={field} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Message
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Which spices, what quantity, and where should we deliver?"
            className={`${field} resize-y`}
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            className={`rounded-full px-8 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 ${focusRing}`}
            style={{ backgroundColor: GREEN }}
          >
            Send message
          </button>
          <p role="status" aria-live="polite" className="text-sm text-[#141414]/70">
            {sent ? "Your email app should open with the message ready to send." : ""}
          </p>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function ContactPage() {
  return (
    <main className="bg-white text-[#141414]">
      {/* Intro */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[2rem] md:min-h-[340px] md:grid-cols-[1.1fr_1fr]" style={{ backgroundColor: TINT }}>
          <div className="flex flex-col justify-center gap-4 p-8 sm:p-12">
            <h1 className={`${serif.className} text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl`} style={{ color: GREEN }}>
              Let&rsquo;s talk spices
            </h1>
            <p className="max-w-md text-lg text-[#141414]/75">
              Whether you need one carton for your shop or a full container for export, tell us what you are looking for.
            </p>
          </div>
          <div className="relative order-first h-52 md:order-last md:h-auto">
            <Image
              src="/contact.jpg"
              alt="Whole spices on a wooden board"
              fill
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Details + form */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-8 lg:py-14">
        <DetailsPanel />
        <ContactForm />
      </section>

      {/* Map */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-[#1F4D1F]/15" style={{ backgroundColor: TINT }}>
          <iframe
            title="Viyodha Trading office location on Google Maps"
            src={MAP_SRC}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[320px] w-full border-0 sm:h-[400px]"
          />
          <div className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-sm text-[#141414]/75">
              MIG 1618, Gandhima Nagar, Peelamedu, Coimbatore 641004
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Gandhima+Nagar+Peelamedu+Coimbatore+641004"
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-sm text-sm font-medium text-[#1F4D1F] underline underline-offset-4 ${focusRing}`}
            >
              Get directions
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
