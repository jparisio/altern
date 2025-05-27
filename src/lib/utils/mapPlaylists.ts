// src/adapters/spotifyToUnified.ts
// src/adapters/appleToUnified.ts
import { UnifiedPlaylist } from "@/lib/types/unifiedPlaylist";
import SpotifyPlaylist from "@/lib/types/spotifyTypes";
import { AppleMusicPlaylist } from "@/lib/types/appleTypes";

export function mapSpotifyToUnified(
  playlist: SpotifyPlaylist
): UnifiedPlaylist {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    images: playlist.images.map((img) => ({
      url: img.url,
      width: img.width ?? undefined,
      height: img.height ?? undefined,
    })),
    tracks: playlist.tracks.items.map((item) => {
      const track = item.track;
      return {
        id: track.id,
        name: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        album: track.album.name,
        durationMs: track.duration_ms,
        previewUrl: track.preview_url ?? undefined,
      };
    }),
    source: "spotify",
  };
}

export function mapAppleToUnified(
  playlist: AppleMusicPlaylist
): UnifiedPlaylist {
  return {
    id: playlist.id,
    name: playlist.attributes?.name ?? "Untitled Playlist",
    description: playlist.attributes?.description?.standard ?? "",
    images: playlist.attributes?.artwork
      ? [
          {
            url: playlist.attributes.artwork.url
              .replace("{w}", "300")
              .replace("{h}", "300"),
            width: 300,
            height: 300,
          },
        ]
      : [],
    tracks: (playlist.relationships?.tracks?.data ?? [])
      .filter((track) => !!(track as any).attributes)
      .map((track) => {
        const attributes = (track as any).attributes;
        return {
          id: track.id,
          name: attributes?.name ?? "",
          artist: attributes?.artistName ?? "",
          album: attributes?.albumName ?? "",
          durationMs: attributes?.durationInMillis ?? 0,
        };
      }),
    source: "apple",
  };
}
