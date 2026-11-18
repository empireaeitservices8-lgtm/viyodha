import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/products";
import ProductDetails from "./ProductDetails";

/**
 * app/products/[slug]/page.tsx  (server component)
 * The page shell renders instantly. The product itself is looked up inside
 * <Suspense>, because the slug (params) is only known per request.
 */

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  return product ? { title: `${product.name} | Viyodha`, description: product.desc } : {};
}

async function ProductContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  return <ProductDetails product={product} />;
}

/** Placeholder shown for a moment while the product loads */
function ProductSkeleton() {
  return (
    <main className="bg-[#EEF3EA]" aria-busy="true">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8 h-4 w-48 animate-pulse rounded bg-[#1F4D1F]/10" />
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="aspect-square animate-pulse rounded-[2rem] bg-white" />
          <div className="flex flex-col gap-5">
            <div className="h-12 w-3/4 animate-pulse rounded bg-[#1F4D1F]/10" />
            <div className="h-8 w-40 animate-pulse rounded bg-[#1F4D1F]/10" />
            <div className="h-20 w-full max-w-lg animate-pulse rounded bg-[#1F4D1F]/10" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
