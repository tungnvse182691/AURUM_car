import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ShopState {
  favorites: string[]; // car ids
  compare: string[]; // car ids, max 3
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleCompare: (id: string) => boolean; // returns false if limit reached
  isComparing: (id: string) => boolean;
  clearCompare: () => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      favorites: [],
      compare: [],
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      isFavorite: (id) => get().favorites.includes(id),
      toggleCompare: (id) => {
        const { compare } = get();
        if (compare.includes(id)) {
          set({ compare: compare.filter((c) => c !== id) });
          return true;
        }
        if (compare.length >= 3) return false;
        set({ compare: [...compare, id] });
        return true;
      },
      isComparing: (id) => get().compare.includes(id),
      clearCompare: () => set({ compare: [] }),
    }),
    { name: "aurum-shop" },
  ),
);
