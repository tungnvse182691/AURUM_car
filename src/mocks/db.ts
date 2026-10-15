import type { Brand, Car, User } from "../types";

/**
 * AURUM — mock database.
 * Images: Unsplash CDN URLs only (no local files). Each ID curl-verified HTTP 200.
 * Cars: mainstream Vietnamese market (2026-10-10). 3D: procedural license-clean models.
 */
const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

export const IMG = {
  heroStreet: u("1449965408869-eaa3f722e40d", 2000),
  // ---- Mainstream inventory: exact model photos (Wikimedia Commons, verified 200) ----
  // Sedans
  vios: "https://commons.wikimedia.org/wiki/Special:FilePath/Toyota%20Vios%20%28XP150%29%20sedan%20front%20view.jpg?width=1600",
  city: "https://commons.wikimedia.org/wiki/Special:FilePath/2021%20Honda%20City%201.5%20GN2%20%2820211117%29.jpg?width=1600",
  accent: u("1619767886558-efdc259cde1a"), // Hyundai Accent
  mazda3Sedan: "https://commons.wikimedia.org/wiki/Special:FilePath/2019%20Mazda%203%202.0SP%20Sedan.jpg?width=1600",
  k3: "https://commons.wikimedia.org/wiki/Special:FilePath/Kia%20K3%20II%20003.jpg?width=1600",
  altis: u("1619682817481-e994891cd1f5"), // Toyota Corolla Altis
  // SUVs
  corollaCross: "https://commons.wikimedia.org/wiki/Special:FilePath/2022%20Toyota%20Corolla%20Cross%20L%20FWD%2C%20Front%20Left%2C%2011-21-2021.jpg?width=1600",
  crv: u("1519641471654-76ce0107ad1b"), // Honda CR-V
  tucson: "https://commons.wikimedia.org/wiki/Special:FilePath/Hyundai_Tucson_1.6_T_Hybrid_2025_(13).jpg?width=1600",
  cx5: "https://commons.wikimedia.org/wiki/Special:FilePath/Mazda%20CX-5%202024Winter.jpg?width=1600",
  seltos: "https://commons.wikimedia.org/wiki/Special:FilePath/Kia%20Seltos%20%28SP3%29%20IMG%207812.jpg?width=1600",
  territory: "https://commons.wikimedia.org/wiki/Special:FilePath/Ford%20Territory%20China%20003.jpg?width=1600",
  // Hatchbacks
  yaris: "https://commons.wikimedia.org/wiki/Special:FilePath/Toyota%20Yaris%20X%20%2720%20%281%29.jpg?width=1600",
  mazda3Hb: u("1599491143816-8c1ea12a4e06"), // Mazda 3 hatchback
  // Pickups
  ranger: "https://commons.wikimedia.org/wiki/Special:FilePath/Ford%20Ranger%20%28T6%2C%20P703%29%20Wildtrak%20IMG%207320.jpg?width=1600",
  hilux: "https://commons.wikimedia.org/wiki/Special:FilePath/2026%20Toyota%20Hilux%20Z.jpg?width=1600",
  // MPVs
  xpander: "https://commons.wikimedia.org/wiki/Special:FilePath/Mitsubishi%20Xpander%20Cross%202023%20%283%20-%20Cropped%29.jpg?width=1600",
  innova: "https://commons.wikimedia.org/wiki/Special:FilePath/2022%20Toyota%20Kijang%20Innova%20Zenix%20V%20%28Indonesia%29%20front%20view.jpg?width=1600",
  // Detail/gallery shots
  headlightDetail: u("1542282088-fe8426682b8f"),
  garage: u("1492144534655-ae79c964c9d7"),
  interiorDrive: u("1449965408869-eaa3f722e40d"),
} as const;

