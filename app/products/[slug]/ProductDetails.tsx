"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond, Barlow_Condensed } from "next/font/google";
import { PRODUCTS, discountOf, type Product as StaticProduct } from "@/lib/products";
import { api, getImageUrl, getProductImagePair, Review, Product as ApiProduct } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BilingualName } from "@/components/BilingualName";
import { toast } from "sonner";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });
const condensed = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";
const RED = "#C8221E";

type ProductDetailsProps = {
  product: StaticProduct | ApiProduct;
};

export default function ProductDetails({ product: initialProduct }: ProductDetailsProps) {
  const { user, refreshCartCount } = useAuth();
  const [product, setProduct] = useState<StaticProduct | ApiProduct>(initialProduct);
  const [selectedPack, setSelectedPack] = useState<"100g" | "200g">("100g");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const p100 = "price100g" in product && product.price100g
    ? Number(product.price100g)
    : Number(product.price);
  const p200 = "price200g" in product && product.price200g
    ? Number(product.price200g)
    : Math.round(p100 * 1.9);
  const currentPrice = selectedPack === "200g" ? p200 : p100;

  const [rawImg1, rawImg2] = getProductImagePair(product);
  const images: string[] = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images.map((img: string) => getImageUrl(img));
    }
    return [getImageUrl(rawImg1), getImageUrl(rawImg2)];
  }, [product, rawImg1, rawImg2]);

  // Automatically cycle through images every 3.5 seconds
  useEffect(() => {
    if (isPaused || images.length <= 1) return;
    const timer = setInterval(() => {
      setSelectedImgIdx((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, images.length]);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const more = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3);

  // Load live reviews and live product details
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const live = await api.getProductById(product.slug);
        if (isMounted && live) {
          const staticProd = PRODUCTS.find((sp) => sp.slug === product.slug);
          const liveImg = live.image?.startsWith("/uploads/") || live.image?.startsWith("http")
            ? live.image
            : (staticProd?.img || live.image);
          setProduct((prev) => ({
            ...prev,
            ...live,
            price: live.price100g || live.price || staticProd?.price || 0,
            price100g: live.price100g || staticProd?.price100g || live.price,
            price200g: live.price200g || staticProd?.price200g || Math.round(Number(live.price || 0) * 1.9),
            image: liveImg,
            img: liveImg,
            image2: live.image2 || ("image2" in prev ? prev.image2 : undefined) || staticProd?.img2,
            img2: live.image2 || ("img2" in prev ? (prev as any).img2 : undefined) || staticProd?.img2,
            images: (live.images && live.images.length > 1) ? live.images : (prev.images || staticProd?.images),
            details: (live.details && live.details.length > 0) ? live.details : staticProd?.details,
          }));
          if (live.reviews) {
            setReviews(live.reviews);
          }
        }
      } catch (err) {
        console.warn("Could not fetch product details from API:", err);
      } finally {
        if (isMounted) setLoadingReviews(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [product.slug]);

  const add = async () => {
    if (!user) {
      toast.error("Please sign in to add spices to your cart.");
      window.location.href = "/login";
      return;
    }

    setAdding(true);
    try {
      const prodId = ("id" in product && product.id) ? product.id : product.slug;
      await api.addToCart(prodId, qty, selectedPack);
      await refreshCartCount();
      setAdded(true);
      toast.success(`${product.name} (${selectedPack} x ${qty}) added to cart!`);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add to cart";
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to leave a review.");
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    setReviewMessage("");
    try {
      const prodId = ("id" in product && product.id) ? product.id : product.slug;
      const res = await api.addReview({
        productId: prodId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      if (res.review) {
        setReviews((prev) => [res.review, ...prev]);
        setReviewComment("");
        setReviewMessage("Thank you! Your review has been added.");
        toast.success("Thank you! Your review has been published.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review";
      setReviewMessage(`Error: ${msg}`);
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Review deleted successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete review";
      toast.error(msg);
    }
  };

  const stepBtn =
    "grid h-11 w-11 place-items-center text-xl text-[#1F4D1F] transition-colors hover:bg-[#1F4D1F] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1F4D1F]";

  const imageSrc = getImageUrl("img" in product ? product.img : (product as ApiProduct).image);
  const detailsList = "details" in product && Array.isArray(product.details) ? product.details : [];

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <main className="text-[#141414]" style={{ backgroundColor: TINT }}>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#141414]/60">
          <Link href="/products" className="hover:underline">Our spices</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-[#141414]">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {/* dual image gallery without outer white background */}
          <div className="flex flex-col gap-4">
            <div
              className="relative aspect-square overflow-hidden rounded-[2rem]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Photo pill badge */}
              <span className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#1F4D1F] shadow-sm backdrop-blur-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span>Photo {selectedImgIdx + 1} of {images.length}</span>
              </span>

              {/* Sliding track */}
              <div
                className="flex h-full w-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${selectedImgIdx * 100}%)` }}
              >
                {images.map((img: string, idx: number) => (
                  <div key={idx} className="relative h-full w-full shrink-0">
                    <Image
                      src={img}
                      alt={`${product.name} photo ${idx + 1}`}
                      fill
                      priority={idx === 0}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-contain p-6 sm:p-10"
                    />
                  </div>
                ))}
              </div>

              {/* Prev / Next buttons */}
              {images.length > 1 && (
                <div className="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none">
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() => setSelectedImgIdx((i) => (i === 0 ? images.length - 1 : i - 1))}
                    className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white/80 text-[#1F4D1F] shadow-md transition hover:bg-[#1F4D1F] hover:text-white"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() => setSelectedImgIdx((i) => (i === images.length - 1 ? 0 : i + 1))}
                    className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white/80 text-[#1F4D1F] shadow-md transition hover:bg-[#1F4D1F] hover:text-white"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnail Selector Strip */}
            {images.length > 1 && (
              <div className={`grid gap-3 sm:gap-4 ${
                images.length === 2 ? "grid-cols-2" :
                images.length === 3 ? "grid-cols-3" :
                "grid-cols-2 sm:grid-cols-4 md:grid-cols-6"
              }`}>
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImgIdx(idx)}
                    className={`group relative flex items-center gap-3 rounded-2xl border-2 p-2.5 transition-all text-left ${
                      selectedImgIdx === idx
                        ? "border-[#1F4D1F] bg-[#1F4D1F]/5 shadow-sm ring-2 ring-[#1F4D1F]/20"
                        : "border-[#1F4D1F]/15 bg-transparent hover:border-[#1F4D1F]/40 hover:bg-[#1F4D1F]/5"
                    }`}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-transparent">
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#1F4D1F]">
                        {idx === 0 ? "Cover View" : `View ${idx + 1}`}
                      </p>
                      <p className="text-sm font-medium text-[#141414]">
                        Image {idx + 1} of {images.length}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* info */}
          <div className="flex flex-col items-start gap-5">
            <h1 className={`${serif.className} text-4xl font-semibold leading-tight sm:text-5xl`} style={{ color: GREEN }}>
              <BilingualName name={product.name} malayalamClassName="text-[0.62em] font-normal normal-case tracking-normal opacity-85 ml-2.5" />
            </h1>

            {avgRating && (
              <div className="flex items-center gap-2 text-sm text-[#141414]/80">
                <span className="flex text-amber-500">
                  {"★".repeat(Math.round(Number(avgRating)))}
                  {"☆".repeat(5 - Math.round(Number(avgRating)))}
                </span>
                <span className="font-semibold">{avgRating}</span>
                <span className="text-[#141414]/50">({reviews.length} reviews)</span>
              </div>
            )}

            {/* Pack Size Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#141414]/60">Select Pack Size</span>
              <div className="flex flex-wrap gap-3" role="group" aria-label="Pack size options">
                <button
                  type="button"
                  onClick={() => setSelectedPack("100g")}
                  className={`rounded-2xl px-6 py-3 text-sm font-bold transition-all ${
                    selectedPack === "100g"
                      ? "bg-[#1F4D1F] text-white shadow-sm ring-2 ring-[#1F4D1F]/20"
                      : "border border-[#1F4D1F]/30 bg-white text-[#1F4D1F] hover:bg-[#EEF3EA]"
                  }`}
                >
                  100 g &middot; Rs. {p100.toFixed(2)}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPack("200g")}
                  className={`rounded-2xl px-6 py-3 text-sm font-bold transition-all ${
                    selectedPack === "200g"
                      ? "bg-[#1F4D1F] text-white shadow-sm ring-2 ring-[#1F4D1F]/20"
                      : "border border-[#1F4D1F]/30 bg-white text-[#1F4D1F] hover:bg-[#EEF3EA]"
                  }`}
                >
                  200 g &middot; Rs. {p200.toFixed(2)}
                </button>
              </div>
            </div>

            {/* Single Price (No MRP, No Strike-through) */}
            <p className={`${condensed.className} text-3xl font-bold text-[#1F4D1F]`}>
              Rs. {currentPrice.toFixed(2)}
              <span className="ml-2 text-base font-normal text-[#141414]/60">/ {selectedPack}</span>
            </p>

            <p className="max-w-lg text-[#141414]/75">
              {"desc" in product ? product.desc : (product as ApiProduct).description}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center overflow-hidden rounded-full border border-[#1F4D1F] bg-white" role="group" aria-label="Quantity">
                <button type="button" className={stepBtn} aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className={`${condensed.className} w-10 text-center text-xl`} aria-live="polite">{qty}</span>
                <button type="button" className={stepBtn} aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
              </div>
              <button
                type="button"
                onClick={add}
                disabled={adding}
                className={`${condensed.className} rounded-full px-12 py-3 text-xl font-bold uppercase text-white transition-opacity hover:opacity-90 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]`}
                style={{ backgroundColor: added ? "#14532d" : GREEN }}
                aria-live="polite"
              >
                {adding ? "Adding..." : added ? "✓ Added to Cart" : "Add to cart"}
              </button>
            </div>

            {detailsList.length > 0 && (
              <dl className="mt-4 grid w-full max-w-lg grid-cols-2 gap-x-6 gap-y-4 border-t border-[#1F4D1F]/15 pt-6">
                {detailsList.map((d) => (
                  <div key={d.label}>
                    <dt className="text-sm text-[#141414]/55">{d.label}</dt>
                    <dd className="font-medium">{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <p className="text-sm text-[#141414]/60">
              Buying in bulk? <Link href="/contact" className="underline" style={{ color: GREEN }}>Send us a message</Link>.
            </p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mt-20 rounded-[2rem] border border-[#1F4D1F]/15 bg-white p-6 sm:p-10" aria-labelledby="reviews-heading">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1F4D1F]/15 pb-6">
            <div>
              <h2 id="reviews-heading" className={`${serif.className} text-3xl font-semibold sm:text-4xl`} style={{ color: GREEN }}>
                Customer Reviews
              </h2>
              <p className="mt-1 text-sm text-[#141414]/60">
                {reviews.length > 0 ? `${reviews.length} review(s) for ${product.name}` : "No reviews yet. Be the first to share your experience!"}
              </p>
            </div>

            {avgRating && (
              <div className="flex items-center gap-3 rounded-2xl bg-[#EEF3EA] px-5 py-3">
                <span className="text-2xl font-bold" style={{ color: GREEN }}>{avgRating}</span>
                <div className="text-xs text-[#141414]/70">
                  <div className="flex text-amber-500">
                    {"★".repeat(Math.round(Number(avgRating)))}
                    {"☆".repeat(5 - Math.round(Number(avgRating)))}
                  </div>
                  <span>Average rating</span>
                </div>
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div className="mt-8 rounded-2xl bg-[#EEF3EA]/60 p-6 sm:p-8">
            <h3 className={`${serif.className} text-2xl font-semibold`} style={{ color: GREEN }}>
              Write a Review
            </h3>

            {user ? (
              <form onSubmit={handleAddReview} className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#141414]/80">Rating</label>
                  <div className="mt-1 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl transition-transform hover:scale-125 ${
                          star <= reviewRating ? "text-amber-500" : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-semibold">{reviewRating} / 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#141414]/80">Your Review</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your thoughts about this spice pod, aroma, flavor or freshness..."
                    className="mt-1 w-full rounded-xl border border-[#1F4D1F]/25 bg-white p-3 text-sm outline-none focus:border-[#1F4D1F] focus:ring-2 focus:ring-[#1F4D1F]/20"
                  />
                </div>

                {reviewMessage && (
                  <p className="text-sm font-medium text-[#1F4D1F]">{reviewMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="self-start rounded-full px-7 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: GREEN }}
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-[#141414]/70">
                  Please{" "}
                  <Link href="/login" className="font-semibold text-[#1F4D1F] underline">
                    sign in
                  </Link>{" "}
                  to write a review.
                </p>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="mt-8 divide-y divide-[#1F4D1F]/10">
            {reviews.map((rev) => (
              <div key={rev.id} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#141414]">{rev.username}</span>
                    <span className="flex text-amber-500 text-sm">
                      {"★".repeat(rev.rating)}
                      {"☆".repeat(5 - rev.rating)}
                    </span>
                    <span className="text-xs text-[#141414]/40">
                      {new Date(rev.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#141414]/80">{rev.comment}</p>
                </div>

                {/* Delete review button (for author or admin) */}
                {(user?.email === rev.user_email || user?.role === "admin") && (
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(rev.id)}
                    className="self-start text-xs font-medium text-[#C8221E] hover:underline"
                  >
                    Delete review
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* more products */}
        <section className="mt-24" aria-labelledby="more">
          <h2 id="more" className={`${serif.className} mb-8 text-3xl font-semibold sm:text-4xl`} style={{ color: GREEN }}>
            You may also like
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {more.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="group flex flex-col items-center text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F4D1F]"
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={p.img}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 30vw, 90vw"
                    className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className={`${condensed.className} mt-2 text-xl font-semibold uppercase`}>
                  <BilingualName name={p.name} />
                </span>
                <span className={`${condensed.className} text-lg`}>Rs. {p.price.toFixed(2)}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
