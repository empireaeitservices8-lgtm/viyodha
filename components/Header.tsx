"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

/**
 * Header for Viyodha
 *
 * Colors are taken from the logo:
 *   leaf green  #1F4D1F
 *   ink         #141414
 *
 * Search: pressing Enter opens the product page when exactly one spice matches,
 * otherwise opens /products?q=... (the products page filters by that query).
 */

const COLORS = {
  green: "#1F4D1F",
  ink: "#141414",
};

const PRODUCTS = [
  { label: "Green Cardamom", slug: "green-cardamom" },
  { label: "Black Pepper", slug: "black-pepper" },
  { label: "Star Anise", slug: "star-anise" },
  { label: "Nutmeg", slug: "nutmeg" },
  { label: "Cinnamon", slug: "cinnamon" },
  { label: "Bay Leaf", slug: "bay-leaf" },
  { label: "Mace", slug: "mace" },
  { label: "Cloves", slug: "cloves" },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

type HeaderProps = {
  cartCount?: number;
  onSearch?: (query: string) => void;
};

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1.2" />
      <circle cx="18" cy="20" r="1.2" />
    </svg>
  );
}

export default function Header({ cartCount = 0, onSearch }: HeaderProps) {
  const router = useRouter();
  const { user, cartCount: authCartCount, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayCartCount = authCartCount !== undefined ? authCartCount : cartCount;

  const matches = query.trim()
    ? PRODUCTS.filter((p) => p.label.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    onSearch?.(q);
    closeSearch();
    // One match: open that product. Otherwise show the matches on the products page.
    router.push(
      matches.length === 1
        ? `/products/${matches[0].slug}`
        : `/products?q=${encodeURIComponent(q)}`
    );
  };

  // Focus the input when the panel opens; close on Escape
  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 150);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSearch();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen]);

  const linkClass =
    "text-sm font-medium tracking-wide transition-colors hover:text-[#1F4D1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F4D1F]";

  return (
    <header className="sticky top-0 z-50 w-full bg-white" style={{ color: COLORS.ink }}>
      {/* Top section: tagline from the logo */}
      <div
        className="flex h-9 items-center justify-center text-xs font-medium uppercase tracking-[0.3em] text-white"
        style={{ backgroundColor: COLORS.green }}
      >
        Nurture&nbsp;&nbsp;•&nbsp;&nbsp;Grow&nbsp;&nbsp;•&nbsp;&nbsp;Thrive
      </div>

      {/* Main section */}
      <div className="border-b border-[#1F4D1F]/15">
        <div className="mx-auto grid h-20 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: nav links (desktop) / menu button (mobile) */}
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden -ml-2 p-2"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6 6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>

            <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
              <Link href="/our-story" className={linkClass}>
                Our Story
              </Link>

              {/* Products dropdown: opens on hover, click, or keyboard focus */}
              <div
                className="relative"
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
                onFocus={() => setProductsOpen(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setProductsOpen(false);
                }}
                onKeyDown={(e) => e.key === "Escape" && setProductsOpen(false)}
              >
                <Link
                  href="/products"
                  className={`${linkClass} flex items-center gap-1.5`}
                  aria-haspopup="true"
                  aria-expanded={productsOpen}
                  onClick={() => setProductsOpen(false)}
                >
                  Products
                  <ChevronIcon open={productsOpen} />
                </Link>

                {productsOpen && (
                  <div className="absolute left-0 top-full z-50 pt-3">
                    <ul
                      className="w-56 overflow-hidden rounded-xl border bg-white py-2 shadow-lg"
                      style={{ borderColor: "rgba(31,77,31,0.2)" }}
                    >
                      <li>
                        <Link
                          href="/products"
                          onClick={() => setProductsOpen(false)}
                          className="block px-5 py-2 text-sm font-semibold hover:bg-[#1F4D1F]/10 focus-visible:bg-[#1F4D1F]/10 focus-visible:outline-none"
                          style={{ color: COLORS.green }}
                        >
                          All products
                        </Link>
                      </li>
                      {PRODUCTS.map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={`/products/${p.slug}`}
                            onClick={() => setProductsOpen(false)}
                            className="block px-5 py-2 text-sm hover:bg-[#1F4D1F]/10 hover:text-[#1F4D1F] focus-visible:bg-[#1F4D1F]/10 focus-visible:outline-none"
                          >
                            {p.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Link href="/contact" className={linkClass}>
                Contact
              </Link>
            </nav>
          </div>

          {/* Center: logo */}
          <Link href="/" aria-label="Viyodha home" className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Viyodha – Nurture, Grow, Thrive"
              width={240}
              height={160}
              priority
              className="h-20 w-auto object-contain mix-blend-multiply sm:h-24"
            />
          </Link>

          {/* Right: search, user menu or login/register, cart */}
          <div className="flex items-center justify-end gap-2 sm:gap-4">
            <button
              type="button"
              className={`${linkClass} flex items-center gap-2 p-2`}
              aria-label="Open search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((o) => !o)}
            >
              <SearchIcon />
              <span className="hidden lg:inline">Search</span>
            </button>

            {user ? (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-[#1F4D1F]/30 bg-[#EEF3EA] px-3.5 py-1.5 text-sm font-medium text-[#1F4D1F] transition-colors hover:bg-[#1F4D1F] hover:text-white"
                >
                  <span className="max-w-[120px] truncate">{user.username}</span>
                  {user.role === "admin" && (
                    <span className="rounded bg-[#1F4D1F] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white group-hover:bg-white group-hover:text-[#1F4D1F]">
                      Admin
                    </span>
                  )}
                  <ChevronIcon open={userMenuOpen} />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-[#1F4D1F]/20 bg-white py-1.5 shadow-xl"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="border-b border-[#1F4D1F]/10 px-4 py-2">
                      <p className="text-xs text-[#141414]/60">Signed in as</p>
                      <p className="truncate text-sm font-semibold text-[#1F4D1F]">{user.email}</p>
                    </div>

                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm font-semibold text-[#C8221E] hover:bg-[#EEF3EA]"
                      >
                        ⚡ Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#141414] hover:bg-[#EEF3EA] hover:text-[#1F4D1F]"
                    >
                      My Profile
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#141414] hover:bg-[#EEF3EA] hover:text-[#1F4D1F]"
                    >
                      My Orders & Status
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        toast.success("Signed out successfully.");
                        router.push("/");
                      }}
                      className="block w-full border-t border-[#1F4D1F]/10 px-4 py-2 text-left text-sm text-[#C8221E] hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className={`${linkClass} hidden md:inline`}>
                  Login
                </Link>

                <Link
                  href="/register"
                  className="hidden rounded-full border border-[#1F4D1F] px-4 py-1.5 text-sm font-medium text-[#1F4D1F] transition-colors hover:bg-[#1F4D1F] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F] md:inline-block"
                >
                  Register
                </Link>
              </>
            )}

            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]"
              style={{ backgroundColor: COLORS.green }}
            >
              <CartIcon />
              <span>Cart ({displayCartCount})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Search panel: slides down under the header */}
      <div
        className={`absolute inset-x-0 top-full transition-all duration-300 ease-out ${searchOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
          }`}
        aria-hidden={!searchOpen}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 -z-10 bg-[#141414]/40 backdrop-blur-sm"
          onClick={closeSearch}
          aria-hidden="true"
        />

        <div className="border-b bg-white shadow-xl" style={{ borderColor: "rgba(31,77,31,0.15)" }}>
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
            <form onSubmit={submitSearch} role="search" className="relative">
              <span className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2" style={{ color: COLORS.green }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search our spices"
                aria-label="Search products"
                tabIndex={searchOpen ? 0 : -1}
                className="w-full border-0 border-b-2 bg-transparent py-3 pl-12 pr-24 text-2xl font-light outline-none transition-colors placeholder:text-[#141414]/35 sm:text-3xl"
                style={{ borderColor: COLORS.green }}
              />
              <button
                type="button"
                onClick={closeSearch}
                tabIndex={searchOpen ? 0 : -1}
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[#1F4D1F]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F4D1F]"
                style={{ color: COLORS.green }}
              >
                Close
              </button>
            </form>

            <div className="mt-8 min-h-[7rem]">
              {query.trim() ? (
                matches.length > 0 ? (
                  <ul className="flex flex-col">
                    {matches.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/products/${p.slug}`}
                          onClick={closeSearch}
                          tabIndex={searchOpen ? 0 : -1}
                          className="flex items-center justify-between rounded-lg px-3 py-3 text-lg transition-colors hover:bg-[#1F4D1F]/10 hover:text-[#1F4D1F] focus-visible:bg-[#1F4D1F]/10 focus-visible:outline-none"
                        >
                          {p.label}
                          <span aria-hidden="true" style={{ color: COLORS.green }}>&rarr;</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 text-base text-[#141414]/60">
                    No spices match &ldquo;{query.trim()}&rdquo;. Press Enter to see all products.
                  </p>
                )
              ) : (
                <>
                  <p className="mb-4 px-1 text-sm font-medium text-[#141414]/60">Popular spices</p>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCTS.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/products/${p.slug}`}
                        onClick={closeSearch}
                        tabIndex={searchOpen ? 0 : -1}
                        className="rounded-full border border-[#1F4D1F]/35 px-4 py-2 text-sm text-[#1F4D1F] transition-colors hover:border-[#1F4D1F] hover:bg-[#1F4D1F] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4D1F]"
                      >
                        {p.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-b border-[#1F4D1F]/15 bg-white px-4 py-4 md:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-4">
            <li>
              <Link href="/our-story" className={linkClass} onClick={() => setMenuOpen(false)}>
                Our Story
              </Link>
            </li>
            <li>
              <div className="flex items-center gap-2">
                <Link href="/products" className={linkClass} onClick={() => setMenuOpen(false)}>
                  Products
                </Link>
                <button
                  type="button"
                  className="rounded-full p-2 transition-colors hover:bg-[#1F4D1F]/10"
                  aria-label="Show product list"
                  aria-expanded={mobileProductsOpen}
                  onClick={() => setMobileProductsOpen((o) => !o)}
                >
                  <ChevronIcon open={mobileProductsOpen} />
                </button>
              </div>
              {mobileProductsOpen && (
                <ul className="mt-3 flex flex-col gap-3 border-l-2 pl-4" style={{ borderColor: COLORS.green }}>
                  <li>
                    <Link
                      href="/products"
                      className="text-sm font-semibold"
                      style={{ color: COLORS.green }}
                      onClick={() => setMenuOpen(false)}
                    >
                      All products
                    </Link>
                  </li>
                  {PRODUCTS.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/products/${p.slug}`}
                        className="text-sm"
                        onClick={() => setMenuOpen(false)}
                      >
                        {p.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <Link href="/contact" className={linkClass} onClick={() => setMenuOpen(false)}>
                Contact
              </Link>
            </li>
            {user ? (
              <>
                {user.role === "admin" && (
                  <li>
                    <Link
                      href="/admin"
                      className="text-sm font-semibold text-[#C8221E]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/profile" className={linkClass} onClick={() => setMenuOpen(false)}>
                    Profile ({user.username})
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className={linkClass} onClick={() => setMenuOpen(false)}>
                    My Orders
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      toast.success("Signed out successfully.");
                      router.push("/");
                    }}
                    className="text-sm font-medium text-[#C8221E]"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className={linkClass} onClick={() => setMenuOpen(false)}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
