import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PaintOption {
  id: string;
  name: string;
  hex: string;
  price: number;
  /** CSS filter to grade the car photo toward this paint */
  filter: string;
  metallic?: boolean;
}

export interface WheelOption {
  id: string;
  name: string;
  desc: string;
  price: number;
}

export interface InteriorOption {
  id: string;
  name: string;
  hex: string;
  price: number;
}

export interface PackageOption {
  id: string;
  name: string;
  desc: string;
  price: number;
}

export const PAINTS: PaintOption[] = [
  { id: "obsidian", name: "Đen huyền", hex: "#0A0907", price: 0, filter: "brightness(0.72) contrast(1.08) saturate(0.85)" },
  { id: "pearl-white", name: "Trắng ngọc trai", hex: "#F2F0EB", price: 8_000_000, filter: "grayscale(0.4) brightness(1.28) contrast(0.95)" },
  { id: "silver", name: "Bạc titan", hex: "#8A8D91", price: 5_000_000, filter: "grayscale(0.55) brightness(1.02) contrast(1.05)", metallic: true },
  { id: "red", name: "Đỏ cá tính", hex: "#C8102E", price: 8_000_000, filter: "sepia(0.5) saturate(2.6) hue-rotate(-48deg) brightness(0.92)", metallic: true },
  { id: "blue", name: "Xanh dương", hex: "#1B2A4A", price: 8_000_000, filter: "sepia(0.4) saturate(2.2) hue-rotate(185deg) brightness(0.82)", metallic: true },
  { id: "orange", name: "Cam năng động", hex: "#E8590C", price: 10_000_000, filter: "sepia(0.6) saturate(2.8) hue-rotate(-25deg) brightness(0.98)", metallic: true },
  { id: "brown", name: "Nâu cà phê", hex: "#5E3A22", price: 5_000_000, filter: "sepia(0.5) saturate(1.8) hue-rotate(-30deg) brightness(0.85)" },
  { id: "gray", name: "Xám xi măng", hex: "#6B7280", price: 5_000_000, filter: "grayscale(0.5) brightness(1.0) contrast(1.02)" },
];

export const WHEELS: WheelOption[] = [
  { id: "w-std", name: "Tiêu chuẩn 15\"", desc: "5 chấu, bạc", price: 0 },
  { id: "w-sport", name: "Thể thao 16\"", desc: "Đúc, đen mờ", price: 12_000_000 },
  { id: "w-carbon", name: "Cao cấp 17\"", desc: "Phay xước, 2 tông màu", price: 22_000_000 },
  { id: "w-gold", name: "Đa chấu 16\"", desc: "Hợp kim nhôm, 2 tông màu", price: 18_000_000 },
];

export const INTERIORS: InteriorOption[] = [
  { id: "i-noir", name: "Đen", hex: "#141210", price: 0 },
  { id: "i-beige", name: "Be kem", hex: "#D4C5A9", price: 8_000_000 },
  { id: "i-gray", name: "Xám", hex: "#6B7280", price: 5_000_000 },
  { id: "i-brown", name: "Nâu da bò", hex: "#7A4A2A", price: 12_000_000 },
];

export const PACKAGES: PackageOption[] = [
  { id: "p-safety", name: "Gói An toàn", desc: "Cảm biến, camera 360, cảnh báo điểm mù", price: 25_000_000 },
  { id: "p-comfort", name: "Gói Tiện nghi", desc: "Điều hòa tự động, màn hình lớn, sạc không dây", price: 18_000_000 },
  { id: "p-style", name: "Gói Ngoại thất", desc: "Bodykit, cánh lướt gió, đèn LED", price: 22_000_000 },
  { id: "p-tech", name: "Gói Công nghệ", desc: "Cruise control, kết nối điện thoại, HUD", price: 15_000_000 },
];

export interface SavedBuild {
  id: string;
  carId: string;
  carName: string;
  paintId: string;
  wheelId: string;
  interiorId: string;
  packageIds: string[];
  totalPrice: number;
  createdAt: string;
}

interface StudioState {
  carId: string | null;
  paintId: string;
  wheelId: string;
  interiorId: string;
  packageIds: string[];
  builds: SavedBuild[];
  setCar: (id: string) => void;
  setPaint: (id: string) => void;
  setWheel: (id: string) => void;
  setInterior: (id: string) => void;
  togglePackage: (id: string) => void;
  saveBuild: (carName: string, totalPrice: number) => void;
  removeBuild: (id: string) => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      carId: null,
      paintId: "obsidian",
      wheelId: "w-std",
      interiorId: "i-noir",
      packageIds: [],
      builds: [],
      setCar: (carId) => set({ carId }),
      setPaint: (paintId) => set({ paintId }),
      setWheel: (wheelId) => set({ wheelId }),
      setInterior: (interiorId) => set({ interiorId }),
      togglePackage: (id) =>
        set((s) => ({
          packageIds: s.packageIds.includes(id)
            ? s.packageIds.filter((p) => p !== id)
            : [...s.packageIds, id],
        })),
      saveBuild: (carName, totalPrice) => {
        const s = get();
        if (!s.carId) return;
        const build: SavedBuild = {
          id: `build-${Date.now().toString(36)}`,
          carId: s.carId,
          carName,
          paintId: s.paintId,
          wheelId: s.wheelId,
          interiorId: s.interiorId,
          packageIds: [...s.packageIds],
          totalPrice,
          createdAt: new Date().toISOString(),
        };
        set((st) => ({ builds: [build, ...st.builds].slice(0, 12) }));
      },
      removeBuild: (id) => set((s) => ({ builds: s.builds.filter((b) => b.id !== id) })),
    }),
    { name: "aurum-studio" },
  ),
);

export function studioPrice(base: number, s: Pick<StudioState, "paintId" | "wheelId" | "interiorId" | "packageIds">) {
  // Fall back to defaults if a persisted id no longer exists (e.g. after catalog updates)
  const paint = PAINTS.find((p) => p.id === s.paintId) ?? PAINTS[0];
  const wheel = WHEELS.find((w) => w.id === s.wheelId) ?? WHEELS[0];
  const interior = INTERIORS.find((i) => i.id === s.interiorId) ?? INTERIORS[0];
  const pkgs = PACKAGES.filter((p) => s.packageIds.includes(p.id));
  return {
    base,
    options: (paint?.price ?? 0) + (wheel?.price ?? 0) + (interior?.price ?? 0) + pkgs.reduce((sum, p) => sum + p.price, 0),
    breakdown: { paint, wheel, interior, pkgs },
  };
}
