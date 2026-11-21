"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Cormorant_Garamond, Barlow_Condensed } from "next/font/google";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";
import { api, getImageUrl, getProductImagePair, Product } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });
const condensed = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";
const RED = "#C8221E";

function calculateDiscount(price: number, mrp?: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round((1 - price / mrp) * 100);
}

function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const { user, refreshCartCount } = useAuth();
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const priceNum = Number(p.price);
  const mrpNum = p.mrp ? Number(p.mrp) : undefined;
  const off = calculateDiscount(priceNum, mrpNum);

  const [img1Raw, img2Raw] = getProductImagePair(p);
  const images = [getImageUrl(img1Raw), getImageUrl(img2Raw)];

  // Automatically slide to 2nd image every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev === 0 ? 1 : 0));
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const add = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (adding) return;

    if (!user) {
      toast.error("Please sign in to add spices to your cart.");
      window.location.href = "/login";
      return;
    }

    setAdding(true);
    try {
      await api.addToCart(p.id || p.slug, 1, "100g");
      await refreshCartCount();
      setAdded(true);
      toast.success(`${p.name} added to cart!`);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add to cart";
      toast.error(msg);
    } finally {
      setAdding(false);
    }
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

      {/* Dual Image Auto-sliding Carousel without outer white background */}
      <div
        className="relative aspect-square w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Photo count indicator */}
        <span className="pointer-events-none absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-[#1F4D1F] shadow-sm backdrop-blur-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span>{activeIdx + 1}/2</span>
        </span>

        {/* Sliding carousel track */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeIdx * 100}%)` }}
        >
          <div className="relative h-full w-full shrink-0">
            <Image
              src={images[0]}
              alt={p.name}
              fill
              priority={priority}
              loading={priority ? "eager" : undefined}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="relative h-full w-full shrink-0">
            <Image
              src={images[1]}
              alt={`${p.name} - view 2`}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Dual Image Interactive Switcher Dots */}
        <div className="absolute bottom-2 inset-x-0 z-20 flex justify-center items-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`View image ${idx + 1} of ${p.name}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setActiveIdx(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${activeIdx === idx
                ? "w-6 bg-[#1F4D1F]"
                : "w-2 bg-[#1F4D1F]/30 hover:bg-[#1F4D1F]/70"
                }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex w-full flex-1 flex-col items-center gap-3">
        <h2 className={`${condensed.className} max-w-[18rem] text-2xl font-semibold uppercase leading-tight text-[#141414]`}>
          <Link
            href={`/products/${p.slug}`}
            className="after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F4D1F]"
          >
            {p.name}
          </Link>
        </h2>

        <p className={`${condensed.className} text-xl text-[#141414]`}>
          Rs. {priceNum.toFixed(2)}
          {mrpNum && mrpNum > priceNum && (
            <span className="ml-3 text-base font-semibold text-[#141414]/70 line-through">
              Rs. {mrpNum.toFixed(2)}
            </span>
          )}
        </p>

        <button
          type="button"
          onClick={add}
          disabled={adding}
          className={`${condensed.className} relative z-10 mt-auto rounded-full px-10 py-3 text-xl font-bold uppercase text-white transition-all hover:opacity-90 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]`}
          style={{ backgroundColor: added ? "#14532d" : GREEN }}
          aria-live="polite"
        >
          {adding ? "Adding..." : added ? "✓ Added" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Transform static products as initial fallback
  const initialProducts: Product[] = STATIC_PRODUCTS.map((p, idx) => ({
    id: idx + 1,
    name: p.name,
    slug: p.slug,
    price: p.price,
    mrp: p.mrp,
    description: p.desc,
    category: "Whole Spices",
    brand: "Viyodha",
    type: "Spices",
    image: p.img,
    image2: p.img2,
    images: p.images || (p.img2 ? [p.img, p.img2] : [p.img]),
    details: p.details,
  }));

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      setLoading(true);
      try {
        const fetched = await api.getAllProducts({
          search: query || undefined,
          category: activeCategory !== "All" ? activeCategory : undefined,
        });
        if (isMounted && fetched && fetched.length > 0) {
          // Merge fetched products with local products.ts definitions to preserve img2 and custom images
          const merged = fetched.map((f) => {
            const staticProd = STATIC_PRODUCTS.find((sp) => sp.slug === f.slug);
            const resolvedImg = f.image?.startsWith("/uploads/") || f.image?.startsWith("http")
              ? f.image
              : (staticProd?.img || f.image || "/products/cardamom.png");
            return {
              ...f,
              name: f.name || staticProd?.name || "",
              description: f.description || staticProd?.desc || "",
              image: resolvedImg,
              image2: f.image2 || staticProd?.img2,
              images: (f.images && f.images.length > 1)
                ? f.images
                : (staticProd?.images || (staticProd?.img2 ? [staticProd.img, staticProd.img2] : undefined)),
              details: f.details && f.details.length > 0 ? f.details : staticProd?.details,
            };
          });
          setProducts(merged);
        }
      } catch (err) {
        console.warn("Could not fetch products from backend, using local data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [query, activeCategory]);

  const filtered = query.trim()
    ? products.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase())
    )
    : products;

  return (
    <main className="text-[#141414]" style={{ backgroundColor: TINT }}>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className={`${serif.className} text-5xl font-semibold sm:text-6xl`} style={{ color: GREEN }}>
            Our spices
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[#141414]/70">
            {query ? `Showing results for "${query}"` : "Whole spices, graded by hand and sealed fresh."}
          </p>

          {/* Quick filter pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {["All", "Cardamom", "Pepper", "Cloves", "Nutmeg", "Cinnamon", "Bay Leaf", "Star Anise", "Mace"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat === "All" ? "All" : cat)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${activeCategory === cat || (cat === "All" && activeCategory === "All")
                  ? "bg-[#1F4D1F] text-white"
                  : "border border-[#1F4D1F]/25 bg-white text-[#1F4D1F] hover:bg-[#1F4D1F]/10"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {loading && products.length === 0 ? (
          <div className="py-20 text-center text-lg text-[#1F4D1F]">Loading fresh spices...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-[#141414]/70">No spices found matching your search.</p>
            <Link
              href="/products"
              onClick={() => setActiveCategory("All")}
              className="mt-4 inline-block rounded-full bg-[#1F4D1F] px-6 py-2.5 text-sm font-medium text-white"
            >
              View all spices
            </Link>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, idx) => (
              <ProductCard key={p.slug || p.id} p={p} priority={idx < 6} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EEF3EA] flex items-center justify-center text-[#1F4D1F]">Loading spices...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
