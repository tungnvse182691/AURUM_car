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
  { id: "obsidian", name: "Obsidian Đen", hex: "#0A0907", price: 0, filter: "brightness(0.72) contrast(1.08) saturate(0.85)" },
  { id: "aurum-gold", name: "Aurum Gold", hex: "#D4AF37", price: 180_000_000, filter: "sepia(0.55) saturate(2.2) hue-rotate(-8deg) brightness(0.95)", metallic: true },
  { id: "champagne", name: "Champagne", hex: "#E8D5A3", price: 120_000_000, filter: "sepia(0.35) saturate(1.6) brightness(1.12)", metallic: true },
  { id: "rosso", name: "Rosso Corsa", hex: "#C8102E", price: 95_000_000, filter: "sepia(0.5) saturate(2.6) hue-rotate(-48deg) brightness(0.92)", metallic: true },
  { id: "blu", name: "Blu Notte", hex: "#1B2A4A", price: 95_000_000, filter: "sepia(0.4) saturate(2.2) hue-rotate(185deg) brightness(0.82)", metallic: true },
  { id: "verde", name: "Verde British", hex: "#1E3D2F", price: 95_000_000, filter: "sepia(0.45) saturate(2) hue-rotate(95deg) brightness(0.85)", metallic: true },
  { id: "grigio", name: "Grigio Titanio", hex: "#8A8D91", price: 60_000_000, filter: "grayscale(0.55) brightness(1.02) contrast(1.05)", metallic: true },
  { id: "bianco", name: "Bianco Puro", hex: "#F2F0EB", price: 60_000_000, filter: "grayscale(0.4) brightness(1.28) contrast(0.95)" },
  { id: "bordeaux", name: "Bordeaux", hex: "#5E1224", price: 110_000_000, filter: "sepia(0.5) saturate(2.4) hue-rotate(-60deg) brightness(0.78)", metallic: true },
  { id: "arancio", name: "Arancio Atlas", hex: "#E8590C", price: 110_000_000, filter: "sepia(0.6) saturate(2.8) hue-rotate(-25deg) brightness(0.98)", metallic: true },
];

export const WHEELS: WheelOption[] = [
  { id: "w-std", name: "Aurum Classic 20\"", desc: "5 chấu kép, bạc satin", price: 0 },
  { id: "w-sport", name: "Sport Forged 21\"", desc: "Đúc nguyên khối, đen mờ", price: 85_000_000 },
  { id: "w-carbon", name: "Carbon Aero 22\"", desc: "Sợi carbon, viền vàng", price: 220_000_000 },
  { id: "w-gold", name: "Gilded Apex 21\"", desc: "Mạ vàng champagne", price: 320_000_000 },
];

export const INTERIORS: InteriorOption[] = [
  { id: "i-noir", name: "Noir Nappa", hex: "#141210", price: 0 },
  { id: "i-cognac", name: "Cognac", hex: "#9A5B2E", price: 65_000_000 },
  { id: "i-ivory", name: "Ivory Silk", hex: "#EDE6D6", price: 65_000_000 },
  { id: "i-bordeaux", name: "Bordeaux", hex: "#5E1224", price: 80_000_000 },
  { id: "i-racing", name: "Racing Alcantara", hex: "#2A2A2E", price: 95_000_000 },
];

export const PACKAGES: PackageOption[] = [
  { id: "p-carbon", name: "Gói Carbon Exterior", desc: "Splitter, diffuser, cánh gió sợi carbon", price: 280_000_000 },
  { id: "p-exhaust", name: "Ống xả thể thao", desc: "Titan, van điều khiển âm thanh", price: 120_000_000 },
  { id: "p-track", name: "Gói Track", desc: "Phanh carbon-ceramic, treo thể thao", price: 350_000_000 },
  { id: "p-comfort", name: "Gói First Class", desc: "Ghế massage, rèm điện, âm thanh 3D", price: 190_000_000 },
  { id: "p-night", name: "Gói Night Vision", desc: "Camera hồng ngoại, HUD thực tế ảo", price: 150_000_000 },
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
  const paint = PAINTS.find((p) => p.id === s.paintId);
  const wheel = WHEELS.find((w) => w.id === s.wheelId);
  const interior = INTERIORS.find((i) => i.id === s.interiorId);
  const pkgs = PACKAGES.filter((p) => s.packageIds.includes(p.id));
  return {
    base,
    options: (paint?.price ?? 0) + (wheel?.price ?? 0) + (interior?.price ?? 0) + pkgs.reduce((sum, p) => sum + p.price, 0),
    breakdown: { paint, wheel, interior, pkgs },
  };
}
