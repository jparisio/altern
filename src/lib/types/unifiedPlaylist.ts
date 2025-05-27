export interface UnifiedImage {
  url: string;
  width?: number;
  height?: number;
}

export interface UnifiedTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  durationMs: number;
  previewUrl?: string;
}

export interface UnifiedPlaylist {
  id: string;
  name: string;
  description?: string;
  images: UnifiedImage[];
  tracks: UnifiedTrack[];
  source: "spotify" | "apple";
}
