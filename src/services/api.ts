import type { Brand, CarWithBrand, User } from "../types";

type PublicUser = Omit<User, "passwordHash">;

function authHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem("aurum-auth");
    const token = raw ? (JSON.parse(raw) as { state?: { token?: string } }).state?.token : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { ...(init?.headers ?? {}), ...authHeaders() },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Lỗi ${res.status}`);
  }
  return (await res.json()) as T;
}

const post = <T>(path: string, body: unknown) =>
  req<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const patch = <T>(path: string, body: unknown) =>
  req<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const del = <T>(path: string) => req<T>(path, { method: "DELETE" });

export interface CarListParams {
  brand?: string;
  q?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

export interface AdminStats {
  totalCars: number;
  availableCars: number;
  totalOrders: number;
  pendingOrders: number;
  totalBookings: number;
  pendingBookings: number;
  totalUsers: number;
  revenue: number;
}

export const api = {
  cars(params: CarListParams = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    });
    return req<{ data: CarWithBrand[]; total: number }>(`/api/cars?${qs}`);
  },
  featuredCars() {
    return req<{ data: CarWithBrand[] }>("/api/cars/featured");
  },
  carDetail(slug: string) {
    return req<{ data: CarWithBrand & { related: CarWithBrand[] } }>(`/api/cars/${slug}`);
  },
  brands() {
    return req<{ data: (Brand & { count: number })[] }>("/api/brands");
  },
  login(email: string, password: string) {
    return post<{ data: { user: PublicUser; token: string } }>("/api/auth/login", { email, password });
  },
  register(body: { name: string; email: string; phone: string; password: string }) {
    return post<{ data: { user: PublicUser; token: string } }>("/api/auth/register", body);
  },
  bookTestDrive(body: { carId: string; date: string; slot: string; name: string; phone: string; note?: string; userId?: string }) {
    return post<{ data: { id: string } }>("/api/test-drives", body);
  },
  createDeposit(body: { carId: string; amount: number; name: string; phone: string; userId?: string }) {
    return post<{ data: { id: string } }>("/api/orders", body);
  },
  // account
  myBookings() {
    return req<{ data: Record<string, unknown>[] }>("/api/account/bookings");
  },
  myOrders() {
    return req<{ data: Record<string, unknown>[] }>("/api/account/orders");
  },
  // admin / staff
  adminStats() {
    return req<{ data: AdminStats }>("/api/admin/stats");
  },
  adminBookings() {
    return req<{ data: Record<string, unknown>[] }>("/api/admin/test-drives");
  },
  adminOrders() {
    return req<{ data: Record<string, unknown>[] }>("/api/admin/orders");
  },
  adminUsers() {
    return req<{ data: (PublicUser & { bookings: number; orders: number })[] }>("/api/admin/users");
  },
  updateBooking(id: string, status: string) {
    return patch<{ data: unknown }>(`/api/admin/test-drives/${id}`, { status });
  },
  updateOrder(id: string, status: string) {
    return patch<{ data: unknown }>(`/api/admin/orders/${id}`, { status });
  },
  updateUser(id: string, body: { role?: string; status?: string }) {
    return patch<{ data: PublicUser }>(`/api/admin/users/${id}`, body);
  },
  createCar(body: Record<string, unknown>) {
    return post<{ data: CarWithBrand }>("/api/admin/cars", body);
  },
  updateCar(id: string, body: Record<string, unknown>) {
    return patch<{ data: CarWithBrand }>(`/api/admin/cars/${id}`, body);
  },
  deleteCar(id: string) {
    return del<{ data: { id: string } }>(`/api/admin/cars/${id}`);
  },
};
