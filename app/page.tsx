"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

/**
 * app/page.tsx  (Viyodha home page)
 *
 * Setup:
 *  - Copy hero1.jpg, hero2.jpg, hero3.jpg into /public
 *  - Put your 5 short videos in /public/videos/ as 1.mp4 ... 5.mp4
 *  - Replace the placeholder product images/prices/copy below with your own
 *  - Requires Tailwind CSS
 */

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";

/* ---------------------------------- data ---------------------------------- */

const SLIDES = [
  {
    img: "/hero/hero1.jpg",
    fit: "contain" as const,
    title: "Whole spices, picked at their peak",
    text: "Cardamom, cloves, star anise and pepper, graded by hand and sealed fresh for your kitchen.",
  },
  {
    img: "/hero/hero2.jpg",
    fit: "contain" as const,
    title: "Nutmeg, mace and cinnamon, the warm ones",
    text: "Slow-dried and packed whole, so every grate and every stick smells like the first day.",
  },
  {
    img: "/hero/hero3.jpg",
    fit: "contain" as const,
    title: "Bay leaf that still tastes of the tree",
    text: "Dried gently, never rushed, so the leaf keeps its colour and its aroma.",
  },
];

const VIDEOS = [
  { src: "/videos/cardamom.mp4", name: "Green Cardamom 100g", price: 495, mrp: 599, thumb: "/products/cardamom.png" },
  { src: "/videos/pepper.mp4", name: "Black Pepper 100g", price: 349, mrp: 429, thumb: "/products/black_pepper.png" },
  { src: "/videos/nutmeg.mp4", name: "Nutmeg (Whole)", price: 599, mrp: 749, thumb: "/products/nutmeg.png" },
  { src: "/videos/bayleaf.mp4", name: "Bay Leaf 100g", price: 129, mrp: 159, thumb: "/products/bay_leaf.png" },
];

const PRODUCTS = [
  { name: "Green Cardamom", desc: "Plump, aromatic pods graded by size.", img: "/products/cardamom.png", grade: "8mm+", origin: "Idukki" },
  { name: "Cinnamon", desc: "Thin, fragrant quills with a sweet finish.", img: "/products/cinnamon.png", grade: "Ceylon type", origin: "Kerala" },
  { name: "Nutmeg", desc: "Whole nutmeg.", img: "/products/nutmeg.png", grade: "Whole", origin: "Kerala" },
  { name: "Bay Leaf", desc: "Whole leaves, dried slowly to keep their oils.", img: "/products/bay_leaf.png", grade: "Hand-picked", origin: "Kerala" },
];

