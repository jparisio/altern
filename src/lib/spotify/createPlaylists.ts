// lib/spotify/createSpotifyPlaylist.ts

import type SpotifyPlaylist from "@/lib/types/spotifyTypes"; // or wherever you defined it
import type { CreatePlaylistOptions } from "@/lib/types/spotifyTypes"; // Adjust the import path as necessary

export async function createSpotifyPlaylist(
  userId: string,
  accessToken: string,
  options: CreatePlaylistOptions
): Promise<SpotifyPlaylist> {
  const { name, description = "", isPublic = false } = options;

  const res = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(
      `Failed to create playlist: ${res.status} - ${error.error?.message}`
    );
  }

  const playlist: SpotifyPlaylist = await res.json();
  return playlist;
}
