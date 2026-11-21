"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond } from "next/font/google";
import { useAuth } from "@/context/AuthContext";
import { api, getImageUrl, Product, Order, User } from "@/lib/api";
import { PRODUCTS as STATIC_PRODUCTS } from "@/lib/products";
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

  const [activeTab, setActiveTab] = useState<"products" | "orders" | "users">("products");

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields for Add / Edit product
  const [pName, setPName] = useState("");
  const [pSlug, setPSlug] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pMrp, setPMrp] = useState("");
  const [pCategory, setPCategory] = useState("Whole Spices");
  const [pBrand, setPBrand] = useState("Viyodha");
  const [pType, setPType] = useState("Spices");
  const [pStock, setPStock] = useState("100");
  const [pDesc, setPDesc] = useState("");
  const [pImageFile, setPImageFile] = useState<File | null>(null);
  const [pImageUrl, setPImageUrl] = useState("");
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle Add Product Submit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice || !pDesc) {
      showMsg("Please fill in name, price and description", "error");
      return;
    }

    setSubmittingProduct(true);
    try {
      const formData = new FormData();
      formData.append("name", pName.trim());
      if (pSlug) formData.append("slug", pSlug.trim());
      formData.append("price", pPrice);
      if (pMrp) formData.append("mrp", pMrp);
      formData.append("category", pCategory.trim());
      formData.append("brand", pBrand.trim());
      formData.append("type", pType.trim());
      formData.append("stock", pStock);
      formData.append("description", pDesc.trim());

      if (pImageFile) {
        formData.append("image", pImageFile);
      } else if (pImageUrl) {
        formData.append("image", pImageUrl.trim());
      } else if (editingProduct?.image) {
        formData.append("image", editingProduct.image);
      } else {
        formData.append("image", "/products/cardamom.png");
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData, token || undefined);
        showMsg(`Product "${pName}" updated successfully!`);
      } else {
        await api.addProduct(formData, token || undefined);
        showMsg(`New product "${pName}" added successfully!`);
      }

      // Reset form
      setShowAddProduct(false);
      setEditingProduct(null);
      setPName("");
      setPSlug("");
      setPPrice("");
      setPMrp("");
      setPDesc("");
      setPImageFile(null);
      setPImageUrl("");
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
    setPName(p.name);
    setPSlug(p.slug);
    setPPrice(String(p.price));
    setPMrp(p.mrp ? String(p.mrp) : "");
    setPCategory(p.category || "Whole Spices");
    setPBrand(p.brand || "Viyodha");
    setPType(p.type || "Spices");
    setPStock(p.stock ? String(p.stock) : "100");
    setPDesc(p.description || "");
    setPImageUrl(p.image || "");
    setPImageFile(null);
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
                  setPSlug("");
                  setPPrice("");
                  setPMrp("");
                  setPDesc("");
                  setPImageUrl("");
                  setPImageFile(null);
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
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                      Product Name *
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
                        placeholder="e.g. Malabar Black Pepper 200g"
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
                        placeholder="e.g. malabar-black-pepper"
                        className={field}
                      />
                    </label>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-4">
                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                      Selling Price (₹) *
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={pPrice}
                        onChange={(e) => setPPrice(e.target.value)}
                        placeholder="495.00"
                        className={field}
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                      MRP (₹)
                      <input
                        type="number"
                        step="0.01"
                        value={pMrp}
                        onChange={(e) => setPMrp(e.target.value)}
                        placeholder="599.00"
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

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                      Upload Image File (via Multer)
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setPImageFile(e.target.files[0]);
                        }}
                        className="file:mr-4 file:rounded-full file:border-0 file:bg-[#1F4D1F] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:opacity-90"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#141414]/75">
                      Or Image Path / URL
                      <input
                        type="text"
                        value={pImageUrl}
                        onChange={(e) => setPImageUrl(e.target.value)}
                        placeholder="/products/cardamom.png or https://..."
                        className={field}
                      />
                    </label>
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
                      <th className="px-4 py-4">Price</th>
                      <th className="px-4 py-4">MRP</th>
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
                              <p className="font-semibold text-[#141414]">{p.name}</p>
                              <p className="text-xs text-[#141414]/50">{p.type || "Whole Spice"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-[#141414]/70">{p.slug}</td>
                        <td className="px-4 py-4 font-bold text-[#1F4D1F]">{inr(p.price)}</td>
                        <td className="px-4 py-4 text-[#141414]/50 line-through">
                          {p.mrp ? inr(p.mrp) : "-"}
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
      </div>
    </main>
  );
}
