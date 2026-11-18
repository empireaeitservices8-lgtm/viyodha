import Image from "next/image";
import Link from "next/link";

/**
 * Footer for Viyodha
 *
 * Usage (app/layout.tsx):
 *   import Header from "@/components/Header";
 *   import Footer from "@/components/Footer";
 *   ...
 *   <Header />{children}<Footer />
 */

const COMPANY = "VIYODHA TRADING PRIVATE LIMITED";
// Fixed year: avoids new Date() during prerender (Next.js cacheComponents). Update once a year.
const YEAR = 2026;
const EMAIL = "viyodhatradingpvtlimited@gmail.com";
const PHONES = [
  { display: "62381 46282", tel: "+916238146282" },
  { display: "79028 53234", tel: "+917902853234" },
];
const ADDRESS = ["MIG1618, Gandhima Nagar", "Peelamedu, Coimbatore - 641004", "Tamil Nadu, India"];
const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("MIG1618, Gandhima Nagar, Peelamedu, Coimbatore 641004, Tamil Nadu");

const EXPLORE = [
  { label: "Our Story", href: "/our-story" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
];

const SPICES = [
  { label: "Green Cardamom", slug: "green-cardamom" },
  { label: "Black Pepper", slug: "black-pepper" },
  { label: "Star Anise", slug: "star-anise" },
  { label: "Nutmeg", slug: "nutmeg" },
  { label: "Cinnamon", slug: "cinnamon" },
  { label: "Bay Leaf", slug: "bay-leaf" },
  { label: "Mace", slug: "mace" },
  { label: "Cloves", slug: "cloves" },
];

const linkClass =
  "text-white/75 transition-colors hover:text-white focus-visible:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0 text-white/60">
      <path d={d} />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#1F4D1F] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.9fr_1.4fr] lg:px-8">
        {/* Brand */}
        <div>
          {/* White tile keeps the green logo readable on the green footer */}
          <Link
            href="/"
            aria-label="Viyodha home"
            className="inline-flex rounded-3xl bg-white p-4 shadow-lg shadow-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Image
              src="/logo.png"
              alt="Viyodha – Nurture, Grow, Thrive"
              width={240}
              height={160}
              className="h-28 w-auto object-contain mix-blend-multiply"
            />
          </Link>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/75">
            Whole spices from Kerala, graded, packed and shipped with care.
          </p>
        </div>

        {/* Explore */}
        <nav aria-label="Footer">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">Explore</h2>
          <ul className="flex flex-col gap-3 text-sm">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkClass}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Spices */}
        <nav aria-label="Spices">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">Our spices</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm lg:grid-cols-1">
            {SPICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/products/${s.slug}`} className={linkClass}>{s.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">Contact</h2>
          <address className="flex flex-col gap-4 text-sm not-italic">
            <p className="font-semibold">{COMPANY}</p>

            <div className="flex gap-3">
              <Icon d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.100 2h3a2 2 0 0 1 2 1.700c.1 1 .4 1.900.7 2.800a2 2 0 0 1-.5 2.100L8.100 9.900a16 16 0 0 0 6 6l1.300-1.300a2 2 0 0 1 2.100-.4c.9.3 1.800.6 2.800.7a2 2 0 0 1 1.700 2Z" />
              <div className="flex flex-col gap-1">
                {PHONES.map((p) => (
                  <a key={p.tel} href={`tel:${p.tel}`} className={linkClass}>{p.display}</a>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Icon d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm18 3-10 7L2 7" />
              <a href={`mailto:${EMAIL}`} className={`${linkClass} break-all`}>{EMAIL}</a>
            </div>

            <div className="flex gap-3">
              <Icon d="M12 21s7-6.100 7-11a7 7 0 1 0-14 0c0 4.900 7 11 7 11Zm0-8.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5Z" />
              <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {ADDRESS.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </a>
            </div>
          </address>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {YEAR} {COMPANY}. All rights reserved.</p>
          <p>Coimbatore, Tamil Nadu, India</p>
        </div>
      </div>
    </footer>
  );
}
