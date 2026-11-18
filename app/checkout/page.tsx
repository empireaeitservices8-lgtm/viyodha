"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

/**
 * app/checkout/page.tsx  (Viyodha checkout page)
 *
 * The order items are sample data. Replace `ITEMS` with your real cart.
 * `onSubmit` only shows a confirmation: connect it to your payment gateway
 * (Razorpay, PhonePe, Cashfree, etc.) and your order API.
 */

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";

/** Placeholders: change to match your shipping policy. */
const FREE_SHIPPING_ABOVE = 999;
const SHIPPING_FEE = 60;

const ITEMS = [
  { id: "cardamom", name: "Green Cardamom", pack: "100g", price: 495, mrp: 599, qty: 1, img: "/products/cardamom.png" },
  { id: "pepper", name: "Black Pepper", pack: "100g", price: 349, mrp: 429, qty: 2, img: "/products/black_pepper.png" },
  { id: "bayleaf", name: "Bay Leaf", pack: "100g", price: 129, mrp: 159, qty: 1, img: "/products/bay_leaf.png" },
];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const PAYMENTS = [
  { id: "upi", title: "UPI", text: "Pay with GPay, PhonePe, Paytm or any UPI app." },
  { id: "card", title: "Credit or debit card", text: "Visa, Mastercard and RuPay." },
  { id: "netbanking", title: "Net banking", text: "Pay from your bank account." },
  { id: "cod", title: "Cash on delivery", text: "Pay when your order arrives." },
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]";

const field =
  "w-full rounded-xl border border-[#1F4D1F]/25 bg-white px-4 py-3 text-base text-[#141414] outline-none transition-colors placeholder:text-[#141414]/40 focus:border-[#1F4D1F] focus:ring-2 focus:ring-[#1F4D1F]/20";

