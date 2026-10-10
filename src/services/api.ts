import type { Brand, CarWithBrand, User } from "../types";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
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

export interface CarListParams {
  brand?: string;
  q?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
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
    return post<{ data: { user: Omit<User, "passwordHash">; token: string } }>("/api/auth/login", { email, password });
  },
  bookTestDrive(body: { carId: string; date: string; slot: string; name: string; phone: string; note?: string }) {
    return post<{ data: { id: string } }>("/api/test-drives", body);
  },
  createDeposit(body: { carId: string; amount: number; name: string; phone: string }) {
    return post<{ data: { id: string } }>("/api/orders", body);
  },
};
