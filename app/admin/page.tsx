"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { useAuth } from "@/context/AuthContext";
import { api, getImageUrl, Product, Order, User } from "@/lib/api";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";
import { BilingualName, parseBilingualName } from "@/components/BilingualName";
import { toast } from "sonner";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"] });

const GREEN = "#1F4D1F";
const TINT = "#EEF3EA";
const RED = "#C8221E";

const inr = (n: number | string) => `₹${Number(n).toLocaleString("en-IN")}`;

const field =
  "w-full rounded-xl border border-[#1F4D1F]/25 bg-white px-4 py-2.5 text-sm text-[#141414] outline-none transition-colors placeholder:text-[#141414]/40 focus:border-[#1F4D1F] focus:ring-2 focus:ring-[#1F4D1F]/20";

export default function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"products" | "orders" | "users" | "delivery">("products");

  // Delivery Settings state
  const [deliveryKerala, setDeliveryKerala] = useState("40");
  const [deliveryNational, setDeliveryNational] = useState("70");
  const [freeThreshold, setFreeThreshold] = useState("999");
  const [loadingDelivery, setLoadingDelivery] = useState(true);
  const [savingDelivery, setSavingDelivery] = useState(false);

  const loadDeliverySettings = useCallback(async () => {
    try {
      setLoadingDelivery(true);
      const s = await api.getDeliverySettings();
      setDeliveryKerala(String(s.deliveryKerala));
      setDeliveryNational(String(s.deliveryNational));
      setFreeThreshold(String(s.freeShippingThreshold));
    } catch (err) {
      console.error("Failed to load delivery settings:", err);
    } finally {
      setLoadingDelivery(false);
    }
  }, []);

  useEffect(() => {
    loadDeliverySettings();
  }, [loadDeliverySettings]);

  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDelivery(true);
    try {
      const updated = await api.updateDeliverySettings(
        {
          deliveryKerala: Math.max(0, parseFloat(deliveryKerala) || 0),
          deliveryNational: Math.max(0, parseFloat(deliveryNational) || 0),
          freeShippingThreshold: Math.max(0, parseFloat(freeThreshold) || 0),
        },
        token || undefined
      );
      setDeliveryKerala(String(updated.deliveryKerala));
      setDeliveryNational(String(updated.deliveryNational));
      setFreeThreshold(String(updated.freeShippingThreshold));
      showMsg("Delivery charges updated successfully! New rates are now active on the store.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update delivery settings";
      showMsg(msg, "error");
    } finally {
      setSavingDelivery(false);
    }
  };

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields for Add / Edit product
  const [pName, setPName] = useState("");
  const [pMalayalam, setPMalayalam] = useState("");
  const [pSlug, setPSlug] = useState("");
  const [pPrice100, setPPrice100] = useState("");
  const [pPrice200, setPPrice200] = useState("");
  const [pCategory, setPCategory] = useState("Whole Spices");
  const [pBrand, setPBrand] = useState("Viyodha");
  const [pType, setPType] = useState("Spices");
  const [pStock, setPStock] = useState("100");
  const [pDesc, setPDesc] = useState("");
  const [pImageFiles, setPImageFiles] = useState<File[]>([]);
  const [pExistingImages, setPExistingImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate previews for newly selected image files
  useEffect(() => {
    if (pImageFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }
    const urls = pImageFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [pImageFiles]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const chosen = Array.from(e.target.files);
      setPImageFiles((prev) => [...prev, ...chosen]);
    }
    if (e.target) e.target.value = "";
  };

  const handleRemoveNewFile = (idx: number) => {
    setPImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingImage = (idx: number) => {
    setPExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderFilter, setOrderFilter] = useState("All");

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Customer users (exclude admin accounts)
  const customerUsers = useMemo(() => users.filter((u) => u.role !== "admin"), [users]);

  // Messages
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setActionMessage({ type, text });
    if (type === "success") {
      toast.success(text);
    } else {
      toast.error(text);
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Fetch Products
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await api.getAllProducts();
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(
          STATIC_PRODUCTS.map((p, idx) => ({
            id: idx + 1,
            name: p.name,
            slug: p.slug,
            price: p.price,
            mrp: p.mrp,
            category: "Whole Spices",
            brand: "Viyodha",
            type: "Spices",
            description: p.desc,
            image: p.img,
            image2: p.img2,
            images: p.images,
            details: p.details,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts(
        STATIC_PRODUCTS.map((p, idx) => ({
          id: idx + 1,
          name: p.name,
          slug: p.slug,
          price: p.price,
          mrp: p.mrp,
          category: "Whole Spices",
          brand: "Viyodha",
          type: "Spices",
          description: p.desc,
          image: p.img,
          image2: p.img2,
          images: p.images,
          details: p.details,
        }))
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch Orders
  const loadOrders = useCallback(async () => {
    const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("viyodha_token") : null);
    if (!currentToken) return;
    setLoadingOrders(true);
    try {
      const data = await api.getAllOrders(currentToken);
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  // Fetch Users
  const loadUsers = useCallback(async () => {
    const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("viyodha_token") : null);
    if (!currentToken) return;
    setLoadingUsers(true);
    try {
      const data = await api.getAllUsers(currentToken);
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadProducts();
      loadOrders();
      loadUsers();
    }
  }, [user, loadProducts, loadOrders, loadUsers]);

  // Handle Add / Edit Product Submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice100 || !pDesc) {
      showMsg("Please fill in product name, 100g price and description", "error");
      return;
    }

    if (pImageFiles.length === 0 && pExistingImages.length === 0) {
      showMsg("Please upload at least one product image.", "error");
      return;
    }

    setSubmittingProduct(true);
    try {
      const calculatedP200 = pPrice200 ? pPrice200.trim() : String(Math.round(Number(pPrice100) * 1.9));
      const finalName = pMalayalam.trim()
        ? (pName.includes("(") ? pName.trim() : `${pName.trim()} (${pMalayalam.trim()})`)
        : pName.trim();

      const formData = new FormData();
      formData.append("name", finalName);
      if (pSlug) formData.append("slug", pSlug.trim());
      formData.append("price", pPrice100.trim());
      formData.append("price100g", pPrice100.trim());
      formData.append("price200g", calculatedP200);
      formData.append("category", pCategory.trim());
      formData.append("brand", pBrand.trim());
      formData.append("type", pType.trim());
      formData.append("stock", pStock);
      formData.append("description", pDesc.trim());

      // Append all selected image files
      pImageFiles.forEach((file) => {
        formData.append("images", file);
      });

      // When editing, send list of kept existing images
      if (editingProduct) {
        formData.append("existingImages", JSON.stringify(pExistingImages));
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData, token || undefined);
        showMsg(`Product "${finalName}" updated successfully!`);
      } else {
        await api.addProduct(formData, token || undefined);
        showMsg(`New product "${finalName}" added successfully!`);
      }

      // Reset form
      setShowAddProduct(false);
      setEditingProduct(null);
      setPName("");
      setPMalayalam("");
      setPSlug("");
      setPPrice100("");
      setPPrice200("");
      setPDesc("");
      setPImageFiles([]);
      setPExistingImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save product";
      showMsg(msg, "error");
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    const { english, malayalam } = parseBilingualName(p.name);
    setPName(english || p.name);
    setPMalayalam(malayalam);
    setPSlug(p.slug);
    setPPrice100(String(p.price100g || p.price || ""));
    setPPrice200(String(p.price200g || Math.round(Number(p.price || 0) * 1.9)));
    setPCategory(p.category || "Whole Spices");
    setPBrand(p.brand || "Viyodha");
    setPType(p.type || "Spices");
    setPStock(p.stock ? String(p.stock) : "100");
    setPDesc(p.description || "");

    const existing = (p.images && p.images.length > 0)
      ? p.images
      : (p.image2 ? [p.image, p.image2] : (p.image ? [p.image] : []));
    setPExistingImages(existing);
    setPImageFiles([]);
    setShowAddProduct(true);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await api.deleteProduct(id, token || undefined);
      showMsg(`Product "${name}" deleted successfully.`);
      await loadProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      showMsg(msg, "error");
    }
  };

  // Update order status (Shipped, Delivered, Cancelled)
  const handleUpdateOrderStatus = async (
    orderId: number,
    newStatus: "Placed" | "Shipped" | "Delivered" | "Cancelled"
  ) => {
    try {
      await api.updateOrderStatus(orderId, newStatus, token || undefined);
      showMsg(`Order #${orderId} marked as ${newStatus}!`);
      await loadOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      showMsg(msg, "error");
    }
  };

  // Delete order permanently
  const handleDeleteOrder = async (orderId: number) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete Order #${orderId}? This action cannot be undone.`
      )
    )
      return;
    try {
      await api.deleteOrder(orderId, token || undefined);
      showMsg(`Order #${orderId} deleted permanently.`);
      await loadOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete order";
      showMsg(msg, "error");
    }
  };

  // Delete customer
  const handleDeleteUser = async (userId: number, email: string) => {
    if (!confirm(`Are you sure you want to delete user account "${email}"?`)) return;
    try {
      await api.deleteUser(userId, token || undefined);
      showMsg(`User "${email}" deleted.`);
      await loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete user";
      showMsg(msg, "error");
    }
  };

  // Access check
  if (authLoading) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center bg-[#EEF3EA]">
        <p className="text-lg text-[#1F4D1F]">Verifying administrator credentials...</p>
      </main>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="min-h-[70vh] bg-[#EEF3EA] py-20 px-4">
        <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <span className="text-4xl mb-3 block">🔒</span>
          <h1 className={`${serif.className} text-3xl font-semibold mb-3 text-[#C8221E]`}>
            Admin Authorization Required
          </h1>
          <p className="text-sm text-[#141414]/70 mb-6">
            You must be signed in with an administrator account to access the Viyodha Admin Dashboard.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full px-8 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            Sign In as Admin
          </Link>
        </div>
      </main>
    );
  }

  // Filtered orders
  const filteredOrders = orderFilter === "All"
    ? orders
    : orders.filter((o) => o.order_status.toLowerCase() === orderFilter.toLowerCase());

  return (
    <main className="min-h-[85vh] bg-[#EEF3EA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#C8221E] px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                Admin Panel
              </span>
              <h1 className={`${serif.className} text-4xl font-semibold sm:text-5xl`} style={{ color: GREEN }}>
                Viyodha Dashboard
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#141414]/70">
              Manage inventory, process customer orders, and manage users.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="rounded-full border border-[#1F4D1F] bg-white px-5 py-2 text-xs font-bold text-[#1F4D1F] hover:bg-[#EEF3EA]"
            >
              View Live Store
            </Link>
            <Link
              href="/profile"
              className="rounded-full bg-[#1F4D1F] px-5 py-2 text-xs font-bold text-white hover:opacity-90"
            >
              My Profile
            </Link>
          </div>
        </div>

        {/* Global Action Message */}
        {actionMessage && (
          <div
            className={`mb-6 rounded-xl p-4 text-sm font-semibold shadow-sm ${actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
              : "bg-red-50 text-red-800 border border-red-300"
              }`}
          >
            {actionMessage.text}
          </div>
        )}

        {/* Key Metrics Cards (Products, Orders, Users) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-[#1F4D1F]/15 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#141414]/50">Total Products</p>
            <p className={`${serif.className} text-4xl font-bold mt-1 text-[#1F4D1F]`}>
              {loadingProducts ? "..." : products.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#1F4D1F]/15 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#141414]/50">Total Orders</p>
            <p className={`${serif.className} text-4xl font-bold mt-1 text-[#1F4D1F]`}>
              {loadingOrders ? "..." : orders.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#1F4D1F]/15 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#141414]/50">Registered Users</p>
            <p className={`${serif.className} text-4xl font-bold mt-1 text-[#1F4D1F]`}>
              {loadingUsers ? "..." : customerUsers.length}
            </p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-[#1F4D1F]/20 mb-8 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === "products"
              ? "border-[#1F4D1F] text-[#1F4D1F]"
              : "border-transparent text-[#141414]/60 hover:text-[#1F4D1F]"
              }`}
          >
            📦 Products ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === "orders"
              ? "border-[#1F4D1F] text-[#1F4D1F]"
              : "border-transparent text-[#141414]/60 hover:text-[#1F4D1F]"
              }`}
          >
            🛍️ Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === "users"
              ? "border-[#1F4D1F] text-[#1F4D1F]"
              : "border-transparent text-[#141414]/60 hover:text-[#1F4D1F]"
              }`}
          >
            👥 Users ({customerUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("delivery")}
            className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === "delivery"
              ? "border-[#1F4D1F] text-[#1F4D1F]"
              : "border-transparent text-[#141414]/60 hover:text-[#1F4D1F]"
              }`}
          >
            🚚 Delivery Charges (₹{deliveryKerala} / ₹{deliveryNational})
          </button>
        </div>

        {/* ===================== TAB 1: PRODUCTS ===================== */}
        {activeTab === "products" && (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className={`${serif.className} text-3xl font-semibold text-[#1F4D1F]`}>
                Product Catalog
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setPName("");
                  setPMalayalam("");
                  setPSlug("");
                  setPPrice100("");
                  setPPrice200("");
                  setPDesc("");
                  setPImageFiles([]);
                  setPExistingImages([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  setShowAddProduct((o) => !o);
                }}
                className="rounded-full px-6 py-2.5 text-xs font-bold uppercase text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: GREEN }}
              >
                {showAddProduct ? "✕ Close Form" : "+ Add New Product"}
              </button>
            </div>

            {/* Add / Edit Product Form Panel */}
            {showAddProduct && (
              <div className="mb-10 rounded-[2rem] border border-[#1F4D1F]/20 bg-white p-6 sm:p-8 shadow-sm">
                <h3 className={`${serif.className} text-2xl font-semibold mb-6 text-[#1F4D1F]`}>
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Spice Product"}
                </h3>

                <form onSubmit={handleSaveProduct} className="flex flex-col gap-5">
                  <div className="grid gap-5 sm:grid-cols-3">
                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                      Product Name (English) *
                      <input
                        type="text"
                        required
                        value={pName}
                        onChange={(e) => {
                          setPName(e.target.value);
                          if (!editingProduct && !pSlug) {
                            setPSlug(
                              e.target.value
                                .toLowerCase()
                                .trim()
                                .replace(/\s+/g, "-")
                                .replace(/[^\w-]+/g, "")
                            );
                          }
                        }}
                        placeholder="e.g. Green Cardamom"
                        className={field}
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                      Malayalam Name (മലയാളം പേര്)
                      <input
                        type="text"
                        value={pMalayalam}
                        onChange={(e) => setPMalayalam(e.target.value)}
                        placeholder="e.g. ഏലക്ക"
                        className={field}
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                      URL Slug *
                      <input
                        type="text"
                        required
                        value={pSlug}
                        onChange={(e) => setPSlug(e.target.value)}
                        placeholder="e.g. green-cardamom"
                        className={field}
                      />
                    </label>
                  </div>

                  {/* Live Bilingual Preview */}
                  {(pName || pMalayalam) && (
                    <div className="flex items-center gap-2 rounded-xl bg-[#EEF3EA]/70 px-4 py-2.5 text-xs text-[#1F4D1F]">
                      <span className="font-bold">Display Preview:</span>
                      <span className="font-semibold text-sm">
                        <BilingualName
                          name={
                            pMalayalam.trim()
                              ? (pName.includes("(") ? pName.trim() : `${pName.trim()} (${pMalayalam.trim()})`)
                              : pName.trim()
                          }
                        />
                      </span>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-4">
                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                      Price for 100g (₹) *
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={pPrice100}
                        onChange={(e) => setPPrice100(e.target.value)}
                        placeholder="260.00"
                        className={field}
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                      Price for 200g (₹) *
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={pPrice200}
                        onChange={(e) => setPPrice200(e.target.value)}
                        placeholder="495.00"
                        className={field}
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                      Category
                      <input
                        type="text"
                        value={pCategory}
                        onChange={(e) => setPCategory(e.target.value)}
                        placeholder="Whole Spices"
                        className={field}
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                      Stock Qty
                      <input
                        type="number"
                        value={pStock}
                        onChange={(e) => setPStock(e.target.value)}
                        placeholder="100"
                        className={field}
                      />
                    </label>
                  </div>

                  {/* Multi-Image Upload Section */}
                  <div className="flex flex-col gap-3 rounded-2xl border border-[#1F4D1F]/20 bg-[#EEF3EA]/40 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1F4D1F]">
                          Product Images *
                        </span>
                        <span className="text-xs text-[#141414]/65">
                          Upload 1 or more photos. The first image will be used as the primary catalog cover.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:opacity-90"
                        style={{ backgroundColor: GREEN }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        + Upload Images
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFilesSelected}
                      className="hidden"
                    />

                    {/* Display Existing Images (When Editing) */}
                    {pExistingImages.length > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1F4D1F]">
                          Current Saved Images ({pExistingImages.length})
                        </span>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                          {pExistingImages.map((imgUrl, idx) => (
                            <div
                              key={`existing-${idx}`}
                              className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-[#1F4D1F]/20 bg-white p-2 shadow-xs"
                            >
                              <div className="relative h-24 w-full">
                                <Image
                                  src={getImageUrl(imgUrl)}
                                  alt={`Saved photo ${idx + 1}`}
                                  fill
                                  sizes="120px"
                                  className="object-contain"
                                />
                              </div>
                              {idx === 0 && pImageFiles.length === 0 && (
                                <span className="mt-1 rounded-md bg-[#1F4D1F] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                  Primary Cover
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingImage(idx)}
                                className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white shadow-sm opacity-90 transition hover:opacity-100 hover:scale-105"
                                title="Remove this image"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Display Newly Selected Images */}
                    {previewUrls.length > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1F4D1F]">
                          New Images to Upload ({previewUrls.length})
                        </span>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                          {previewUrls.map((url, idx) => (
                            <div
                              key={`new-${idx}`}
                              className="group relative flex flex-col items-center overflow-hidden rounded-xl border-2 border-dashed border-[#1F4D1F]/40 bg-white p-2 shadow-xs"
                            >
                              <div className="relative h-24 w-full">
                                <Image
                                  src={url}
                                  alt={`Upload preview ${idx + 1}`}
                                  fill
                                  sizes="120px"
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                              {idx === 0 && pExistingImages.length === 0 && (
                                <span className="mt-1 rounded-md bg-[#1F4D1F] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                  Primary Cover
                                </span>
                              )}
                              <span className="mt-1 max-w-full truncate text-[10px] text-[#141414]/70">
                                {pImageFiles[idx]?.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewFile(idx)}
                                className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white shadow-sm opacity-90 transition hover:opacity-100 hover:scale-105"
                                title="Remove this file"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty placeholder */}
                    {pExistingImages.length === 0 && previewUrls.length === 0 && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1F4D1F]/30 bg-white/70 p-8 text-center transition hover:border-[#1F4D1F] hover:bg-white"
                      >
                        <div className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-[#EEF3EA] text-[#1F4D1F]">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-[#1F4D1F]">
                          Click to browse product images
                        </p>
                        <p className="text-xs text-[#141414]/60 mt-1">
                          You can select multiple images at once (PNG, JPG, WEBP)
                        </p>
                      </div>
                    )}
                  </div>

                  <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                    Description *
                    <textarea
                      required
                      rows={3}
                      value={pDesc}
                      onChange={(e) => setPDesc(e.target.value)}
                      placeholder="Detailed aroma profile, origin, and culinary recommendations..."
                      className={field}
                    />
                  </label>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddProduct(false);
                        setEditingProduct(null);
                        setPMalayalam("");
                        setPImageFiles([]);
                        setPExistingImages([]);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="rounded-full border border-gray-300 px-6 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingProduct}
                      className="rounded-full px-8 py-2.5 text-xs font-bold uppercase text-white hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: GREEN }}
                    >
                      {submittingProduct
                        ? "Saving..."
                        : editingProduct
                          ? "Update Product Details"
                          : "Save & Add Product"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            {loadingProducts ? (
              <div className="py-20 text-center text-[#1F4D1F]">Loading products catalog...</div>
            ) : (
              <div className="overflow-x-auto rounded-[2rem] border border-[#1F4D1F]/15 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#1F4D1F]/15 bg-[#EEF3EA]/70 text-xs font-bold uppercase text-[#1F4D1F]">
                    <tr>
                      <th className="px-6 py-4">Spice Product</th>
                      <th className="px-4 py-4">Slug</th>
                      <th className="px-4 py-4">Price (100g / 200g)</th>
                      <th className="px-4 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F4D1F]/10">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#EEF3EA]/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#EEF3EA]">
                              <Image
                                src={getImageUrl(p.image)}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-[#141414]">
                                <BilingualName name={p.name} />
                              </p>
                              <p className="text-xs text-[#141414]/50">{p.type || "Whole Spice"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-[#141414]/70">{p.slug}</td>
                        <td className="px-4 py-4">
                          <span className="font-bold text-[#1F4D1F]">
                            100g: {inr(p.price100g || p.price)}
                          </span>
                          <span className="block text-xs font-semibold text-[#141414]/70 mt-0.5">
                            200g: {inr(p.price200g || Math.round(Number(p.price) * 1.9))}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-[#EEF3EA] px-2.5 py-1 text-xs font-semibold text-[#1F4D1F]">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditClick(p)}
                              className="rounded-lg bg-[#EEF3EA] px-3 py-1.5 text-xs font-bold text-[#1F4D1F] hover:bg-[#1F4D1F] hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-[#C8221E] hover:bg-[#C8221E] hover:text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: ORDERS ===================== */}
        {activeTab === "orders" && (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className={`${serif.className} text-3xl font-semibold text-[#1F4D1F]`}>
                  Customer Orders
                </h2>
                <p className="text-xs text-[#141414]/60">
                  Update fulfillment statuses to Shipped or Delivered.
                </p>
              </div>

              {/* Status filter pills */}
              <div className="flex flex-wrap gap-2">
                {["All", "Placed", "Shipped", "Delivered", "Cancelled"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderFilter(st)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase transition-colors ${orderFilter === st
                      ? "bg-[#1F4D1F] text-white"
                      : "border border-[#1F4D1F]/20 bg-white text-[#1F4D1F] hover:bg-[#EEF3EA]"
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {loadingOrders ? (
              <div className="py-20 text-center text-[#1F4D1F]">Loading customer orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">
                <p className="text-[#141414]/70">No orders matching &quot;{orderFilter}&quot;.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {filteredOrders.map((o) => {
                  const items = Array.isArray(o.items)
                    ? o.items
                    : typeof o.items_json === "string"
                      ? JSON.parse(o.items_json)
                      : [];

                  return (
                    <div
                      key={o.id}
                      className="rounded-[2rem] border border-[#1F4D1F]/15 bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1F4D1F]/10 pb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-base text-[#141414]">Order #{o.id}</span>
                            <span
                              className={`rounded-full px-3 py-0.5 text-xs font-bold ${o.order_status === "Delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : o.order_status === "Shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : o.order_status === "Cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-[#EEF3EA] text-[#1F4D1F]"
                                }`}
                            >
                              {o.order_status}
                            </span>
                            <span className="text-xs text-[#141414]/50">
                              {new Date(o.created_at).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="text-xs text-[#141414]/75 mt-1">
                            Customer: <strong>{o.username}</strong> ({o.user_email}) &middot; Phone: {o.phone}
                          </p>
                        </div>

                        {/* Status update & delete actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          {o.order_status !== "Shipped" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(o.id, "Shipped")}
                              className="rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 shadow-sm"
                            >
                              Mark as Shipped
                            </button>
                          )}

                          {o.order_status !== "Delivered" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(o.id, "Delivered")}
                              className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-sm"
                            >
                              Mark as Delivered
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(o.id)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3.5 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-200"
                            title="Delete order permanently"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((it: { productId: number | string; name: string; price: number; quantity: number; image?: string; pack?: string }, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 rounded-xl bg-[#EEF3EA]/50 p-2.5">
                            <div className="relative h-12 w-12 shrink-0 rounded-lg bg-white overflow-hidden">
                              <Image
                                src={getImageUrl(it.image)}
                                alt={it.name}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="min-w-0 flex-1 text-xs">
                              <p className="font-semibold truncate">{it.name}</p>
                              <p className="text-[#141414]/60">Qty: {it.quantity} &middot; {inr(it.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between border-t border-[#1F4D1F]/10 pt-3 text-xs text-[#141414]/75">
                        <p>
                          Address: <strong>{o.address}, {o.city} {o.state} {o.pin}</strong>
                        </p>
                        <p>
                          Payment: <strong>{o.payment_method}</strong> ({o.payment_status})
                        </p>
                        <p className="font-bold text-sm text-[#1F4D1F]">
                          Total: {inr(o.total_amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 3: USERS ===================== */}
        {activeTab === "users" && (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className={`${serif.className} text-3xl font-semibold text-[#1F4D1F]`}>
                  Registered Users
                </h2>
                <p className="text-xs text-[#141414]/60">
                  Accounts registered in the Viyodha platform.
                </p>
              </div>
            </div>

            {loadingUsers ? (
              <div className="py-20 text-center text-[#1F4D1F]">Loading users...</div>
            ) : customerUsers.length === 0 ? (
              <div className="rounded-[2rem] bg-white p-12 text-center shadow-sm">
                <p className="text-[#141414]/70">No customer accounts registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-[2rem] border border-[#1F4D1F]/15 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#1F4D1F]/15 bg-[#EEF3EA]/70 text-xs font-bold uppercase text-[#1F4D1F]">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Username</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-4 py-4">Role</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F4D1F]/10">
                    {customerUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#EEF3EA]/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{u.id}</td>
                        <td className="px-6 py-4 font-semibold text-[#141414]">{u.username}</td>
                        <td className="px-6 py-4 text-[#141414]/80">{u.email}</td>
                        <td className="px-6 py-4 text-[#141414]/80">{u.phone || "—"}</td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase text-emerald-800">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#141414]/60">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN") : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="rounded-lg bg-red-50 px-3 py-1 text-xs font-bold text-[#C8221E] hover:bg-[#C8221E] hover:text-white"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 4: DELIVERY CHARGES ===================== */}
        {activeTab === "delivery" && (
          <div className="rounded-[2rem] border border-[#1F4D1F]/15 bg-white p-6 sm:p-10 shadow-sm">
            <div className="mb-8 border-b border-[#1F4D1F]/15 pb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚚</span>
                <h2 className={`${serif.className} text-3xl font-semibold text-[#1F4D1F]`}>
                  Delivery Charges & Shipping Rates
                </h2>
              </div>
              <p className="mt-1 text-sm text-[#141414]/70">
                Configure delivery rates for customer orders based on their shipping location (Within Kerala vs. Rest of India).
              </p>
            </div>

            {loadingDelivery ? (
              <div className="py-12 text-center text-sm text-[#1F4D1F]">Loading delivery settings...</div>
            ) : (
              <form onSubmit={handleSaveDelivery} className="max-w-3xl flex flex-col gap-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Inside Kerala */}
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#1F4D1F] px-3 py-1 text-xs font-bold text-white">
                        🌴 Within Kerala
                      </span>
                      <span className="text-xl font-bold text-[#1F4D1F]">
                        ₹{deliveryKerala || 0}
                      </span>
                    </div>
                    <label className="text-sm font-semibold text-[#141414]">
                      Delivery Charge for Kerala (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#141414]/50">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={deliveryKerala}
                        onChange={(e) => setDeliveryKerala(e.target.value)}
                        placeholder="40"
                        className={`${field} pl-8 font-semibold text-base`}
                      />
                    </div>
                    <p className="text-xs text-[#141414]/65">
                      Applied to all deliveries within Kerala (default: ₹40).
                    </p>
                  </div>

                  {/* Outside Kerala / Rest of India */}
                  <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-amber-800 px-3 py-1 text-xs font-bold text-white">
                        🇮🇳 Outside Kerala (Rest of India)
                      </span>
                      <span className="text-xl font-bold text-amber-900">
                        ₹{deliveryNational || 0}
                      </span>
                    </div>
                    <label className="text-sm font-semibold text-[#141414]">
                      Delivery Charge for Rest of India (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#141414]/50">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={deliveryNational}
                        onChange={(e) => setDeliveryNational(e.target.value)}
                        placeholder="70"
                        className={`${field} pl-8 font-semibold text-base`}
                      />
                    </div>
                    <p className="text-xs text-[#141414]/65">
                      Applied to all other states across India (default: ₹70).
                    </p>
                  </div>
                </div>

                {/* Free Shipping Threshold */}
                <div className="rounded-2xl border border-[#1F4D1F]/20 bg-white p-6 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1F4D1F]">
                      ✨ Free Delivery Order Value (₹)
                    </span>
                    <span className="text-sm font-medium text-[#141414]/70">
                      Orders ≥ ₹{freeThreshold || 0} receive FREE delivery
                    </span>
                  </div>
                  <div className="relative max-w-sm">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#141414]/50">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={freeThreshold}
                      onChange={(e) => setFreeThreshold(e.target.value)}
                      placeholder="999"
                      className={`${field} pl-8 font-semibold text-base`}
                    />
                  </div>
                  <p className="text-xs text-[#141414]/65">
                    Orders with subtotal equal or greater than this value get free delivery automatically. Set to 0 to disable free shipping.
                  </p>
                </div>

                {/* Summary / Preview Box */}
                <div className="rounded-2xl border border-dashed border-[#1F4D1F]/30 bg-[#EEF3EA]/50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#1F4D1F] mb-3">
                    Customer Experience Preview:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="bg-white rounded-xl p-3 border border-[#1F4D1F]/15">
                      <p className="font-semibold text-[#141414]">Customer in Kerala (e.g. Kochi):</p>
                      <p className="text-xs text-[#141414]/70 mt-1">
                        Delivery fee: <strong>₹{deliveryKerala || 0}</strong> (Free on orders ₹{freeThreshold}+)
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-[#1F4D1F]/15">
                      <p className="font-semibold text-[#141414]">Customer Outside Kerala (e.g. Bangalore, Delhi):</p>
                      <p className="text-xs text-[#141414]/70 mt-1">
                        Delivery fee: <strong>₹{deliveryNational || 0}</strong> (Free on orders ₹{freeThreshold}+)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={savingDelivery}
                    className="rounded-full bg-[#1F4D1F] px-8 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {savingDelivery ? "Saving Settings..." : "Save Delivery Charges"}
                  </button>
                  <button
                    type="button"
                    onClick={loadDeliverySettings}
                    className="rounded-full border border-[#1F4D1F]/30 px-6 py-3.5 text-sm font-semibold text-[#141414]/70 hover:bg-[#EEF3EA]"
                  >
                    Reset Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
