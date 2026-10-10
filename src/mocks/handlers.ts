import { http, HttpResponse } from "msw";
import { brands, cars, users } from "./db";
import type { CarWithBrand, User } from "../types";

const LATENCY = () => new Promise((r) => setTimeout(r, 250 + Math.random() * 450));

const brandName = (brandId: string) => brands.find((b) => b.id === brandId)?.name ?? brandId;
const withBrand = (c: (typeof cars)[number]): CarWithBrand => ({ ...c, brandName: brandName(c.brandId) });

// In-memory demo stores (reset on reload)
const testDrives: Record<string, unknown>[] = [];
const orders: Record<string, unknown>[] = [];
const sessions = new Map<string, User>();

const publicUser = (u: User) => {
  const { passwordHash: _, ...rest } = u;
  return rest;
};

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

  // ── Auth ─────────────────────────────────────────────────
  http.post("/api/auth/login", async ({ request }) => {
    await LATENCY();
    const { email, password } = (await request.json()) as { email?: string; password?: string };
    const user = users.find((u) => u.email.toLowerCase() === (email ?? "").toLowerCase().trim());
    if (!user || user.passwordHash !== password) {
      return HttpResponse.json({ error: "Email hoặc mật khẩu chưa đúng" }, { status: 401 });
    }
    if (user.status === "locked") {
      return HttpResponse.json({ error: "Tài khoản đã bị khóa" }, { status: 403 });
    }
    const token = `aurum-${user.id}-${Date.now().toString(36)}`;
    sessions.set(token, user);
    return HttpResponse.json({ data: { user: publicUser(user), token } });
  }),

  http.get("/api/auth/me", async ({ request }) => {
    await LATENCY();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = token ? sessions.get(token) : undefined;
    if (!user) return HttpResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    return HttpResponse.json({ data: { user: publicUser(user) } });
  }),

  // ── Test drive ───────────────────────────────────────────
  http.post("/api/test-drives", async ({ request }) => {
    await LATENCY();
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.carId || !body.date || !body.slot || !body.name || !body.phone) {
      return HttpResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 422 });
    }
    const booking = {
      id: `td-${Date.now().toString(36)}`,
      ...body,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    testDrives.push(booking);
    return HttpResponse.json({ data: booking }, { status: 201 });
  }),

  // ── Orders (deposit) ─────────────────────────────────────
  http.post("/api/orders", async ({ request }) => {
    await LATENCY();
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.carId || !body.amount || !body.name || !body.phone) {
      return HttpResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 422 });
    }
    const order = {
      id: `ord-${Date.now().toString(36)}`,
      ...body,
      type: "deposit",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    return HttpResponse.json({ data: order }, { status: 201 });
  }),
];