const COMMITMENTS = [
  { title: "High quality", text: "Every lot is graded and tested before it is packed.", d: "M12 3 4 6v6c0 4.5 3.2 7.7 8 9 4.8-1.3 8-4.5 8-9V6l-8-3Zm-1.5 12L7 11.5l1.4-1.4 2.1 2.1 5.1-5.1L17 8.5 10.5 15Z" },
  { title: "Reliable supply", text: "Direct sourcing from farms keeps stock steady all year.", d: "M3 7h11v9H3V7Zm11 3h4l3 3v3h-7v-6ZM7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" },
  { title: "Long-term partnership", text: "Fair prices for farmers and clear terms for buyers.", d: "M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11Z" },
  { title: "Global market", text: "Export-ready packing, paperwork and shipping support.", d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c1.2 1.4 2 3.6 2.2 6H9.8C10 7.6 10.800 5.400 12 4Zm-7.900 8h3.700c.1 1.400.4 2.700.9 3.900A8 8 0 0 1 4.100 12ZM12 20c-1.200-1.400-2-3.600-2.200-6h4.400c-.2 2.400-1 4.600-2.200 6Z" },
];

const GALLERY = [
  { label: "From the plantation", img: "/plantation.jpg" },
  { label: "Hand-sorted", img: "/hand_sorting.jpg" },
  { label: "Slow-dried", img: "/dried1.jpg" },
  { label: "Packed fresh", img: "/products/black_pepper.png" },
];

/* --------------------------------- icons ---------------------------------- */

const Arrow = ({ dir }: { dir: "l" | "r" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === "l" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
  </svg>
);

const roundBtn =
  "grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#1F4D1F] shadow-md transition-colors hover:bg-[#1F4D1F] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]";

/* ------------------------------ 1. hero carousel --------------------------- */

function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (n: number) => setI((n + SLIDES.length) % SLIDES.length);

  const firstChange = useRef(true);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const delay = firstChange.current ? 2500 : 5500; // first change is quicker
    const t = setTimeout(() => {
      firstChange.current = false;
      setI((n) => (n + 1) % SLIDES.length);
    }, delay);
    return () => clearTimeout(t);
  }, [i, paused]);

  return (
    <section
      className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
      aria-roledescription="carousel"
      aria-label="Featured spices"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-[2rem]" style={{ backgroundColor: TINT }}>
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
          {SLIDES.map((s, n) => (
            <div key={s.img} className="grid w-full shrink-0 md:h-[540px] md:grid-cols-2" aria-hidden={n !== i}>
              <div className="order-2 flex flex-col justify-center gap-5 p-8 pb-16 sm:p-12 md:order-1 md:pb-12">
                <h1 className={`${serif.className} text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl`} style={{ color: GREEN }}>
                  {s.title}
                </h1>
                <p className="max-w-md text-lg text-[#141414]/75">{s.text}</p>
                <div>
                  <Link
                    href="/products"
                    tabIndex={n === i ? 0 : -1}
                    className="inline-block rounded-full px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]"
                    style={{ backgroundColor: GREEN }}
                  >
                    Shop spices
                  </Link>
                </div>
              </div>
              <div className="order-1 m-4 flex items-center justify-center overflow-hidden rounded-3xl bg-white md:order-2">
                <Image
                  src={s.img}
                  alt=""
                  width={0}
                  height={0}
                  priority={n === 0}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="h-auto w-full object-contain md:max-h-[508px]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* controls */}
        <div className="absolute bottom-5 left-8 flex items-center gap-2 sm:left-12">
          {SLIDES.map((_, n) => (
            <button
              key={n}
              type="button"
              aria-label={`Go to slide ${n + 1}`}
              aria-current={n === i}
              onClick={() => go(n)}
              className={`h-2.5 rounded-full transition-all ${n === i ? "w-8 bg-[#1F4D1F]" : "w-2.5 bg-[#1F4D1F]/30"}`}
            />
          ))}
        </div>
        <div className="absolute bottom-4 right-6 hidden gap-2 md:flex">
          <button type="button" aria-label="Previous slide" onClick={() => go(i - 1)} className={roundBtn}><Arrow dir="l" /></button>
          <button type="button" aria-label="Next slide" onClick={() => go(i + 1)} className={roundBtn}><Arrow dir="r" /></button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ 2. video row ------------------------------- */

function VideoCard({ v }: { v: (typeof VIDEOS)[number] }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  // Autoplay while visible, pause when scrolled out of view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? el.play().catch(() => {}) : el.pause()),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article className="relative h-[460px] w-[250px] shrink-0 snap-start overflow-hidden rounded-3xl sm:w-[280px]" style={{ backgroundColor: GREEN }}>
      <video ref={ref} src={v.src} autoPlay muted loop playsInline preload="auto" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} className="absolute inset-0 h-full w-full object-cover" aria-label={v.name} />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Pause video: ${v.name}` : `Play video: ${v.name}`}
        className="absolute inset-0 grid place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
      >
        {!playing && (
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 pl-1 text-[#1F4D1F] shadow-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8L7 4Z" /></svg>
          </span>
        )}
      </button>

      <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-lg">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#EEF3EA]">
          <Image src={v.thumb} alt="" fill sizes="56px" className="object-contain p-1" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#141414]">{v.name}</p>
          <p className="text-sm">
            <span className="font-semibold" style={{ color: GREEN }}>₹{v.price}</span>{" "}
            <span className="text-[#141414]/45 line-through">₹{v.mrp}</span>
          </p>
        </div>
      </div>
    </article>
  );
}

function VideoRow() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className={`${serif.className} text-4xl font-semibold sm:text-5xl`} style={{ color: GREEN }}>
          See them in real kitchens
        </h2>
      </div>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VIDEOS.map((v) => (
          <VideoCard key={v.src} v={v} />
        ))}
      </div>
    </section>
  );
}

/* --------------------- 3. export-style sections (image 5) ------------------ */

function ProductCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className={`${serif.className} text-4xl font-semibold sm:text-5xl`} style={{ color: GREEN }}>
          Premium products, export ready
        </h2>
        <p className="mt-3 text-[#141414]/70">Explore our selection of whole spices, packed to meet the standards of buyers around the world.</p>
      </div>
      <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((p) => (
          <article key={p.name} className="flex flex-col overflow-hidden rounded-2xl border border-[#1F4D1F]/15 bg-white">
            <div className="bg-[#EEF3EA]">
              <Image src={p.img} alt={p.name} width={0} height={0} sizes="(min-width: 1024px) 25vw, 50vw" className="h-auto w-full" />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="text-sm text-[#141414]/70">{p.desc}</p>
              <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-[#1F4D1F]/10 pt-3 text-xs">
                <div><dt className="text-[#141414]/50">Grade</dt><dd className="font-medium">{p.grade}</dd></div>
                <div><dt className="text-[#141414]/50">Origin</dt><dd className="font-medium">{p.origin}</dd></div>
              </dl>
              <Link
                href="/products"
                className="rounded-full border border-[#1F4D1F] py-2 text-center text-sm font-medium text-[#1F4D1F] transition-colors hover:bg-[#1F4D1F] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]"
              >
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WhyBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] rounded-tl-[3.5rem] px-6 pb-36 pt-12 sm:rounded-[2.5rem] sm:rounded-tl-[6rem] sm:px-14 sm:pb-40 sm:pt-14 text-white" style={{ backgroundColor: GREEN }}>
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <h2 className={`${serif.className} text-4xl font-semibold leading-none sm:text-5xl lg:text-6xl`}>Why Viyodha spices?</h2>
          <p className="max-w-lg text-white/85">
            Warm days, cool nights and mineral-rich hill soil give our spices stronger aroma and richer oils. At Viyodha, we work directly with the farms that grow them, so you know where every batch comes from.
          </p>
        </div>
      </div>
      <div className="relative z-10 mx-auto -mt-24 max-w-3xl overflow-hidden rounded-3xl border-4 border-white bg-[#EEF3EA] shadow-xl sm:-mt-28">
        <Image src="/wood1.jpg" alt="Nutmeg, mace, cinnamon and star anise on a wooden board" width={0} height={0} sizes="(min-width: 768px) 768px, 100vw" className="h-auto w-full" />
      </div>
    </section>
  );
}

function Commitment() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 grid gap-4 md:grid-cols-2 md:items-end">
        <h2 className={`${serif.className} text-4xl font-semibold sm:text-5xl`} style={{ color: GREEN }}>Our commitment</h2>
        <p className="max-w-lg text-[#141414]/70 md:justify-self-end">Viyodha holds every order to the same standard, whether it is one jar or one container.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COMMITMENTS.map((c) => (
          <div key={c.title} className="rounded-2xl p-6" style={{ backgroundColor: TINT }}>
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-white" style={{ color: GREEN }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={c.d} /></svg>
            </span>
            <h3 className="mb-1 font-semibold">{c.title}</h3>
            <p className="text-sm text-[#141414]/70">{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Supplier() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-20 sm:px-6 md:grid-cols-[1.2fr_1fr] lg:px-8">
      <div className="relative h-60 overflow-hidden rounded-[2rem] bg-[#EEF3EA] sm:h-72 md:h-80">
        <Image
          src="/wooden2.jpg"
          alt="Whole spices on a wooden board"
          fill
          sizes="(min-width: 768px) 55vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col items-start gap-4">
        <h2 className={`${serif.className} text-4xl font-semibold leading-tight sm:text-5xl`} style={{ color: GREEN }}>
          Viyodha, your trusted spice exporter
        </h2>
        <p className="text-[#141414]/70">Viyodha supplies whole spices to wholesalers, retailers and food brands, with consistent quality, clear documentation and dependable delivery.</p>
        <Link href="/contact" className="rounded-full px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]" style={{ backgroundColor: GREEN }}>
          Send a message
        </Link>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {GALLERY.map((g) => (
          <figure key={g.label}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#EEF3EA]">
              <Image
                src={g.img}
                alt={g.label}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-center text-sm text-[#141414]/70">{g.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function HomePage() {
  return (
    <main className="bg-white text-[#141414]">
      <HeroCarousel />
      <VideoRow />
      <ProductCards />
      <WhyBanner />
      <Commitment />
      <Supplier />
      <Gallery />
    </main>
  );
}
