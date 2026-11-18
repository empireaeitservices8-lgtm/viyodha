"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";

/**
 * app/our-story/page.tsx  (Viyodha "Our story" page)
 *
 * Animation:
 *  - Hero headline rises line by line on load (the one orchestrated moment)
 *  - A green vine line fills down the timeline as you scroll
 *  - Each chapter's photo is revealed with a curtain wipe when it scrolls into view
 *  - All motion is switched off for visitors who prefer reduced motion
 *
 * Replace the copy and years below with your real story.
 * Images used (already in /public): plantation.jpg, hand_sorting.jpg, dried1.jpg, wood1.jpg
 */

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";

/* ---------------------------------- data ---------------------------------- */

const CHAPTERS = [
  {
    year: "The beginning",
    title: "It started on a hillside farm",
    text: "Viyodha began with a few acres of spice plants and a simple question: why does the cardamom we grew taste so much better than what reached the shops? The answer was in the hands that picked it and the time it was given to dry.",
    img: "/plantation.jpg",
    alt: "Spice plantation in the hills",
  },
  {
    year: "The craft",
    title: "Sorted by hand, one pod at a time",
    text: "Every lot is graded by size, colour and aroma by people who have done this for years. Anything that does not meet the standard is set aside, however small the flaw.",
    img: "/hand_sorting.jpg",
    alt: "Spices being sorted by hand",
  },
  {
    year: "The patience",
    title: "Slow-dried, never rushed",
    text: "We dry our spices gently so the oils stay in the spice and not in the air. It takes longer, and you can smell the difference when you open the pack.",
    img: "/dried1.jpg",
    alt: "Spices drying slowly",
  },
  {
    year: "Today",
    title: "From our farms to kitchens everywhere",
    text: "Today Viyodha supplies wholesalers, retailers and food brands, and sells to home cooks. The scale has grown. The way we work with farmers, and the standard we hold, has not changed.",
    img: "/wood1.jpg",
    alt: "Nutmeg, mace, cinnamon and star anise on a wooden board",
  },
];

const VALUES = [
  { title: "Know the farm", text: "We buy directly, so every batch can be traced back to where it grew." },
  { title: "Pay fairly", text: "Farmers who are paid well look after their land and their crop." },
  { title: "Keep it whole", text: "Whole spices hold their flavour far longer than ground ones." },
];

/* -------------------------------- utilities -------------------------------- */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return reduced;
}

/** true once the element has scrolled into view (stays true afterwards) */
function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

/* --------------------------------- hero ------------------------------------ */

function Hero({ reduced }: { reduced: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 80);
    return () => clearTimeout(t);
  }, []);
  const show = on || reduced;

  const lines = ["Grown with patience,", "shared with care."];

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] px-6 py-20 sm:px-14 sm:py-28" style={{ backgroundColor: TINT }}>
        <h1 className={`${serif.className} text-5xl font-semibold leading-[1.02] sm:text-7xl lg:text-8xl`} style={{ color: GREEN }}>
          {lines.map((l, n) => (
            <span key={l} className="block overflow-hidden pb-2">
              <span
                className="block transition-all duration-1000 ease-out"
                style={{
                  transform: show ? "translateY(0)" : "translateY(110%)",
                  opacity: show ? 1 : 0,
                  transitionDelay: reduced ? "0ms" : `${n * 220}ms`,
                }}
              >
                {l}
              </span>
            </span>
          ))}
        </h1>
        <p
          className="mt-8 max-w-xl text-lg text-[#141414]/75 transition-opacity duration-1000"
          style={{ opacity: show ? 1 : 0, transitionDelay: reduced ? "0ms" : "700ms" }}
        >
          This is the story of how a small hillside farm became Viyodha, and why we still sort, dry and pack our spices the slow way.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------- timeline ---------------------------------- */

