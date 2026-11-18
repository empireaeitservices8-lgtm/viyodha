"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond, Barlow_Condensed } from "next/font/google";
import { PRODUCTS, discountOf, type Product } from "@/lib/products";

/**
 * app/products/page.tsx  (Viyodha products page)
 * Data lives in lib/products.ts. Clicking a card opens /products/[slug].
 */

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });
const condensed = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";
const RED = "#C8221E";

function ProductCard({ p }: { p: Product }) {
  const [added, setAdded] = useState(false);
  const off = discountOf(p);

  const add = () => {
    // TODO: connect to your cart (context, Shopify, etc.)
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="group relative flex flex-col items-center text-center">
      {off > 0 && (
        <span
          className={`${condensed.className} pointer-events-none absolute -top-3 left-1 z-10 grid h-16 w-16 place-items-center rounded-full text-center text-lg font-bold leading-[1.05] text-white sm:left-4`}
          style={{ backgroundColor: RED }}
        >
          <span>
            {off}%
            <br />
            OFF
          </span>
        </span>
      )}

      <div className="relative aspect-square w-full">
        <Image
          src={p.img}
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="mt-6 flex w-full flex-1 flex-col items-center gap-3">
        {/* stretched link: the whole card opens the details page */}
        <h2 className={`${condensed.className} max-w-[18rem] text-2xl font-semibold uppercase leading-tight text-[#141414]`}>
          <Link
            href={`/products/${p.slug}`}
            className="after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F4D1F]"
          >
            {p.name}
          </Link>
        </h2>
        <p className={`${condensed.className} text-xl text-[#141414]`}>
          Rs. {p.price.toFixed(2)}
          {p.mrp && <span className="ml-3 text-base font-semibold text-[#141414]/70 line-through">Rs. {p.mrp.toFixed(2)}</span>}
        </p>

        <button
          type="button"
          onClick={add}
          className={`${condensed.className} relative z-10 mt-auto rounded-full px-10 py-3 text-xl font-bold uppercase text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]`}
          style={{ backgroundColor: GREEN }}
          aria-live="polite"
        >
          {added ? "Added" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

export default function ProductsPage() {
  return (
    <main className="text-[#141414]" style={{ backgroundColor: TINT }}>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <header className="mb-16 text-center">
          <h1 className={`${serif.className} text-5xl font-semibold sm:text-6xl`} style={{ color: GREEN }}>
            Our spices
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[#141414]/70">Whole spices, graded by hand and sealed fresh.</p>
        </header>

        <div className="grid gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
