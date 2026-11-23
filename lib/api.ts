function resolveApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!envUrl) return "https://viyodha-backend.onrender.com";

  if (envUrl.includes("||")) {
    const parts = envUrl.split("||").map((s) => s.trim()).filter(Boolean);
    return (parts[0] || "https://viyodha-backend.onrender.com").replace(/\/$/, "");
  }

  return envUrl.replace(/\/$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl();

export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return "/products/cardamom.png";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  if (imagePath.startsWith("/uploads/")) {
    return `${API_BASE_URL}${imagePath}`;
  }
  if (imagePath.startsWith("uploads/")) {
    return `${API_BASE_URL}/${imagePath}`;
  }
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
}

export type User = {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  created_at?: string;
  updated_at?: string;
};

export type ProductDetail = {
  label: string;
  value: string;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  price100g?: number;
  price200g?: number;
  mrp?: number;
  category: string;
  brand: string;
  type: string;
  description: string;
  image: string;
  image2?: string;
  images?: string[];
  stock?: number;
  details?: ProductDetail[];
  created_at?: string;
  updated_at?: string;
  reviews?: Review[];
  avgRating?: number;
  reviewCount?: number;
};

export function getPackPrice(
  p: { price?: number; price100g?: number; price200g?: number } | null | undefined,
  pack: "100g" | "200g" | string = "100g"
): number {
  if (!p) return 0;
  const p100 = p.price100g ? Number(p.price100g) : Number(p.price || 0);
  const p200 = p.price200g ? Number(p.price200g) : Math.round(p100 * 1.9);
  return pack === "200g" ? p200 : p100;
}

export const DEFAULT_IMAGE2_MAP: Record<string, string> = {
  "green-cardamom": "/products/cardamom2.png",
  "black-pepper": "/products/black_pepper2.png",
  "nutmeg": "/products/nutmeg2.png",
  "bay-leaf": "/products/bay_leaf100.png",
  "cinnamon": "/products/cinnamon2.png",
  "cassia-cinnamon": "/products/cinnamon2.png",
  "star-anise": "/products/star_anise2.png",
  "mace": "/products/mace2.png",
  "cloves": "/products/cloves2.png",
};

export function getProductImagePair(p: {
  image?: string;
  img?: string;
  image2?: string;
  img2?: string;
  images?: string[];
  slug?: string;
}): [string, string] {
  const primary = p.image || p.img || "/products/cardamom.png";
  if (p.image2 || p.img2) {
    return [primary, p.image2 || p.img2!];
  }
  if (p.images && p.images.length > 1) {
    return [p.images[0], p.images[1]];
  }
  if (p.slug && DEFAULT_IMAGE2_MAP[p.slug]) {
    return [primary, DEFAULT_IMAGE2_MAP[p.slug]];
  }
  return [primary, "/products/cardamom2.png"];
}

export type Review = {
  id: number;
  product_id: number;
  user_email: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
};

export type CartItem = {
  cart_id: number;
  quantity: number;
  pack?: string;
  product_id: number;
  name: string;
  slug: string;
  price: number | string;
  mrp?: number | string;
  image: string;
  category?: string;
  brand?: string;
  type?: string;
};

export type OrderItem = {
  productId: number | string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  pack?: string;
};

export type Order = {
  id: number;
  user_email: string;
  username: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  pin?: string;
  payment_method: string;
  payment_status: "Pending" | "Paid" | "Failed";
  order_status: "Placed" | "Shipped" | "Delivered" | "Cancelled";
  subtotal: number | string;
  shipping_fee: number | string;
  total_amount: number | string;
  items_json?: OrderItem[] | string;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
};

function getAuthHeaders(token?: string | null): HeadersInit {
  const currentToken =
    token || (typeof window !== "undefined" ? localStorage.getItem("viyodha_token") : null);
  return {
    "Content-Type": "application/json",
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
  };
}

export function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message.trim()) return obj.message;
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error;
    if (obj.error && typeof (obj.error as Record<string, unknown>).message === "string") {
      return (obj.error as Record<string, unknown>).message as string;
    }
  }
  return fallback;
}