export const brands: Brand[] = [
  { id: "toyota", name: "Toyota", slug: "toyota" },
  { id: "honda", name: "Honda", slug: "honda" },
  { id: "hyundai", name: "Hyundai", slug: "hyundai" },
  { id: "kia", name: "Kia", slug: "kia" },
  { id: "mazda", name: "Mazda", slug: "mazda" },
  { id: "ford", name: "Ford", slug: "ford" },
  { id: "mitsubishi", name: "Mitsubishi", slug: "mitsubishi" },
  { id: "suzuki", name: "Suzuki", slug: "suzuki" },
];

const gallery = (main: string) => [main, IMG.headlightDetail, IMG.interiorDrive, IMG.garage];

/** Helper to build a car entry with sensible defaults */
function mk(o: Partial<Car> & Pick<Car, "id" | "slug" | "brandId" | "model" | "price" | "bodyStyle" | "images">): Car {
  return {
    trim: "Tiêu chuẩn",
    year: 2024,
    mileage: 0,
    vin: "AUR" + o.id.toUpperCase() + "2024001",
    plate: "51K-123.45",
    extColor: "Trắng",
    intColor: "Đen",
    transmission: "AT",
    fuel: "Xăng",
    engine: "I4 1.5L",
    powerHp: 110,
    torqueNm: 140,
    drivetrain: "FWD",
    seats: 5,
    doors: 4,
    consumption: 6.5,
    description: "",
    features: ["Điều hòa tự động", "Màn hình cảm ứng", "Camera lùi", "Cảm biến đỗ xe"],
    status: "available",
    isNew: true,
    isFeatured: false,
    views: 100,
    createdAt: "2026-10-10",
    ...o,
  } as Car;
}

