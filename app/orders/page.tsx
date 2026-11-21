"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { useAuth } from "@/context/AuthContext";
import { api, getImageUrl, Order } from "@/lib/api";
import { toast } from "sonner";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";

const inr = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

function getStatusBadge(status: string) {
  switch (status) {
    case "Placed":
      return "bg-amber-100 text-amber-900 border-amber-300";
    case "Shipped":
      return "bg-blue-100 text-blue-900 border-blue-300";
    case "Delivered":
      return "bg-emerald-100 text-emerald-900 border-emerald-300";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

export default function MyOrdersPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMyOrders(token);
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancellingId(orderId);
    try {
      await api.cancelOrder(orderId, token || undefined);
      toast.success(`Order #${orderId} has been cancelled.`);
      await fetchOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel order";
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  if (!user && !loading) {
    return (
      <main className="min-h-[70vh] bg-[#EEF3EA] py-20 px-4">
        <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className={`${serif.className} text-3xl font-semibold mb-4`} style={{ color: GREEN }}>
            Sign in to track orders
          </h1>
          <p className="text-sm text-[#141414]/70 mb-6">
            Please log in to view your placed orders and delivery status.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full px-8 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] bg-[#EEF3EA] py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className={`${serif.className} text-4xl font-semibold sm:text-5xl`} style={{ color: GREEN }}>
              My Orders & Status
            </h1>
            <p className="mt-2 text-sm text-[#141414]/70">
              Track the progress of your spice packages from processing to delivery.
            </p>
          </div>
          <Link
            href="/products"
            className="rounded-full bg-[#1F4D1F] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Order more spices
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-lg text-[#1F4D1F]">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">
            <h2 className={`${serif.className} text-3xl font-semibold mb-3`} style={{ color: GREEN }}>
              No orders found
            </h2>
            <p className="text-sm text-[#141414]/70 mb-6 max-w-sm mx-auto">
              You haven&apos;t placed any spice orders yet. Explore our freshly graded spices from Kerala.
            </p>
            <Link
              href="/products"
              className="inline-block rounded-full px-8 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: GREEN }}
            >
              Shop Spices
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {orders.map((o) => {
              const items = Array.isArray(o.items)
                ? o.items
                : typeof o.items_json === "string"
                ? JSON.parse(o.items_json)
                : [];

              const isPlaced = o.order_status === "Placed";
              const isShipped = o.order_status === "Shipped" || o.order_status === "Delivered";
              const isDelivered = o.order_status === "Delivered";
              const isCancelled = o.order_status === "Cancelled";

              return (
                <div
                  key={o.id}
                  className="rounded-[2rem] border border-[#1F4D1F]/15 bg-white p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1F4D1F]/10 pb-5">
                    <div>
                      <span className="text-xs font-semibold text-[#141414]/50 uppercase tracking-wider">
                        Order #{o.id}
                      </span>
                      <p className="text-xs text-[#141414]/60 mt-0.5">
                        Placed on{" "}
                        {new Date(o.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full border px-3.5 py-1 text-xs font-bold tracking-wide uppercase ${getStatusBadge(
                          o.order_status
                        )}`}
                      >
                        {o.order_status}
                      </span>

                      {isPlaced && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(o.id)}
                          disabled={cancellingId === o.id}
                          className="rounded-full border border-red-300 bg-red-50 px-3.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {cancellingId === o.id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tracking visual progress */}
                  {!isCancelled && (
                    <div className="mt-6 mb-8 px-2 sm:px-6">
                      <div className="relative flex items-center justify-between">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0">
                          <div
                            className="h-full bg-[#1F4D1F] transition-all duration-500"
                            style={{
                              width: isDelivered ? "100%" : isShipped ? "50%" : "0%",
                            }}
                          />
                        </div>

                        {/* Step 1: Placed */}
                        <div className="relative z-10 flex flex-col items-center">
                          <span
                            className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: GREEN }}
                          >
                            ✓
                          </span>
                          <span className="mt-2 text-xs font-semibold text-[#1F4D1F]">Placed</span>
                        </div>

                        {/* Step 2: Shipped */}
                        <div className="relative z-10 flex flex-col items-center">
                          <span
                            className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold shadow-sm transition-colors ${
                              isShipped ? "bg-[#1F4D1F] text-white" : "bg-white border-2 border-gray-300 text-gray-400"
                            }`}
                          >
                            {isShipped ? "✓" : "2"}
                          </span>
                          <span
                            className={`mt-2 text-xs font-semibold ${
                              isShipped ? "text-[#1F4D1F]" : "text-gray-400"
                            }`}
                          >
                            Shipped
                          </span>
                        </div>

                        {/* Step 3: Delivered */}
                        <div className="relative z-10 flex flex-col items-center">
                          <span
                            className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold shadow-sm transition-colors ${
                              isDelivered ? "bg-[#1F4D1F] text-white" : "bg-white border-2 border-gray-300 text-gray-400"
                            }`}
                          >
                            {isDelivered ? "✓" : "3"}
                          </span>
                          <span
                            className={`mt-2 text-xs font-semibold ${
                              isDelivered ? "text-[#1F4D1F]" : "text-gray-400"
                            }`}
                          >
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Items in this order */}
                  <div className="divide-y divide-[#1F4D1F]/10">
                    {items.map((item: { productId: number | string; name: string; price: number; quantity: number; image?: string; pack?: string }, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 py-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#EEF3EA]">
                          <Image
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-contain p-1.5"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base text-[#141414] truncate">{item.name}</p>
                          <p className="text-xs text-[#141414]/60">Qty: {item.quantity} {item.pack ? `(${item.pack})` : ""}</p>
                        </div>
                        <div className="text-right font-semibold text-sm sm:text-base text-[#1F4D1F]">
                          {inr(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer summary & details */}
                  <div className="mt-6 flex flex-wrap items-start justify-between gap-6 border-t border-[#1F4D1F]/10 pt-5 text-xs text-[#141414]/75">
                    <div>
                      <p className="font-semibold text-[#141414] mb-1">Delivery Address:</p>
                      <p className="max-w-xs">{o.address}, {o.city} {o.state} {o.pin}</p>
                      <p className="mt-0.5">Phone: {o.phone}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-[#141414] mb-1">Payment Method:</p>
                      <p>{o.payment_method} ({o.payment_status || "Pending"})</p>
                    </div>

                    <div className="text-right ml-auto">
                      <p className="text-xs text-[#141414]/60">Total Amount</p>
                      <p className={`${serif.className} text-2xl font-bold text-[#1F4D1F]`}>
                        {inr(Number(o.total_amount))}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
