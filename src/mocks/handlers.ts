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

/** Server-side RBAC: read Bearer token, return user or null.
 *  Sessions are in-memory; after a page reload the SW restarts with an empty
 *  map, so recover the session from the userId embedded in the token. */
function authUser(request: Request): User | null {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const hit = sessions.get(token);
  if (hit) return hit;
  const m = token.match(/^aurum-(.+)-[a-z0-9]+$/);
  if (m) {
    const user = users.find((u) => u.id === m[1] && u.status === "active");
    if (user) {
      sessions.set(token, user);
      return user;
    }
  }
  return null;
}

function requireRole(request: Request, roles: User["role"][]) {
  const user = authUser(request);
  if (!user) return { error: HttpResponse.json({ error: "Chưa đăng nhập" }, { status: 401 }) };
  if (!roles.includes(user.role))
    return { error: HttpResponse.json({ error: "Không có quyền truy cập" }, { status: 403 }) };
  return { user };
}

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

  // ── Register ─────────────────────────────────────────────
  http.post("/api/auth/register", async ({ request }) => {
    await LATENCY();
    const { name, email, phone, password } = (await request.json()) as Record<string, string>;
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return HttpResponse.json({ error: "Vui lòng điền đầy đủ, mật khẩu ≥ 6 ký tự" }, { status: 422 });
    }
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return HttpResponse.json({ error: "Email đã được đăng ký" }, { status: 409 });
    }
    const user: User = {
      id: `u-${Date.now().toString(36)}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() ?? "",
      passwordHash: password,
      role: "user",
      status: "active",
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    const token = `aurum-${user.id}-${Date.now().toString(36)}`;
    sessions.set(token, user);
    return HttpResponse.json({ data: { user: publicUser(user), token } }, { status: 201 });
  }),

  // ── Account: my bookings & orders ────────────────────────
  http.get("/api/account/bookings", async ({ request }) => {
    await LATENCY();
    const { user, error } = requireRole(request, ["user", "staff", "admin"]);
    if (error) return error;
    const mine = testDrives.filter((t) => t.userId === user.id || t.phone === user.phone);
    return HttpResponse.json({ data: mine });
  }),

  http.get("/api/account/orders", async ({ request }) => {
    await LATENCY();
    const { user, error } = requireRole(request, ["user", "staff", "admin"]);
    if (error) return error;
    const mine = orders.filter((o) => o.userId === user.id || o.phone === user.phone);
    return HttpResponse.json({ data: mine });
  }),

  // ── Admin: stats ─────────────────────────────────────────
  http.get("/api/admin/stats", async ({ request }) => {
    await LATENCY();
    const { error } = requireRole(request, ["admin", "staff"]);
    if (error) return error;
    const revenue = orders
      .filter((o) => o.status === "confirmed")
      .reduce((s, o) => s + Number(o.amount ?? 0), 0);
    return HttpResponse.json({
      data: {
        totalCars: cars.length,
        availableCars: cars.filter((c) => c.status === "available").length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        totalBookings: testDrives.length,
        pendingBookings: testDrives.filter((t) => t.status === "pending").length,
        totalUsers: users.length,
        revenue,
      },
    });
  }),

  // ── Admin: test-drives ───────────────────────────────────
  http.get("/api/admin/test-drives", async ({ request }) => {
    await LATENCY();
    const { error } = requireRole(request, ["admin", "staff"]);
    if (error) return error;
    const enriched = testDrives.map((t) => ({
      ...t,
      car: (() => {
        const c = cars.find((x) => x.id === t.carId);
        return c ? { ...withBrand(c), images: [c.images[0]] } : null;
      })(),
    }));
    return HttpResponse.json({ data: enriched });
  }),

  http.patch("/api/admin/test-drives/:id", async ({ request, params }) => {
    await LATENCY();
    const { error } = requireRole(request, ["admin", "staff"]);
    if (error) return error;
    const t = testDrives.find((x) => x.id === params.id);
    if (!t) return HttpResponse.json({ error: "Không tìm thấy lịch hẹn" }, { status: 404 });
    const { status } = (await request.json()) as { status?: string };
    if (status && ["pending", "confirmed", "done", "cancelled"].includes(status)) t.status = status;
    return HttpResponse.json({ data: t });
  }),

  // ── Admin: orders ────────────────────────────────────────
  http.get("/api/admin/orders", async ({ request }) => {
    await LATENCY();
    const { error } = requireRole(request, ["admin", "staff"]);
    if (error) return error;
    const enriched = orders.map((o) => ({
      ...o,
      car: (() => {
        const c = cars.find((x) => x.id === o.carId);
        return c ? { ...withBrand(c), images: [c.images[0]] } : null;
      })(),
    }));
    return HttpResponse.json({ data: enriched });
  }),

  http.patch("/api/admin/orders/:id", async ({ request, params }) => {
    await LATENCY();
    const { error } = requireRole(request, ["admin", "staff"]);
    if (error) return error;
    const o = orders.find((x) => x.id === params.id);
    if (!o) return HttpResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });
    const { status } = (await request.json()) as { status?: string };
    if (status && ["pending", "confirmed", "done", "cancelled", "refunded"].includes(status)) o.status = status;
    return HttpResponse.json({ data: o });
  }),

  // ── Admin: cars CRUD ─────────────────────────────────────
  http.post("/api/admin/cars", async ({ request }) => {
    await LATENCY();
    const { error } = requireRole(request, ["admin"]);
    if (error) return error;
    const body = (await request.json()) as Record<string, unknown>;
    if (!body.model || !body.brandId || !body.price) {
      return HttpResponse.json({ error: "Thiếu thông tin xe (model, hãng, giá)" }, { status: 422 });
    }
    const id = `c-${Date.now().toString(36)}`;
    const car = {
      id,
      slug: `${String(body.brandId)}-${String(body.model).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id}`,
      brandId: String(body.brandId),
      model: String(body.model),
      trim: String(body.trim ?? ""),
      year: Number(body.year ?? new Date().getFullYear()),
      price: Number(body.price),
      promoPrice: body.promoPrice ? Number(body.promoPrice) : undefined,
      mileage: Number(body.mileage ?? 0),
      vin: String(body.vin ?? `AURUM${Date.now().toString(36).toUpperCase()}`),
      plate: String(body.plate ?? ""),
      extColor: String(body.extColor ?? ""),
      intColor: String(body.intColor ?? ""),
      transmission: (body.transmission as string) ?? "AT",
      fuel: String(body.fuel ?? "Xăng"),
      engine: String(body.engine ?? ""),
      powerHp: Number(body.powerHp ?? 0),
      torqueNm: Number(body.torqueNm ?? 0),
      drivetrain: String(body.drivetrain ?? "AWD"),
      seats: Number(body.seats ?? 4),
      doors: Number(body.doors ?? 4),
      consumption: Number(body.consumption ?? 0),
      description: String(body.description ?? ""),
      features: Array.isArray(body.features) ? (body.features as string[]) : [],
      images: Array.isArray(body.images) && (body.images as string[]).length ? (body.images as string[]) : [],
      status: (body.status as string) ?? "available",
      isNew: Boolean(body.isNew),
      isFeatured: Boolean(body.isFeatured),
      views: 0,
      createdAt: new Date().toISOString(),
    };
    cars.push(car as (typeof cars)[number]);
    return HttpResponse.json({ data: withBrand(car as (typeof cars)[number]) }, { status: 201 });
  }),

  http.patch("/api/admin/cars/:id", async ({ request, params }) => {
    await LATENCY();
    const { error } = requireRole(request, ["admin"]);
    if (error) return error;
    const car = cars.find((c) => c.id === params.id);
    if (!car) return HttpResponse.json({ error: "Không tìm thấy xe" }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    const allowed = ["model", "trim", "year", "price", "promoPrice", "mileage", "extColor", "intColor", "transmission", "fuel", "engine", "powerHp", "torqueNm", "drivetrain", "seats", "doors", "consumption", "description", "features", "images", "status", "isNew", "isFeatured", "brandId"];
    for (const k of allowed) {
      if (body[k] !== undefined) (car as unknown as Record<string, unknown>)[k] = body[k];
    }
    return HttpResponse.json({ data: withBrand(car) });
  }),

  http.delete("/api/admin/cars/:id", async ({ request, params }) => {
    await LATENCY();
    const { error } = requireRole(request, ["admin"]);
    if (error) return error;
    const idx = cars.findIndex((c) => c.id === params.id);
    if (idx < 0) return HttpResponse.json({ error: "Không tìm thấy xe" }, { status: 404 });
    const [removed] = cars.splice(idx, 1);
    return HttpResponse.json({ data: { id: removed.id } });
  }),

  // ── Admin: users ─────────────────────────────────────────
  http.get("/api/admin/users", async ({ request }) => {
    await LATENCY();
    const { error } = requireRole(request, ["admin"]);
    if (error) return error;
    return HttpResponse.json({
      data: users.map((u) => ({
        ...publicUser(u),
        bookings: testDrives.filter((t) => t.userId === u.id || t.phone === u.phone).length,
        orders: orders.filter((o) => o.userId === u.id || o.phone === u.phone).length,
      })),
    });
  }),

  http.patch("/api/admin/users/:id", async ({ request, params }) => {
    await LATENCY();
    const { user: me, error } = requireRole(request, ["admin"]);
    if (error) return error;
    const u = users.find((x) => x.id === params.id);
    if (!u) return HttpResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
    const body = (await request.json()) as { role?: string; status?: string };
    if (body.role && ["user", "staff", "admin"].includes(body.role)) {
      // protect last admin
      if (u.role === "admin" && body.role !== "admin" && users.filter((x) => x.role === "admin" && x.status === "active").length <= 1) {
        return HttpResponse.json({ error: "Không thể hạ quyền admin cuối cùng" }, { status: 422 });
      }
      u.role = body.role as User["role"];
    }
    if (body.status && ["active", "locked"].includes(body.status)) {
      if (u.id === me.id && body.status === "locked") {
        return HttpResponse.json({ error: "Không thể khóa chính mình" }, { status: 422 });
      }
      u.status = body.status as User["status"];
    }
    return HttpResponse.json({ data: publicUser(u) });
  }),
];