export const cars: Car[] = [
  // ---- SEDAN ----
  mk({
    id: "c01", slug: "toyota-vios-g-2024", brandId: "toyota", model: "Vios G", price: 530_000_000,
    bodyStyle: "sedan", images: gallery(IMG.vios), isFeatured: true,
    engine: "I4 1.5L", powerHp: 107, torqueNm: 140, consumption: 5.8,
    description: "Sedan hạng B bán chạy nhất Việt Nam: bền bỉ, tiết kiệm, chi phí sử dụng thấp.",
  }),
  mk({
    id: "c02", slug: "honda-city-rs-2024", brandId: "honda", model: "City RS", price: 580_000_000,
    bodyStyle: "sedan", images: gallery(IMG.city),
    engine: "I4 1.5L i-VTEC", powerHp: 119, torqueNm: 145, consumption: 5.9,
    description: "Thiết kế thể thao RS, vận hành linh hoạt, nội thất rộng rãi hàng đầu phân khúc.",
  }),
  mk({
    id: "c03", slug: "hyundai-accent-2024", brandId: "hyundai", model: "Accent", trim: "1.4 AT Đặc biệt",
    price: 540_000_000, bodyStyle: "sedan", images: gallery(IMG.accent),
    engine: "I4 1.4L", powerHp: 100, torqueNm: 132, consumption: 6.1,
    description: "Sedan Hàn Quốc trẻ trung, nhiều tiện nghi, giá hợp lý cho gia đình trẻ.",
  }),
  mk({
    id: "c04", slug: "mazda-3-15-2024", brandId: "mazda", model: "3 1.5", trim: "Signature",
    price: 750_000_000, bodyStyle: "sedan", images: gallery(IMG.mazda3Sedan), isFeatured: true,
    engine: "I4 1.5L SkyActiv", powerHp: 110, torqueNm: 146, consumption: 5.9,
    description: "Ngôn ngữ Kodo tinh tế, cảm giác lái thể thao, nội thất chỉn chu hàng đầu phân khúc.",
  }),
  mk({
    id: "c05", slug: "kia-k3-20-2024", brandId: "kia", model: "K3 2.0", trim: "Premium",
    price: 650_000_000, bodyStyle: "sedan", images: gallery(IMG.k3),
    engine: "I4 2.0L", powerHp: 150, torqueNm: 192, consumption: 6.8,
    description: "Sedan hạng C rộng rãi, động cơ 2.0L mạnh mẽ, nhiều công nghệ an toàn.",
  }),
  mk({
    id: "c06", slug: "toyota-corolla-altis-2024", brandId: "toyota", model: "Corolla Altis", trim: "1.8V",
    price: 800_000_000, bodyStyle: "sedan", images: gallery(IMG.altis),
    engine: "I4 1.8L", powerHp: 138, torqueNm: 172, consumption: 6.5,
    description: "Huyền thoại sedan hạng C: bền bỉ, giữ giá, vận hành êm ái.",
  }),
  // ---- SUV ----
  mk({
    id: "c07", slug: "toyota-corolla-cross-2024", brandId: "toyota", model: "Corolla Cross", trim: "1.8V",
    price: 850_000_000, bodyStyle: "suv", images: gallery(IMG.corollaCross), isFeatured: true,
    engine: "I4 1.8L", powerHp: 138, torqueNm: 172, consumption: 6.9, seats: 5, doors: 5,
    description: "SUV đô thị bán chạy: gầm cao, tiết kiệm, an toàn Toyota Safety Sense.",
  }),
  mk({
    id: "c08", slug: "honda-crv-2024", brandId: "honda", model: "CR-V", trim: "L AWD",
    price: 1_080_000_000, bodyStyle: "suv", images: gallery(IMG.crv),
    engine: "I4 1.5L Turbo", powerHp: 188, torqueNm: 240, consumption: 7.5, seats: 7, doors: 5,
    description: "SUV 7 chỗ mạnh mẽ với turbo, Honda Sensing toàn diện, không gian linh hoạt.",
  }),
  mk({
    id: "c09", slug: "hyundai-tucson-2024", brandId: "hyundai", model: "Tucson", trim: "2.0 Xăng Đặc biệt",
    price: 920_000_000, bodyStyle: "suv", images: gallery(IMG.tucson),
    engine: "I4 2.0L", powerHp: 154, torqueNm: 192, consumption: 7.8, seats: 5, doors: 5,
    description: "Thiết kế parametric độc đáo, nội thất hiện đại, vận hành cân bằng.",
  }),
  mk({
    id: "c10", slug: "mazda-cx5-2024", brandId: "mazda", model: "CX-5", trim: "2.5 Signature",
    price: 880_000_000, bodyStyle: "suv", images: gallery(IMG.cx5),
    engine: "I4 2.5L SkyActiv", powerHp: 188, torqueNm: 252, consumption: 7.9, seats: 5, doors: 5,
    description: "SUV Nhật Bản cao cấp: thiết kế Kodo, lái hay, cách âm tốt.",
  }),
  mk({
    id: "c11", slug: "kia-seltos-2024", brandId: "kia", model: "Seltos", trim: "1.4 Turbo Premium",
    price: 720_000_000, bodyStyle: "suv", images: gallery(IMG.seltos),
    engine: "I4 1.4L Turbo", powerHp: 138, torqueNm: 242, consumption: 7.0, seats: 5, doors: 5,
    description: "SUV cỡ B trẻ trung, turbo mạnh mẽ, nhiều tiện nghi thông minh.",
  }),
  mk({
    id: "c12", slug: "ford-territory-2024", brandId: "ford", model: "Territory", trim: "Titanium",
    price: 820_000_000, bodyStyle: "suv", images: gallery(IMG.territory),
    engine: "I4 1.5L Turbo", powerHp: 160, torqueNm: 248, consumption: 7.5, seats: 5, doors: 5,
    description: "SUV Mỹ rộng rãi, công nghệ Ford Co-Pilot360, giá cạnh tranh.",
  }),
  // ---- HATCHBACK ----
  mk({
    id: "c13", slug: "toyota-yaris-2024", brandId: "toyota", model: "Yaris", trim: "G",
    price: 650_000_000, bodyStyle: "hatchback", images: gallery(IMG.yaris),
    engine: "I4 1.5L", powerHp: 107, torqueNm: 140, consumption: 5.7, seats: 5, doors: 5,
    description: "Hatchback đô thị linh hoạt, tiết kiệm, dễ đỗ xe trong phố.",
  }),
  mk({
    id: "c14", slug: "mazda-3-hatchback-2024", brandId: "mazda", model: "3 Hatchback", trim: "Premium",
    price: 820_000_000, bodyStyle: "hatchback", images: gallery(IMG.mazda3Hb),
    engine: "I4 2.0L SkyActiv", powerHp: 153, torqueNm: 200, consumption: 6.5, seats: 5, doors: 5,
    description: "Hatchback đẹp nhất phân khúc: Kodo design, nội thất tiện nghi hiện đại.",
  }),
  // ---- PICKUP ----
  mk({
    id: "c15", slug: "ford-ranger-2024", brandId: "ford", model: "Ranger", trim: "Wildtrak 2.0",
    price: 920_000_000, bodyStyle: "pickup", images: gallery(IMG.ranger),
    engine: "I4 2.0L Turbo Diesel", fuel: "Dầu", powerHp: 170, torqueNm: 405, consumption: 8.5,
    seats: 5, doors: 4, drivetrain: "4WD",
    description: "Vua bán tải Việt Nam: mạnh mẽ, đa dụng, off-road ấn tượng.",
  }),
  mk({
    id: "c16", slug: "toyota-hilux-2024", brandId: "toyota", model: "Hilux", trim: "2.8 Adventure",
    price: 860_000_000, bodyStyle: "pickup", images: gallery(IMG.hilux),
    engine: "I4 2.8L Diesel", fuel: "Dầu", powerHp: 201, torqueNm: 500, consumption: 8.8,
    seats: 5, doors: 4, drivetrain: "4WD",
    description: "Bán tải bền bỉ huyền thoại, động cơ diesel mạnh mẽ, giữ giá tốt.",
  }),
  // ---- MPV ----
  mk({
    id: "c17", slug: "mitsubishi-xpander-2024", brandId: "mitsubishi", model: "Xpander", trim: "Cross",
    price: 650_000_000, bodyStyle: "mpv", images: gallery(IMG.xpander),
    engine: "I4 1.5L", powerHp: 104, torqueNm: 141, consumption: 6.5, seats: 7, doors: 5,
    description: "MPV 7 chỗ quốc dân: rộng rãi, tiết kiệm, phù hợp gia đình đông người.",
  }),
  mk({
    id: "c18", slug: "toyota-innova-cross-2024", brandId: "toyota", model: "Innova Cross", trim: "2.0V Hybrid",
    price: 880_000_000, bodyStyle: "mpv", images: gallery(IMG.innova),
    engine: "I4 2.0L Hybrid", fuel: "Hybrid", powerHp: 172, torqueNm: 205, consumption: 5.2,
    seats: 7, doors: 5,
    description: "MPV hybrid tiết kiệm vượt trội, êm ái, công nghệ Toyota Hybrid mới nhất.",
  }),
];

export const users: User[] = [
  {
    id: "u-admin",
    name: "Quản trị viên",
    email: "admin@aurum.vn",
    phone: "0909000001",
    passwordHash: "aurum123",
    role: "admin",
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "u-staff",
    name: "Trần Minh Đức",
    email: "staff@aurum.vn",
    phone: "0909000002",
    passwordHash: "aurum123",
    role: "staff",
    status: "active",
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "u-user",
    name: "Khách hàng Demo",
    email: "user@aurum.vn",
    phone: "0909000003",
    passwordHash: "aurum123",
    role: "user",
    status: "active",
    createdAt: "2026-03-01T00:00:00Z",
  },
];

/** Format VND: 11500000000 -> "11,5 tỷ" */
export function formatVND(n: number): string {
  if (n >= 1_000_000_000) {
    const ty = n / 1_000_000_000;
    return `${ty % 1 === 0 ? ty : ty.toFixed(1).replace(".", ",")} tỷ`;
  }
  return `${Math.round(n / 1_000_000)} triệu`;
}

/** Format VND full: 11500000000 -> "11.500.000.000 ₫" */
export function formatVNDFull(n: number): string {
  return `${n.toLocaleString("vi-VN")} ₫`;
}
