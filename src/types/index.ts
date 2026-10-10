/** AURUM MOTORS — domain data models (mock API first, real backend later) */

export type Role = "admin" | "staff" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string; // mock only
  role: Role;
  status: "active" | "locked";
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export type CarStatus = "available" | "reserved" | "sold" | "hidden";

export type BodyStyle = "sedan" | "suv" | "hatchback" | "pickup" | "mpv";

export interface Car {
  id: string;
  slug: string;
  brandId: string;
  model: string;
  trim: string;
  year: number;
  price: number; // VND
  promoPrice?: number; // VND
  mileage: number; // km
  vin: string;
  plate: string;
  extColor: string;
  intColor: string;
  transmission: "AT" | "MT";
  fuel: "Xăng" | "Dầu" | "Hybrid" | "Điện";
  engine: string;
  powerHp: number;
  torqueNm: number;
  drivetrain: string;
  seats: number;
  doors: number;
  consumption: number; // L/100km
  description: string;
  features: string[];
  images: string[];
  status: CarStatus;
  isNew: boolean;
  isFeatured: boolean;
  views: number;
  staffId?: string;
  createdAt: string;
  bodyStyle: BodyStyle; // 3D model style for Studio
}

export interface Favorite {
  userId: string;
  carId: string;
  createdAt: string;
}

export type TestDriveStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface TestDrive {
  id: string;
  userId: string;
  carId: string;
  staffId?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "09:00"
  status: TestDriveStatus;
  note: string;
  result?: string;
  createdAt: string;
}

export type LeadStatus = "new" | "contacted" | "appointment" | "negotiating" | "won" | "lost";

export interface LeadNote {
  at: string;
  by: string;
  text: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  carId?: string;
  source: "contact" | "testdrive" | "quote";
  staffId?: string;
  status: LeadStatus;
  notes: LeadNote[];
  createdAt: string;
}

export interface Quote {
  id: string;
  leadId?: string;
  userId?: string;
  carId: string;
  staffId: string;
  price: number;
  discount: number;
  fees: number;
  total: number;
  payMethod: "cash" | "loan";
  status: "draft" | "sent" | "accepted" | "rejected";
  validUntil: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "contracted"
  | "paid"
  | "delivered"
  | "cancelled";

export interface OrderTimeline {
  at: string;
  status: OrderStatus;
  by: string;
}

export interface Order {
  id: string;
  code: string;
  userId: string;
  carId: string;
  staffId?: string;
  deposit: number;
  totalValue: number;
  payMethod: "cash" | "loan";
  status: OrderStatus;
  timeline: OrderTimeline[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "lead" | "appointment" | "order" | "pricedrop";
  read: boolean;
  createdAt: string;
}

/** Enriched car with brand name resolved (for UI) */
export interface CarWithBrand extends Car {
  brandName: string;
}