async function handleResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  let data: unknown = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await res.text();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw new Error(extractErrorMessage(data, fallbackMessage));
  }

  return data as T;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse<{ user: User; token: string }>(res, "Login failed");
  },

  async register(details: { username: string; email: string; password: string; phone: string }) {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details),
    });
    return handleResponse<{ user: User; token: string; message: string }>(res, "Registration failed");
  },

  async getProfile(token?: string) {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: getAuthHeaders(token),
      cache: "no-store",
    });
    const data = await handleResponse<{ success: boolean; user: User }>(res, "Failed to fetch profile");
    return data.user;
  },

  async updateProfile(
    profileData: {
      username: string;
      email: string;
      phone: string;
      currentPassword?: string;
      newPassword?: string;
    },
    token?: string
  ) {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(profileData),
    });
    return handleResponse<{ success: boolean; message: string; user: User; token?: string }>(
      res,
      "Failed to update profile"
    );
  },

  // Products
  async getAllProducts(params?: { search?: string; category?: string; brand?: string; sort?: string }) {
    const base = API_BASE_URL;
    const url = new URL(`${base}/products`);
    if (params?.search) url.searchParams.set("search", params.search);
    if (params?.category && params.category !== "All")
      url.searchParams.set("category", params.category);
    if (params?.brand && params.brand !== "All")
      url.searchParams.set("brand", params.brand);
    if (params?.sort) url.searchParams.set("sort", params.sort);

    const res = await fetch(url.toString(), {
      cache: "no-store",
    });
    return handleResponse<Product[]>(res, "Failed to fetch products");
  },

  async getProductById(idOrSlug: string | number) {
    const res = await fetch(`${API_BASE_URL}/product/${idOrSlug}`, {
      cache: "no-store",
    });
    return handleResponse<Product>(res, "Failed to fetch product");
  },

  async addProduct(formData: FormData, token?: string) {
    const currentToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("viyodha_token") : null);
    const headers: Record<string, string> = {};
    if (currentToken) headers.Authorization = `Bearer ${currentToken}`;

    const res = await fetch(`${API_BASE_URL}/product/add`, {
      method: "POST",
      headers,
      body: formData,
    });
    return handleResponse<{ success: boolean; message: string; product: Product }>(
      res,
      "Failed to add product"
    );
  },

  async updateProduct(id: string | number, formData: FormData, token?: string) {
    const currentToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("viyodha_token") : null);
    const headers: Record<string, string> = {};
    if (currentToken) headers.Authorization = `Bearer ${currentToken}`;

    const res = await fetch(`${API_BASE_URL}/product/${id}`, {
      method: "PUT",
      headers,
      body: formData,
    });
    return handleResponse<{ success: boolean; message: string; product: Product }>(
      res,
      "Failed to update product"
    );
  },

  async deleteProduct(id: string | number, token?: string) {
    const res = await fetch(`${API_BASE_URL}/product/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ success: boolean; message: string; productId: string | number }>(
      res,
      "Failed to delete product"
    );
  },

  // Cart
  async getCart(token?: string) {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: getAuthHeaders(token),
      cache: "no-store",
    });
    return handleResponse<CartItem[]>(res, "Failed to fetch cart");
  },

  async addToCart(productId: number | string, quantity = 1, pack = "100g", token?: string) {
    const res = await fetch(`${API_BASE_URL}/cart/add`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ productId, quantity, pack }),
    });
    return handleResponse<{ success: boolean; message: string; data?: unknown }>(
      res,
      "Failed to add to cart"
    );
  },

  async incrementCart(cartId: number, token?: string) {
    const res = await fetch(`${API_BASE_URL}/cart/increment/${cartId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ success: boolean; message: string; quantity: number }>(
      res,
      "Failed to increment cart"
    );
  },

  async decrementCart(cartId: number, token?: string) {
    const res = await fetch(`${API_BASE_URL}/cart/decrement/${cartId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ success: boolean; message: string; quantity?: number }>(
      res,
      "Failed to decrement cart"
    );
  },

  async removeCartItem(cartId: number, token?: string) {
    const res = await fetch(`${API_BASE_URL}/cart/remove/${cartId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ success: boolean; message: string }>(res, "Failed to remove item");
  },

  async clearCart(token?: string) {
    const res = await fetch(`${API_BASE_URL}/cart/remove`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ success: boolean; message: string }>(res, "Failed to clear cart");
  },

  // Orders
  async createOrder(
    orderData: {
      username: string;
      phone: string;
      address: string;
      city?: string;
      state?: string;
      pin?: string;
      paymentMethod: string;
      items: OrderItem[];
      subtotal?: number;
      shippingFee?: number;
      totalAmount: number;
    },
    token?: string
  ) {
    const res = await fetch(`${API_BASE_URL}/order/add`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(orderData),
    });
    return handleResponse<{ success: boolean; message: string; order: Order }>(
      res,
      "Failed to place order"
    );
  },

  async getMyOrders(token?: string) {
    const res = await fetch(`${API_BASE_URL}/myOrders`, {
      headers: getAuthHeaders(token),
      cache: "no-store",
    });
    return handleResponse<Order[]>(res, "Failed to fetch orders");
  },

  async getOrderById(id: string | number, token?: string) {
    const res = await fetch(`${API_BASE_URL}/order/${id}`, {
      headers: getAuthHeaders(token),
      cache: "no-store",
    });
    return handleResponse<Order>(res, "Failed to fetch order details");
  },

  async cancelOrder(orderId: number | string, token?: string) {
    const res = await fetch(`${API_BASE_URL}/myOrders/cancel/${orderId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ success: boolean; message: string; order?: Order }>(
      res,
      "Failed to cancel order"
    );
  },

  // Admin orders
  async getAllOrders(token?: string) {
    const res = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: getAuthHeaders(token),
      cache: "no-store",
    });
    return handleResponse<Order[]>(res, "Failed to fetch admin orders");
  },

  async updateOrderStatus(
    orderId: number | string,
    orderStatus: "Placed" | "Shipped" | "Delivered" | "Cancelled",
    token?: string
  ) {
    const res = await fetch(`${API_BASE_URL}/order/status/${orderId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ orderStatus }),
    });
    return handleResponse<{ success: boolean; message: string; order: Order }>(
      res,
      "Failed to update order status"
    );
  },

  async deleteOrder(orderId: number | string, token?: string) {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ success: boolean; message: string }>(res, "Failed to delete order");
  },

  // Admin users
  async getAllUsers(token?: string) {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(token),
      cache: "no-store",
    });
    const data = await handleResponse<{ success: boolean; users: User[] }>(
      res,
      "Failed to fetch users"
    );
    return data.users;
  },

  async deleteUser(userId: number | string, token?: string) {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ success: boolean; message: string }>(res, "Failed to delete user");
  },

  // Reviews
  async addReview(
    reviewData: { productId: number | string; rating: number; comment: string },
    token?: string
  ) {
    const res = await fetch(`${API_BASE_URL}/review/add`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(reviewData),
    });
    return handleResponse<{ success: boolean; message: string; review: Review }>(
      res,
      "Failed to add review"
    );
  },

  async getReviews(productId: number | string) {
    const res = await fetch(`${API_BASE_URL}/reviews/${productId}`, {
      cache: "no-store",
    });
    return handleResponse<Review[]>(res, "Failed to fetch reviews");
  },

  async deleteReview(reviewId: number | string, token?: string) {
    const res = await fetch(`${API_BASE_URL}/review/${reviewId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });
    return handleResponse<{ success: boolean; message: string }>(res, "Failed to delete review");
  },

  // Contact
  async sendContact(data: { name: string; email: string; phone?: string; message: string }) {
    const res = await fetch(`${API_BASE_URL}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string }>(res, "Failed to send message");
  },
};
