interface PlaylistAttributes {
  name: string;
  description?: {
    standard: string;
  };
  artwork?: {
    width: number;
    height: number;
    url: string;
  };
  lastModifiedDate?: string;
  playlistType?: "user-shared" | "editorial" | "external";
  curatorName?: string;
  isPublic?: boolean;
}

interface PlaylistRelationship {
  href: string;
  data: Array<{
    id: string;
    type: string;
    href?: string;
  }>;
}

interface PlaylistRelationships {
  tracks?: PlaylistRelationship;
  curator?: PlaylistRelationship;
}

export interface AppleMusicPlaylist {
  id: string;
  type: "playlists";
  href: string;
  attributes?: PlaylistAttributes;
  relationships?: PlaylistRelationships;
}

export interface AppleMusicPlaylistsResponse {
  data: AppleMusicPlaylist[];
  meta: {
    total: number;
  };
}

export interface AppleMusicTrackAttributes {
  name: string;
  durationInMillis?: number;
  artistName?: string;
  artistNames?: string[];
  artists?: Array<{ name: string }>;
}

export interface AppleMusicTrackData {
  id: string;
  type: string;
  attributes: AppleMusicTrackAttributes;
}

export interface AppleMusicTracksResponse {
  data: AppleMusicTrackData[];
  next?: string; // pagination url if any
  links?: {
    next?: string;
  };
}

export interface ExportedTrack {
  id: string;
  name: string;
  artists: string[];
  durationMs: number;
}

export interface ExportTracksResponse {
  exportId: string;
  tracksCount: number;
  tracks: ExportedTrack[];
}
