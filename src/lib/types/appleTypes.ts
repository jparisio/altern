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
