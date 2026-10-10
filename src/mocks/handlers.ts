import { http, HttpResponse } from "msw";
import { brands, cars } from "./db";
import type { CarWithBrand } from "../types";

const LATENCY = () => new Promise((r) => setTimeout(r, 250 + Math.random() * 450));

const brandName = (brandId: string) => brands.find((b) => b.id === brandId)?.name ?? brandId;
const withBrand = (c: (typeof cars)[number]): CarWithBrand => ({ ...c, brandName: brandName(c.brandId) });

export const handlers = [
  // ── Catalog ──────────────────────────────────────────────
  http.get("/api/cars", async ({ request }) => {
    await LATENCY();
    const url = new URL(request.url);
    const brand = url.searchParams.get("brand");
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const sort = url.searchParams.get("sort") ?? "featured";
    const minPrice = Number(url.searchParams.get("minPrice") ?? 0);
    const maxPrice = Number(url.searchParams.get("maxPrice") ?? Infinity);
    const status = url.searchParams.get("status");

    let list = cars.filter((c) => c.status !== "hidden");
    if (brand) list = list.filter((c) => c.brandId === brand);
    if (status) list = list.filter((c) => c.status === status);
    if (q)
      list = list.filter((c) =>
        `${brandName(c.brandId)} ${c.model} ${c.trim}`.toLowerCase().includes(q),
      );
    list = list.filter((c) => (c.promoPrice ?? c.price) >= minPrice && (c.promoPrice ?? c.price) <= maxPrice);

    const priceOf = (c: (typeof list)[number]) => c.promoPrice ?? c.price;
    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
        break;
      case "price-desc":
        list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
        break;
      case "newest":
        list = [...list].sort((a, b) => b.year - a.year);
        break;
      case "power":
        list = [...list].sort((a, b) => b.powerHp - a.powerHp);
        break;
      default:
        list = [...list].sort(
          (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.views - a.views,
        );
    }
    return HttpResponse.json({ data: list.map(withBrand), total: list.length });
  }),

  http.get("/api/cars/featured", async () => {
    await LATENCY();
    const list = cars.filter((c) => c.isFeatured && c.status === "available").map(withBrand);
    return HttpResponse.json({ data: list });
  }),

  http.get("/api/cars/:slug", async ({ params }) => {
    await LATENCY();
    const car = cars.find((c) => c.slug === params.slug);
    if (!car) return HttpResponse.json({ error: "Không tìm thấy xe" }, { status: 404 });
    const related = cars
      .filter((c) => c.id !== car.id && (c.brandId === car.brandId || Math.abs(c.price - car.price) < car.price * 0.4))
      .slice(0, 4)
      .map(withBrand);
    return HttpResponse.json({ data: { ...withBrand(car), related } });
  }),

  http.get("/api/brands", async () => {
    await LATENCY();
    const withCount = brands.map((b) => ({
      ...b,
      count: cars.filter((c) => c.brandId === b.id && c.status === "available").length,
    }));
    return HttpResponse.json({ data: withCount });
  }),
];
