import { create } from "zustand";

interface MusicStore {
  userToken: string | null;
  setUserToken: (token: string) => void;
  clearUserToken: () => void;
}

export const useMusicStore = create<MusicStore>((set) => ({
  userToken: null,
  setUserToken: (token) => set({ userToken: token }),
  clearUserToken: () => set({ userToken: null }),
}));