function Chapter({ c, index, reduced }: { c: (typeof CHAPTERS)[number]; index: number; reduced: boolean }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const open = seen || reduced;
  const flip = index % 2 === 1;

  return (
    <div ref={ref} className="relative grid gap-8 pl-10 md:grid-cols-2 md:items-center md:gap-16 md:pl-0">
      {/* dot on the vine */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-2 h-4 w-4 -translate-x-1/2 rounded-full border-2 bg-white transition-all duration-700 md:left-1/2 md:top-1/2 md:-translate-y-1/2"
        style={{
          borderColor: GREEN,
          backgroundColor: open ? GREEN : "#fff",
          transform: undefined,
          scale: open ? "1.25" : "1",
        }}
      />

      {/* photo with curtain wipe */}
      <div className={flip ? "md:order-2" : ""}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl" style={{ backgroundColor: TINT }}>
          <div
            className="absolute inset-0 transition-[clip-path,transform] duration-[1400ms] ease-[cubic-bezier(.2,.7,.2,1)]"
            style={{
              clipPath: open ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
              transform: open ? "scale(1)" : "scale(1.15)",
            }}
          >
            <Image src={c.img} alt={c.alt} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
          </div>
        </div>
      </div>

      {/* text */}
      <div
        className={`transition-all duration-1000 ease-out ${flip ? "md:order-1 md:text-right" : ""}`}
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateX(0)" : `translateX(${flip ? "-" : ""}24px)`,
          transitionDelay: reduced ? "0ms" : "250ms",
        }}
      >
        <p className="mb-2 text-sm font-medium text-[#141414]/55">{c.year}</p>
        <h2 className={`${serif.className} text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl`} style={{ color: GREEN }}>
          {c.title}
        </h2>
        <p className={`mt-4 max-w-md text-[#141414]/75 ${flip ? "md:ml-auto" : ""}`}>{c.text}</p>
      </div>
    </div>
  );
}

function Timeline({ reduced }: { reduced: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // Fill the vine as the section scrolls through the viewport
  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const anchor = window.innerHeight * 0.55;
      setProgress(Math.min(1, Math.max(0, (anchor - r.top) / r.height)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <div ref={wrap} className="relative">
        {/* vine track + fill */}
        <div aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-0.5 -translate-x-1/2 bg-[#1F4D1F]/15 md:left-1/2">
          <div className="w-full origin-top" style={{ height: `${progress * 100}%`, backgroundColor: GREEN }} />
        </div>

        <div className="flex flex-col gap-24 md:gap-32">
          {CHAPTERS.map((c, n) => (
            <Chapter key={c.title} c={c} index={n} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- values ----------------------------------- */

function Values({ reduced }: { reduced: boolean }) {
  const [ref, seen] = useInView<HTMLElement>(0.2);
  const open = seen || reduced;

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] rounded-tl-[3.5rem] px-6 py-14 text-white sm:rounded-[2.5rem] sm:rounded-tl-[6rem] sm:px-14 sm:py-20" style={{ backgroundColor: GREEN }}>
        <h2 className={`${serif.className} mb-10 max-w-xl text-4xl font-semibold leading-none sm:text-5xl lg:text-6xl`}>
          What we hold on to
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {VALUES.map((v, n) => (
            <div
              key={v.title}
              className="border-t border-white/30 pt-5 transition-all duration-1000 ease-out"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(20px)",
                transitionDelay: reduced ? "0ms" : `${n * 180}ms`,
              }}
            >
              <h3 className="mb-2 text-lg font-semibold">{v.title}</h3>
              <p className="text-white/80">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- cta ----------------------------------- */

function Cta() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <h2 className={`${serif.className} text-4xl font-semibold leading-tight sm:text-5xl`} style={{ color: GREEN }}>
        Taste the difference for yourself
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-[#141414]/70">
        Shop our whole spices, or get in touch if you are looking for a long-term supplier.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/products"
          className="rounded-full px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]"
          style={{ backgroundColor: GREEN }}
        >
          Shop spices
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-[#1F4D1F] px-7 py-3 text-sm font-medium text-[#1F4D1F] transition-colors hover:bg-[#1F4D1F] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]"
        >
          Send a message
        </Link>
      </div>
    </section>
  );
}

/* ---------------------------------- page ----------------------------------- */

export default function OurStoryPage() {
  const reduced = usePrefersReducedMotion();
  return (
    <main className="bg-white text-[#141414]">
      <Hero reduced={reduced} />
      <Timeline reduced={reduced} />
      <Values reduced={reduced} />
      <Cta />
    </main>
  );
}
