"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { api, getImageUrl, CartItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BilingualName } from "@/components/BilingualName";
import { toast } from "sonner";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";

const FREE_SHIPPING_ABOVE = 999;
const SHIPPING_FEE = 60;

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const PAYMENTS = [
  { id: "cod", title: "Cash on delivery", text: "Pay in cash when your fresh spices are delivered to your doorstep." },
  { id: "online_upi", title: "Online Payment (UPI)", text: "Fast & instant with Google Pay, PhonePe, Paytm, or UPI ID." },
  { id: "online_card", title: "Online Payment (Credit / Debit Card)", text: "Visa, Mastercard, RuPay & international cards." },
  { id: "online_netbanking", title: "Online Payment (Net Banking)", text: "Direct transfer from SBI, HDFC, ICICI, Axis and all major Indian banks." },
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]";

const field =
  "w-full rounded-xl border border-[#1F4D1F]/25 bg-white px-4 py-3 text-base text-[#141414] outline-none transition-colors placeholder:text-[#141414]/40 focus:border-[#1F4D1F] focus:ring-2 focus:ring-[#1F4D1F]/20";

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-[#1F4D1F]/15 bg-white p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-base font-semibold text-white" style={{ backgroundColor: GREEN }}>
          {n}
        </span>
        <h2 className={`${serif.className} text-3xl font-semibold sm:text-4xl`} style={{ color: GREEN }}>
          {title}
        </h2>
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

export default function CheckoutPage() {
  const { user, token, refreshCartCount } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState("cod");
  const [placedOrder, setPlacedOrder] = useState<{ id: number; name: string } | null>(null);
  const [error, setError] = useState("");

  // Form fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Kochi");
  const [state, setState] = useState("Kerala");
  const [pin, setPin] = useState("682001");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setName(user.username || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    async function loadCart() {
      if (!token) {
        setItems([]);
        setLoading(false);
        return;
      }
      try {
        const cart = await api.getCart(token);
        if (isMounted) setItems(cart || []);
      } catch (err) {
        console.error("Checkout cart fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCart();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const subtotal = items.reduce((n, i) => n + Number(i.price) * i.quantity, 0);
  const savings = items.reduce((n, i) => {
    const mrp = i.mrp ? Number(i.mrp) : Number(i.price);
    return n + Math.max(0, mrp - Number(i.price)) * i.quantity;
  }, 0);
  const shipping = subtotal >= FREE_SHIPPING_ABOVE || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!items || items.length === 0) {
      const msg = "Your cart is empty. Please add spices before checking out.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!address.trim() || !phone.trim() || !name.trim()) {
      const msg = "Please fill in your name, contact phone and delivery address.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.product_id,
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
        image: i.image,
        pack: i.pack || "100g",
      }));

      const paymentMethodName =
        payment === "cod"
          ? "Cash on Delivery"
          : payment === "online_upi"
          ? "Online Payment (UPI)"
          : payment === "online_card"
          ? "Online Payment (Card)"
          : "Online Payment (Net Banking)";

      const res = await api.createOrder(
        {
          username: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pin: pin.trim(),
          paymentMethod: paymentMethodName,
          items: orderItems,
          subtotal,
          shippingFee: shipping,
          totalAmount: total,
        },
        token || undefined
      );

      await refreshCartCount();
      toast.success("Order placed successfully! Thank you for choosing Viyodha.");
      setPlacedOrder({
        id: res.order.id,
        name: name.split(" ")[0] || "Valued Customer",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <main className="bg-white px-4 py-20 text-[#141414] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-[2rem] px-6 py-16 text-center" style={{ backgroundColor: TINT }}>
          <span className="grid h-16 w-16 place-items-center rounded-full text-white" style={{ backgroundColor: GREEN }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 12.500 4.500 4.500L19 7.500" />
            </svg>
          </span>
          <h1 className={`${serif.className} text-4xl font-semibold sm:text-5xl`} style={{ color: GREEN }}>
            Thank you, {placedOrder.name}!
          </h1>
          <p className="max-w-sm text-[#141414]/75">
            Your order <strong>#{placedOrder.id}</strong> has been confirmed. We have dispatched the preparation details to our packing team.
          </p>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <Link
              href="/orders"
              className={`rounded-full px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${focusRing}`}
              style={{ backgroundColor: GREEN }}
            >
              Track Order Status
            </Link>
            <Link
              href="/products"
              className={`rounded-full border border-[#1F4D1F] bg-white px-8 py-3 text-sm font-semibold text-[#1F4D1F] hover:bg-[#EEF3EA] ${focusRing}`}
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!user && !loading) {
    return (
      <main className="bg-white px-4 py-20 text-[#141414]">
        <div className="mx-auto max-w-md text-center">
          <h2 className={`${serif.className} text-4xl font-semibold mb-4`} style={{ color: GREEN }}>
            Please sign in to checkout
          </h2>
          <p className="text-[#141414]/70 mb-6">
            Sign in to complete your spice order and track your delivery.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full px-8 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            Sign in to continue
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white text-[#141414]">
      <form onSubmit={onSubmit} className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h1 className={`${serif.className} text-5xl font-semibold leading-none sm:text-6xl`} style={{ color: GREEN }}>
            Checkout
          </h1>
          <Link href="/cart" className={`rounded-sm text-sm font-medium text-[#1F4D1F] underline underline-offset-4 ${focusRing}`}>
            Back to cart
          </Link>
        </div>

        {error && (
          <div className="mb-8 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
          <div className="flex flex-col gap-6">
            <Section n={1} title="Contact Details">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email address">
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={field}
                  />
                </Field>
                <Field label="Contact Phone">
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={field}
                  />
                </Field>
              </div>
            </Section>

            <Section n={2} title="Delivery Address">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" className="sm:col-span-2">
                  <input
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className={field}
                  />
                </Field>
                <Field label="House / Flat / Street address" className="sm:col-span-2">
                  <input
                    name="address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House number, street name, locality"
                    className={field}
                  />
                </Field>
                <Field label="City">
                  <input
                    name="city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className={field}
                  />
                </Field>
                <Field label="State">
                  <select
                    name="state"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={field}
                  >
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="PIN code">
                  <input
                    name="pin"
                    type="text"
                    inputMode="numeric"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    pattern="[0-9]{6}"
                    title="Enter a valid 6-digit PIN code"
                    placeholder="682001"
                    className={field}
                  />
                </Field>
              </div>
            </Section>

            <Section n={3} title="Payment Method">
              <fieldset>
                <legend className="sr-only">Payment option</legend>
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

          {/* Right Summary */}
          <aside
            className="rounded-[2rem] rounded-tl-[4rem] p-8 pt-12 text-white lg:sticky lg:top-44 lg:rounded-tl-[5rem]"
            style={{ backgroundColor: GREEN }}
          >
            <h2 className={`${serif.className} text-4xl font-semibold leading-none`}>Your order</h2>

            {items.length === 0 ? (
              <p className="mt-8 text-white/70">Your cart is empty.</p>
            ) : (
              <ul className="mt-8 flex flex-col gap-4 max-h-80 overflow-y-auto pr-1">
                {items.map((i) => (
                  <li key={i.cart_id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                      <Image src={getImageUrl(i.image)} alt={i.name} fill sizes="64px" className="object-contain p-1.5" />
                      <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-[#141414]/80 px-1 text-xs">
                        {i.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        <BilingualName name={i.name} />
                      </p>
                      <p className="text-sm text-white/65">{i.pack || "100g"}</p>
                    </div>
                    <p className="shrink-0">{inr(Number(i.price) * i.quantity)}</p>
                  </li>
                ))}
              </ul>
            )}

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
              disabled={submitting || items.length === 0}
              className="mt-8 w-full rounded-full bg-white py-3.5 text-sm font-bold text-[#1F4D1F] transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {submitting ? "Placing Order..." : `Place order · ${inr(total)}`}
            </button>
            <p className="mt-4 text-center text-sm text-white/65">Prices include all applicable taxes.</p>
          </aside>
        </div>
      </form>
    </main>
  );
}
