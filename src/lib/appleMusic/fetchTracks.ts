import {
  AppleMusicTrackData,
  AppleMusicTracksResponse,
  ExportedTrack,
} from "@/lib/types/appleTypes";

export async function getAppleMusicTracks(
  playlistId: string,
  userToken: string,
  devToken: string
): Promise<ExportedTrack[]> {
  const allTracks: ExportedTrack[] = [];
  let url:
    | string
    | null = `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`;

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${devToken}`,
        "Music-User-Token": userToken,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch Apple Music tracks");
    }

    const data: AppleMusicTracksResponse = await res.json();

    data.data.forEach((item: AppleMusicTrackData) => {
      const attributes = item.attributes;
      if (!attributes) return;

      const trackName = attributes.name || "Untitled";
      const durationMs = attributes.durationInMillis ?? 0;

      const artistNames =
        attributes.artistNames ??
        (
          attributes.artists?.map((a) => a.name) ?? [attributes.artistName]
        ).filter(Boolean);

      allTracks.push({
        id: item.id,
        name: trackName,
        artists: artistNames.filter(
          (name): name is string => typeof name === "string"
        ),
        durationMs,
      });
    });

    const base = "https://api.music.apple.com";
    url = data.next
      ? data.next.startsWith("http")
        ? data.next
        : `${base}${data.next}`
      : data.links?.next?.startsWith("http")
      ? data.links?.next
      : data.links?.next
      ? `${base}${data.links.next}`
      : null;
  }

  return allTracks;
}
