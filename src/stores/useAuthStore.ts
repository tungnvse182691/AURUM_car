import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";
import type { User } from "../types";

interface AuthState {
  user: Omit<User, "passwordHash"> | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        const res = await api.login(email, password);
        set({ user: res.data.user, token: res.data.token });
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: "aurum-auth" },
  ),
);