/* --------------------------------- pieces --------------------------------- */

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-[#1F4D1F]/15 bg-white p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-base font-semibold text-white" style={{ backgroundColor: GREEN }}>
          {n}
        </span>
        <h2 className={`${serif.className} text-3xl font-semibold sm:text-4xl`} style={{ color: GREEN }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium ${className}`}>
      {label}
      {children}
    </label>
  );
}

function Summary({ subtotal, savings, shipping, total }: { subtotal: number; savings: number; shipping: number; total: number }) {
  return (
    <aside
      className="rounded-[2rem] rounded-tl-[4rem] p-8 pt-12 text-white lg:sticky lg:top-44 lg:rounded-tl-[5rem]"
      style={{ backgroundColor: GREEN }}
    >
      <h2 className={`${serif.className} text-4xl font-semibold leading-none`}>Your order</h2>

      <ul className="mt-8 flex flex-col gap-4">
        {ITEMS.map((i) => (
          <li key={i.id} className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
              <Image src={i.img} alt="" fill sizes="64px" className="object-contain p-1.5" />
              <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-[#141414]/80 px-1 text-xs">{i.qty}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{i.name}</p>
              <p className="text-sm text-white/65">{i.pack}</p>
            </div>
            <p className="shrink-0">{inr(i.price * i.qty)}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-8 flex flex-col gap-3 border-t border-white/25 pt-6">
        <div className="flex justify-between gap-4">
          <dt className="text-white/75">Subtotal</dt>
          <dd>{inr(subtotal)}</dd>
        </div>
        {savings > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-white/75">You save</dt>
            <dd>&minus;{inr(savings)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-white/75">Shipping</dt>
          <dd>{shipping === 0 ? "Free" : inr(shipping)}</dd>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-white/25 pt-5">
          <dt className="text-lg">Total</dt>
          <dd className={`${serif.className} text-4xl font-semibold`}>{inr(total)}</dd>
        </div>
      </dl>

      <button
        type="submit"
        className="mt-8 w-full rounded-full bg-white py-3.5 text-sm font-medium text-[#1F4D1F] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Place order &middot; {inr(total)}
      </button>
      <p className="mt-4 text-center text-sm text-white/65">Prices include applicable taxes.</p>
    </aside>
  );
}

function Confirmation({ name }: { name: string }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-[2rem] px-6 py-16 text-center" style={{ backgroundColor: TINT }}>
      <span className="grid h-16 w-16 place-items-center rounded-full text-white" style={{ backgroundColor: GREEN }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 12.500 4.500 4.500L19 7.500" />
        </svg>
      </span>
      <h1 className={`${serif.className} text-4xl font-semibold sm:text-5xl`} style={{ color: GREEN }}>Thank you, {name}</h1>
      <p className="max-w-sm text-[#141414]/70">Your order is placed. We will send the details and tracking to your email and phone.</p>
      <Link href="/products" className={`rounded-full px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 ${focusRing}`} style={{ backgroundColor: GREEN }}>
        Continue shopping
      </Link>
    </div>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function CheckoutPage() {
  const [payment, setPayment] = useState("upi");
  const [placedBy, setPlacedBy] = useState<string | null>(null);

  const subtotal = ITEMS.reduce((n, i) => n + i.price * i.qty, 0);
  const savings = ITEMS.reduce((n, i) => n + (i.mrp - i.price) * i.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    // TODO: send `f` + `payment` + items to your order API / payment gateway.
    setPlacedBy(String(f.get("name")).split(" ")[0] || "there");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (placedBy) {
    return (
      <main className="bg-white px-4 py-16 text-[#141414] sm:px-6 lg:px-8">
        <Confirmation name={placedBy} />
      </main>
    );
  }

  return (
    <main className="bg-white text-[#141414]">
      <form onSubmit={onSubmit} className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h1 className={`${serif.className} text-5xl font-semibold leading-none sm:text-6xl`} style={{ color: GREEN }}>Checkout</h1>
          <Link href="/cart" className={`rounded-sm text-sm font-medium text-[#1F4D1F] underline underline-offset-4 ${focusRing}`}>
            Back to cart
          </Link>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
          <div className="flex flex-col gap-6">
            <Section n={1} title="Contact">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email">
                  <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={field} />
                </Field>
                <Field label="Phone">
                  <input name="phone" type="tel" required autoComplete="tel" pattern="[+0-9 ]{10,15}" title="Enter a valid phone number" placeholder="+91 98765 43210" className={field} />
                </Field>
              </div>
            </Section>

            <Section n={2} title="Delivery address">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" className="sm:col-span-2">
                  <input name="name" type="text" required autoComplete="name" placeholder="Full name" className={field} />
                </Field>
                <Field label="Address" className="sm:col-span-2">
                  <input name="address" type="text" required autoComplete="address-line1" placeholder="House number, street, area" className={field} />
                </Field>
                <Field label="Landmark (optional)" className="sm:col-span-2">
                  <input name="landmark" type="text" autoComplete="address-line2" placeholder="Near temple, opposite school, etc." className={field} />
                </Field>
                <Field label="City">
                  <input name="city" type="text" required autoComplete="address-level2" placeholder="City" className={field} />
                </Field>
                <Field label="State">
                  <select name="state" required defaultValue="" autoComplete="address-level1" className={field}>
                    <option value="" disabled>Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="PIN code">
                  <input name="pin" type="text" inputMode="numeric" required autoComplete="postal-code" pattern="[0-9]{6}" title="Enter a 6-digit PIN code" placeholder="641004" className={field} />
                </Field>
                <Field label="GST number (optional)">
                  <input name="gst" type="text" autoComplete="off" placeholder="For business orders" className={`${field} uppercase placeholder:normal-case`} />
                </Field>
              </div>
            </Section>

            <Section n={3} title="Payment">
              <fieldset>
                <legend className="sr-only">Payment method</legend>
                <div className="flex flex-col gap-3">
                  {PAYMENTS.map((p) => (
                    <label key={p.id} className="block cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value={p.id}
                        checked={payment === p.id}
                        onChange={() => setPayment(p.id)}
                        className="peer sr-only"
                      />
                      <div className="flex items-center gap-4 rounded-2xl border border-[#1F4D1F]/20 p-4 transition-colors hover:bg-[#EEF3EA]/60 peer-checked:border-[#1F4D1F] peer-checked:bg-[#EEF3EA] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#1F4D1F]">
                        <span
                          className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-[#1F4D1F]/50"
                          aria-hidden="true"
                        >
                          {payment === p.id && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GREEN }} />}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium">{p.title}</span>
                          <span className="block text-sm text-[#141414]/65">{p.text}</span>
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>
            </Section>
          </div>

          <Summary subtotal={subtotal} savings={savings} shipping={shipping} total={total} />
        </div>
      </form>
    </main>
  );
}
