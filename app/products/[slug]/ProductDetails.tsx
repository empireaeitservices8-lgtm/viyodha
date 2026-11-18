"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond, Barlow_Condensed } from "next/font/google";
import { PRODUCTS, discountOf, type Product } from "@/lib/products";

/**
 * app/products/[slug]/ProductDetails.tsx  (client component)
 * Interactive part of the product details page.
 */

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });
const condensed = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";
const RED = "#C8221E";

export default function ProductDetails({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const off = discountOf(product);
  const more = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3);

  const add = () => {
    // TODO: connect to your cart (context, Shopify, etc.) using `qty`
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const stepBtn =
    "grid h-11 w-11 place-items-center text-xl text-[#1F4D1F] transition-colors hover:bg-[#1F4D1F] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1F4D1F]";

  return (
    <main className="text-[#141414]" style={{ backgroundColor: TINT }}>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#141414]/60">
          <Link href="/products" className="hover:underline">Our spices</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-[#141414]">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {/* image */}
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white">
            {off > 0 && (
              <span
                className={`${condensed.className} absolute left-4 top-4 z-10 grid h-16 w-16 place-items-center rounded-full text-center text-lg font-bold leading-[1.05] text-white`}
                style={{ backgroundColor: RED }}
              >
                <span>
                  {off}%
                  <br />
                  OFF
                </span>
              </span>
            )}
            <Image src={product.img} alt={product.name} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-10" />
          </div>

          {/* info */}
          <div className="flex flex-col items-start gap-5">
            <h1 className={`${serif.className} text-4xl font-semibold leading-tight sm:text-5xl`} style={{ color: GREEN }}>
              {product.name}
            </h1>

            <p className={`${condensed.className} text-3xl`}>
              Rs. {product.price.toFixed(2)}
              {product.mrp && <span className="ml-3 text-xl font-semibold text-[#141414]/60 line-through">Rs. {product.mrp.toFixed(2)}</span>}
            </p>

            <p className="max-w-lg text-[#141414]/75">{product.desc}</p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center overflow-hidden rounded-full border border-[#1F4D1F] bg-white" role="group" aria-label="Quantity">
                <button type="button" className={stepBtn} aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className={`${condensed.className} w-10 text-center text-xl`} aria-live="polite">{qty}</span>
                <button type="button" className={stepBtn} aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
              </div>
              <button
                type="button"
                onClick={add}
                className={`${condensed.className} rounded-full px-12 py-3 text-xl font-bold uppercase text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]`}
                style={{ backgroundColor: GREEN }}
                aria-live="polite"
              >
                {added ? "Added" : "Add to cart"}
              </button>
            </div>

            <dl className="mt-4 grid w-full max-w-lg grid-cols-2 gap-x-6 gap-y-4 border-t border-[#1F4D1F]/15 pt-6">
              {product.details.map((d) => (
                <div key={d.label}>
                  <dt className="text-sm text-[#141414]/55">{d.label}</dt>
                  <dd className="font-medium">{d.value}</dd>
                </div>
              ))}
            </dl>

            <p className="text-sm text-[#141414]/60">Buying in bulk? <Link href="/contact" className="underline" style={{ color: GREEN }}>Send us a message</Link>.</p>
          </div>
        </div>

        {/* more products */}
        <section className="mt-24" aria-labelledby="more">
          <h2 id="more" className={`${serif.className} mb-8 text-3xl font-semibold sm:text-4xl`} style={{ color: GREEN }}>
            You may also like
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {more.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`} className="group flex flex-col items-center text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F4D1F]">
                <div className="relative aspect-square w-full">
                  <Image src={p.img} alt="" fill sizes="(min-width: 640px) 30vw, 90vw" className="object-contain p-6 transition-transform duration-500 group-hover:scale-105" />
                </div>
                <span className={`${condensed.className} mt-2 text-xl font-semibold uppercase`}>{p.name}</span>
                <span className={`${condensed.className} text-lg`}>Rs. {p.price.toFixed(2)}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
