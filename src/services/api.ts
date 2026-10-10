import type { Brand, CarWithBrand } from "../types";

async function req<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Lỗi ${res.status}`);
  }
  return (await res.json()) as T;
}

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
};
