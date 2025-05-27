import { create } from "zustand";

interface ExportModalState {
  isOpen: boolean;
  isExporting: boolean;
  playlistId?: string;
  playlistName?: string;
  playlistDescription?: string;
  openModal: (info: {
    playlistId: string;
    playlistName: string;
    playlistDescription: string;
  }) => void;
  closeModal: () => void;
  setExporting: (value: boolean) => void;
}

export const useExportModalStore = create<ExportModalState>((set) => ({
  isOpen: false,
  isExporting: false,
  playlistId: undefined,
  playlistName: undefined,
  playlistDescription: undefined,
  openModal: ({ playlistId, playlistName, playlistDescription }) =>
    set({
      isOpen: true,
      isExporting: false,
      playlistId,
      playlistName,
      playlistDescription,
    }),
  closeModal: () =>
    set({ isOpen: false, isExporting: false, playlistId: undefined }),
  setExporting: (value) => set({ isExporting: value }),
}));
