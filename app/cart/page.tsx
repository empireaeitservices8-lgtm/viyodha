"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { api, getImageUrl, CartItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";

const FREE_SHIPPING_ABOVE = 999;

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]";

function Stepper({
  item,
  onIncrement,
  onDecrement,
}: {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const btn = `grid h-9 w-9 place-items-center text-lg text-[#1F4D1F] transition-colors hover:bg-[#EEF3EA] disabled:opacity-30 disabled:hover:bg-transparent ${focusRing}`;
  return (
    <div
      className="inline-flex items-center overflow-hidden rounded-full border border-[#1F4D1F]/30"
      role="group"
      aria-label={`Quantity of ${item.name}`}
    >
      <button
        type="button"
        className={btn}
        aria-label={`Decrease quantity of ${item.name}`}
        onClick={onDecrement}
      >
        &minus;
      </button>
      <span className="min-w-8 text-center text-sm font-medium" aria-live="polite">
        {item.quantity}
      </span>
      <button
        type="button"
        className={btn}
        aria-label={`Increase quantity of ${item.name}`}
        onClick={onIncrement}
      >
        +
      </button>
    </div>
  );
}

function CartRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  const price = Number(item.price);
  const mrp = item.mrp ? Number(item.mrp) : price * 1.2;
  const imageSrc = getImageUrl(item.image);

  return (
    <li className="flex gap-4 rounded-2xl border border-[#1F4D1F]/15 bg-white p-4 sm:gap-6 sm:p-5">
      <div
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28"
        style={{ backgroundColor: TINT }}
      >
        <Image src={imageSrc} alt={item.name} fill sizes="112px" className="object-contain p-2" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-tight">{item.name}</h3>
            <p className="mt-0.5 text-sm text-[#141414]/60">{item.pack || "100g"}</p>
          </div>
          <p className="shrink-0 text-right">
            <span className="block text-lg font-semibold" style={{ color: GREEN }}>
              {inr(price * item.quantity)}
            </span>
            {mrp > price && (
              <span className="block text-sm text-[#141414]/45 line-through">
                {inr(mrp * item.quantity)}
              </span>
            )}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <Stepper item={item} onIncrement={onIncrement} onDecrement={onDecrement} />
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name} from cart`}
            className={`rounded-sm text-sm text-[#141414]/60 underline underline-offset-4 transition-colors hover:text-[#C8221E] ${focusRing}`}
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

function ShippingProgress({ subtotal }: { subtotal: number }) {
  const left = FREE_SHIPPING_ABOVE - subtotal;
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_ABOVE) * 100));
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: TINT }}>
      <p className="text-sm font-medium" style={{ color: GREEN }}>
        {left > 0 ? `Add ${inr(left)} more for free shipping` : "You have unlocked free shipping on this order!"}
      </p>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-white"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Progress to free shipping"
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: GREEN }}
        />
      </div>
    </div>
  );
}

function Summary({ subtotal, savings }: { subtotal: number; savings: number }) {
  const shipping = subtotal >= FREE_SHIPPING_ABOVE ? 0 : 60;
  const total = subtotal + shipping;

  return (
    <aside
      className="rounded-[2rem] rounded-tl-[4rem] p-8 pt-12 text-white lg:sticky lg:top-44 lg:rounded-tl-[5rem]"
      style={{ backgroundColor: GREEN }}
    >
      <h2 className={`${serif.className} text-4xl font-semibold leading-none`}>Order summary</h2>

      <dl className="mt-8 flex flex-col gap-3 text-base">
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

      <Link
        href="/checkout"
        className="mt-8 block rounded-full bg-white py-3.5 text-center text-sm font-semibold text-[#1F4D1F] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Proceed to checkout &middot; {inr(total)}
      </Link>
    </aside>
  );
}

function EmptyCart() {
  return (
    <div
      className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-[2rem] px-6 py-16 text-center"
      style={{ backgroundColor: TINT }}
    >
      <span className="grid h-16 w-16 place-items-center rounded-full bg-white" style={{ color: GREEN }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 6h15l-1.5 9h-12z" />
          <path d="M6 6 5 3H2" />
          <circle cx="9" cy="20" r="1.2" />
          <circle cx="18" cy="20" r="1.2" />
        </svg>
      </span>
      <h2 className={`${serif.className} text-4xl font-semibold`} style={{ color: GREEN }}>
        Your cart is empty
      </h2>
      <p className="max-w-sm text-[#141414]/70">
        Add whole spices from our range and they will show up here.
      </p>
      <Link
        href="/products"
        className={`rounded-full px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 ${focusRing}`}
        style={{ backgroundColor: GREEN }}
      >
        Shop spices
      </Link>
    </div>
  );
}

export default function CartPage() {
  const { user, token, refreshCartCount } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getCart(token);
      setItems(res || []);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleIncrement = async (cartId: number) => {
    try {
      await api.incrementCart(cartId, token || undefined);
      await fetchCart();
      await refreshCartCount();
    } catch (err) {
      console.error("Increment error:", err);
    }
  };

  const handleDecrement = async (cartId: number) => {
    try {
      await api.decrementCart(cartId, token || undefined);
      await fetchCart();
      await refreshCartCount();
    } catch (err) {
      console.error("Decrement error:", err);
    }
  };

  const handleRemove = async (cartId: number) => {
    try {
      await api.removeCartItem(cartId, token || undefined);
      await fetchCart();
      await refreshCartCount();
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + Number(i.price) * i.quantity, 0);
  const savings = items.reduce((n, i) => {
    const mrp = i.mrp ? Number(i.mrp) : Number(i.price);
    return n + Math.max(0, mrp - Number(i.price)) * i.quantity;
  }, 0);

  if (!user && !loading) {
    return (
      <main className="bg-white text-[#141414] py-20">
        <div className="mx-auto max-w-md text-center px-4">
          <h2 className={`${serif.className} text-4xl font-semibold mb-4`} style={{ color: GREEN }}>
            Sign in to view your cart
          </h2>
          <p className="text-[#141414]/70 mb-8">
            Access your saved spices and complete checkout securely.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full px-8 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            Sign in to Viyodha
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white text-[#141414]">
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h1 className={`${serif.className} text-5xl font-semibold leading-none sm:text-6xl`} style={{ color: GREEN }}>
            Your cart
          </h1>
          {items.length > 0 && (
            <p className="text-[#141414]/65">
              {count} {count === 1 ? "item" : "items"}
            </p>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-lg text-[#1F4D1F]">Loading cart...</div>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-10">
            <div className="flex flex-col gap-5">
              <ShippingProgress subtotal={subtotal} />
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <CartRow
                    key={item.cart_id}
                    item={item}
                    onIncrement={() => handleIncrement(item.cart_id)}
                    onDecrement={() => handleDecrement(item.cart_id)}
                    onRemove={() => handleRemove(item.cart_id)}
                  />
                ))}
              </ul>
              <Link
                href="/products"
                className={`self-start rounded-sm text-sm font-medium text-[#1F4D1F] underline underline-offset-4 ${focusRing}`}
              >
                Continue shopping
              </Link>
            </div>

            <Summary subtotal={subtotal} savings={savings} />
          </div>
        )}
      </section>
    </main>
  );
}
