import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface MusicState {
  userToken: string | null;
  setUserToken: (token: string) => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set) => ({
      userToken: null,
      setUserToken: (token) => set({ userToken: token }),
    }),
    {
      name: "music-storage",
      storage: createJSONStorage(() => localStorage), // <- use createJSONStorage here
    }
  )
);
